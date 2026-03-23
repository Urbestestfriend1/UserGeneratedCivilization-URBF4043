const map = document.getElementById("map");
const canvas = document.getElementById("colorMapCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const octx = overlay.getContext("2d");

// Load same image into hidden canvas
const img = new Image();
img.src = "images/map.png";

img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    overlay.width = img.width;
    overlay.height = img.height;

    ctx.drawImage(img, 0, 0);
};

// ------------------------
// 🧠 Nation Data
// ------------------------
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
function getNationFromPixel(pixel) {
    const clicked = [pixel[0], pixel[1], pixel[2]];

    // Ignore ocean
    if (clicked[0] < 10 && clicked[1] < 10 && clicked[2] < 10) return null;

    let best = null;
    let bestDist = Infinity;

    for (const n of nations) {
        const dist = colorDistance(clicked, n.color);
        if (dist < bestDist) {
            bestDist = dist;
            best = n;
        }
    }

    return bestDist < 50 ? best : null;
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
let scale = 1;
let originX = 0;
let originY = 0;

map.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoom;
    updateTransform();
});

let dragging = false;
let startX, startY;

map.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
});

window.addEventListener("mouseup", () => dragging = false);

window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    originX = e.clientX - startX;
    originY = e.clientY - startY;
    updateTransform();
});

function updateTransform() {
    const transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    map.style.transform = transform;
    overlay.style.transform = transform;
}

// ------------------------
// 🎯 Center Camera
// ------------------------
function centerOnClick(e) {
    const rect = map.getBoundingClientRect();
    originX += (window.innerWidth / 2 - e.clientX);
    originY += (window.innerHeight / 2 - e.clientY);
    updateTransform();
}
