const map = document.getElementById("map");

map.src = "fullmap.png";

// -------------------------
// Canvas (hidden pixel reader)
// -------------------------
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "fullmap.png";

img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
};

// -------------------------
// 🌍 Nation Data (color-tolerant system)
// -------------------------
const nations = [
    {
        color: [255, 0, 0],
        name: "ALTA",
        allies: [],
        rivals: [],
        population: "120,000",
        provinces: 5,
        tech: 1,
        stability: "Max"
    }
];

// -------------------------
// 🎨 Improved color matching (handles duplicates better)
// -------------------------
function colorDistance(a, b) {
    return Math.abs(a[0] - b[0]) +
           Math.abs(a[1] - b[1]) +
           Math.abs(a[2] - b[2]);
}

// Group similar pixels more aggressively
function getNation(pixel) {
    const c = [pixel[0], pixel[1], pixel[2]];

    // ignore ocean / white noise
    if (c[0] > 245 && c[1] > 245 && c[2] > 245) return null;
    if (c[0] < 10 && c[1] < 10 && c[2] < 10) return null;

    let best = null;
    let bestScore = 999999;

    for (const n of nations) {
        const d = colorDistance(c, n.color);

        // MUCH looser threshold to handle duplicates & noisy map
        if (d < bestScore) {
            bestScore = d;
            best = n;
        }
    }

    return bestScore < 80 ? best : null;
}

// -------------------------
// 📦 UI
// -------------------------
function showInfo(n) {
    document.getElementById("infoPanel").classList.remove("hidden");

    document.getElementById("nationName").innerText = n.name;
    document.getElementById("allies").innerText = n.allies.join(", ") || "None";
    document.getElementById("rivals").innerText = n.rivals.join(", ") || "None";
    document.getElementById("population").innerText = n.population;
    document.getElementById("provinces").innerText = n.provinces;
    document.getElementById("tech").innerText = n.tech;
    document.getElementById("stability").innerText = n.stability;
}

// -------------------------
// 🖱️ CLICK + HOVER
// -------------------------
let lastNation = null;

map.addEventListener("pointermove", (e) => {
    const rect = map.getBoundingClientRect();

    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;

    const nation = getNation(pixel);

    if (nation !== lastNation) {
        lastNation = nation;

        // simple hover effect (no lag scan!)
        if (nation) {
            map.style.filter = "brightness(1.05)";
        } else {
            map.style.filter = "none";
        }
    }
});

map.addEventListener("pointerdown", (e) => {
    const rect = map.getBoundingClientRect();

    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;

    const nation = getNation(pixel);

    if (nation) showInfo(nation);
});

// -------------------------
// 🎥 FIXED SMOOTH PAN / ZOOM (NO GLITCH)
// -------------------------
let scale = 1;
let x = 0;
let y = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

map.style.transformOrigin = "0 0";

map.addEventListener("pointerdown", (e) => {
    isDragging = true;
    map.setPointerCapture(e.pointerId);

    startX = e.clientX - x;
    startY = e.clientY - y;
});

map.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    x = e.clientX - startX;
    y = e.clientY - startY;

    update();
});

map.addEventListener("pointerup", () => {
    isDragging = false;
});

// prevent ghost drag behavior
map.addEventListener("dragstart", (e) => e.preventDefault());

// zoom
map.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoom;

    scale = Math.min(Math.max(scale, 0.5), 5);

    update();
});

// -------------------------
// 🎯 APPLY TRANSFORM (single source of truth)
// -------------------------
function update() {
    const transform = `translate(${x}px, ${y}px) scale(${scale})`;
    map.style.transform = transform;
}
