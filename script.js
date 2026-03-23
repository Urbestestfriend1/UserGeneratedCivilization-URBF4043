const map = document.getElementById("map");
const overlay = document.getElementById("overlay");
const hidden = document.getElementById("hidden");

const octx = overlay.getContext("2d");
const hctx = hidden.getContext("2d");

const img = new Image();
img.src = "fullmap.png";

let mapW = 0;
let mapH = 0;

// --------------------
// 🧠 Nations (YOU EDIT THIS)
// --------------------
const nations = [
    {
        color: [255, 0, 0],
        name: "ALTA",
        allies: [],
        rivals: [],
        population: 0,
        provinces: 0,
        tech: 1,
        stability: "Max"
    },
    {
        color: [254, 177, 127],
        name: "Postonorama",
        allies: [],
        rivals: [],
        population: 0,
        provinces: 0,
        tech: 1,
        stability: "Max"
    },
    {
        color: [165, 6, 241],
        name: "Ontario",
        allies: [],
        rivals: [],
        population: 0,
        provinces: 0,
        tech: 1,
        stability: "Max"
    }
];

// --------------------
// 🧠 FIX 1: Color matching WITH tolerance groups
// (solves duplicate / slightly different colors)
// --------------------
function colorMatch(c1, c2) {
    const d =
        (c1[0] - c2[0]) ** 2 +
        (c1[1] - c2[1]) ** 2 +
        (c1[2] - c2[2]) ** 2;

    return d < 900; // tolerance (30^2)
}

// --------------------
// 🧠 Find nation from pixel
// --------------------
function getNation(pixel) {
    const c = [pixel[0], pixel[1], pixel[2]];

    if (c[0] < 10 && c[1] < 10 && c[2] < 10) return null;

    let best = null;
    let bestDist = Infinity;

    for (const n of nations) {
        const d =
            (c[0] - n.color[0]) ** 2 +
            (c[1] - n.color[1]) ** 2 +
            (c[2] - n.color[2]) ** 2;

        if (d < bestDist) {
            bestDist = d;
            best = n;
        }
    }

    // IMPORTANT threshold
    return bestDist < 1200 ? best : null;
}

// --------------------
// 🖼️ Load image properly (FIXES "stuck top-left bug")
// --------------------
img.onload = () => {
    mapW = img.width;
    mapH = img.height;

    map.style.width = mapW + "px";
    map.style.height = mapH + "px";

    overlay.width = mapW;
    overlay.height = mapH;

    hidden.width = mapW;
    hidden.height = mapH;

    hctx.drawImage(img, 0, 0);
};

// --------------------
// 🎮 CAMERA SYSTEM (FIXED DRAGGING)
// --------------------
let scale = 1;
let x = 0;
let y = 0;

let dragging = false;
let lastX = 0;
let lastY = 0;

function update() {
    const t = `translate(${x}px, ${y}px) scale(${scale})`;
    map.style.transform = t;
    overlay.style.transform = t;
}

// --------------------
// 🖱️ POINTER EVENTS (fixes jitter + ghost drag)
// --------------------
map.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener("pointerup", () => {
    dragging = false;
});

window.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    x += dx;
    y += dy;

    lastX = e.clientX;
    lastY = e.clientY;

    update();
});

// --------------------
// 🔍 ZOOM (stable, no jump)
// --------------------
map.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;

    const mx = e.clientX - x;
    const my = e.clientY - y;

    x -= mx * (zoom - 1);
    y -= my * (zoom - 1);

    scale *= zoom;

    update();
}, { passive: false });

// --------------------
// 🎯 CLICK DETECTION (stable + scaled correctly)
// --------------------
map.addEventListener("click", (e) => {
    const rect = map.getBoundingClientRect();

    const px = Math.floor((e.clientX - rect.left) * (mapW / rect.width));
    const py = Math.floor((e.clientY - rect.top) * (mapH / rect.height));

    const pixel = hctx.getImageData(px, py, 1, 1).data;

    const nation = getNation(pixel);

    if (nation) showNation(nation);
});

// --------------------
// 📦 UI PANEL
// --------------------
function showNation(n) {
    document.getElementById("infoPanel").classList.remove("hidden");

    document.getElementById("nationName").innerText = n.name;
    document.getElementById("allies").innerText = n.allies.join(", ");
    document.getElementById("rivals").innerText = n.rivals.join(", ");
    document.getElementById("population").innerText = n.population;
    document.getElementById("provinces").innerText = n.provinces;
    document.getElementById("tech").innerText = n.tech;
    document.getElementById("stability").innerText = n.stability;
}
