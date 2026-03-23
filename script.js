const map = document.getElementById("map");
const canvas = document.getElementById("colorMapCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const octx = overlay.getContext("2d");

map.ondragstart = () => false;

// Wait for the ACTUAL map element to load
map.onload = () => {
    canvas.width = map.naturalWidth;
    canvas.height = map.naturalHeight;

    overlay.width = map.naturalWidth;
    overlay.height = map.naturalHeight;

    ctx.drawImage(map, 0, 0);

    console.log("Map loaded successfully");
};

// ------------------------
// 🧠 Nation Data
// ------------------------
const nations = [
    {
        id: "ALTA",
        color: [255, 0, 0],
        allies: [],
        rivals: [],
        population: "120,000",
        provinces: 5,
        tech: 1,
        stability: "Max"
    }
];

// ------------------------
// 🎨 Color Distance
// ------------------------
function colorDistance(c1, c2) {
    return Math.sqrt(
        (c1[0] - c2[0]) ** 2 +
        (c1[1] - c2[1]) ** 2 +
        (c1[2] - c2[2]) ** 2
    );
}

// ------------------------
// 🔍 Find Nation
// ------------------------
function getClosestNation(pixel) {
    const clicked = [pixel[0], pixel[1], pixel[2]];

    // ignore ocean / white noise
    if (clicked[0] > 245 && clicked[1] > 245 && clicked[2] > 245) return null;

    let best = null;
    let bestDist = 999999;

    for (const n of nations) {
        const d =
            Math.abs(clicked[0] - n.color[0]) +
            Math.abs(clicked[1] - n.color[1]) +
            Math.abs(clicked[2] - n.color[2]);

        if (d < bestDist) {
            bestDist = d;
            best = n;
        }
    }

    // higher tolerance = fixes duplicates / anti-alias issues
    return bestDist < 80 ? best : null;
}
// ------------------------
// 🖱️ Mouse Detection
// ------------------------
let currentHover = null;

map.addEventListener("mousemove", (e) => {
    const rect = map.getBoundingClientRect();

    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const nation = getNationFromPixel(pixel);

    if (nation !== currentHover) {
        currentHover = nation;
        drawOverlay(nation);
    }
});

// ------------------------
// ✨ Highlight Overlay
// ------------------------
function drawOverlay(nation) {
    octx.clearRect(0, 0, overlay.width, overlay.height);
    if (!nation) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const pixel = [data[i], data[i+1], data[i+2]];

        if (colorDistance(pixel, nation.color) < 50) {
            octx.fillStyle = "rgba(255,255,255,0.08)";
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            octx.fillRect(x, y, 1, 1);
        }
    }
}

// ------------------------
// 🎯 Click Selection
// ------------------------
map.addEventListener("click", (e) => {
    if (!currentHover) return;

    showInfo(currentHover);
    centerOnClick(e);
});

// ------------------------
// 📦 Info Panel
// ------------------------
function showInfo(n) {
    document.getElementById("nationName").innerText = n.name;
    document.getElementById("allies").innerText = n.allies.join(", ");
    document.getElementById("rivals").innerText = n.rivals.join(", ");
    document.getElementById("population").innerText = n.population;
    document.getElementById("provinces").innerText = n.provinces;
    document.getElementById("tech").innerText = n.tech;
    document.getElementById("stability").innerText = n.stability;

    document.getElementById("infoPanel").classList.remove("hidden");
}

// ------------------------
// 🎥 Pan & Zoom
// ------------------------
let isDragging = false;
let lastX = 0;
let lastY = 0;

map.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    map.style.cursor = "grabbing";
});

map.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoomIntensity = 0.12;
    const zoom = Math.exp(e.deltaY * -zoomIntensity);

    scale *= zoom;

    scale = Math.min(Math.max(scale, 0.5), 5);

    updateTransform();
}, { passive: false });

window.addEventListener("mouseup", () => {
    isDragging = false;
    map.style.cursor = "grab";
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    originX += dx;
    originY += dy;

    updateTransform();
});

// ------------------------
// 🎯 Center Camera
// ------------------------
function centerOnClick(e) {
    const rect = map.getBoundingClientRect();
    originX += (window.innerWidth / 2 - e.clientX);
    originY += (window.innerHeight / 2 - e.clientY);
    updateTransform();
}
