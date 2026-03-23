const map = document.getElementById("map");
const overlay = document.getElementById("overlay");
const octx = overlay.getContext("2d");

const colorCanvas = document.getElementById("colorCanvas");
const cctx = colorCanvas.getContext("2d");

// --------------------
// Load map into hidden canvas
// --------------------
const img = new Image();
img.src = "fullmap.png";

img.onload = () => {
    colorCanvas.width = img.width;
    colorCanvas.height = img.height;
    overlay.width = img.width;
    overlay.height = img.height;

    cctx.drawImage(img, 0, 0);
};

// --------------------
// FIXED NATION DATA (IMPORTANT)
// You MUST ensure colors are UNIQUE-ish
// --------------------
const nations = [
    { color: [255, 0, 0], name: "ALTA", allies: [], rivals: [], population: "120K", provinces: 5, tech: 1, stability: "Max" },
    { color: [0, 255, 0], name: "Nation B", allies: [], rivals: [], population: "80K", provinces: 3, tech: 1, stability: "Max" },
];

// --------------------
// Color matching (robust for messy edges)
// --------------------
function dist(a, b) {
    return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]);
}

function getNation(pixel) {
    const c = [pixel[0], pixel[1], pixel[2]];

    // ignore ocean / white noise
    if (c[0] > 250 && c[1] > 250 && c[2] > 250) return null;

    let best = null;
    let bestDist = 9999;

    for (const n of nations) {
        const d = dist(c, n.color);
        if (d < bestDist) {
            bestDist = d;
            best = n;
        }
    }

    return bestDist < 60 ? best : null;
}

// --------------------
// FIXED PAN / ZOOM SYSTEM (no jitter)
// --------------------
let scale = 1;
let x = 0;
let y = 0;

let dragging = false;
let startX = 0;
let startY = 0;

function applyTransform() {
    const t = `translate(${x}px, ${y}px) scale(${scale})`;
    map.style.transform = t;
    overlay.style.transform = t;
    colorCanvas.style.transform = t;
}

// Prevent ghost drag image
map.ondragstart = () => false;

// --------------------
// Smooth drag (FIXED)
// --------------------
map.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX - x;
    startY = e.clientY - y;
    map.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
    dragging = false;
    map.style.cursor = "grab";
});

window.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    x = e.clientX - startX;
    y = e.clientY - startY;

    applyTransform();
});

// --------------------
// Smooth zoom (FIXED center zoom feel)
// --------------------
map.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoom;

    scale = Math.min(Math.max(scale, 0.5), 6);

    applyTransform();
});

// --------------------
// Click detection (fast + stable)
// --------------------
map.addEventListener("click", (e) => {
    const rect = map.getBoundingClientRect();

    const cx = (e.clientX - rect.left) * (colorCanvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (colorCanvas.height / rect.height);

    const p = cctx.getImageData(cx, cy, 1, 1).data;

    const nation = getNation(p);

    if (nation) {
        showInfo(nation);
        centerOnClick(e);
    }
});

// --------------------
// UI
// --------------------
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

// --------------------
// Center camera (smooth-ish)
// --------------------
function centerOnClick(e) {
    const dx = window.innerWidth / 2 - e.clientX;
    const dy = window.innerHeight / 2 - e.clientY;

    x += dx;
    y += dy;

    applyTransform();
}
