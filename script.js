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
// 🧠 Nations
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
// ⚡ COLOR DISTANCE
// --------------------
function colorDistance(a, b) {
    return (
        (a[0] - b[0]) ** 2 +
        (a[1] - b[1]) ** 2 +
        (a[2] - b[2]) ** 2
    );
}

// --------------------
// 🎯 FAST LOOKUP (no scanning loops)
// --------------------
function getBestNation(pixel) {
    const c = [pixel[0], pixel[1], pixel[2]];

    if (c[0] < 10 && c[1] < 10 && c[2] < 10) return null;

    let best = null;
    let bestDist = Infinity;

    for (const n of nations) {
        const d = colorDistance(c, n.color);
        if (d < bestDist) {
            bestDist = d;
            best = n;
        }
    }

    return bestDist < 2500 ? best : null;
}

// --------------------
// 🖼️ LOAD MAP
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
// 🎮 CAMERA
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
// 🖱️ DRAG
// --------------------
map.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener("pointerup", () => dragging = false);

window.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    x += e.clientX - lastX;
    y += e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    update();
});

// --------------------
// 🔍 ZOOM
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
// 🎯 STATE
// --------------------
let selectedNation = null;
let hoverNation = null;

// --------------------
// ⚡ PIXEL SAMPLER (FAST + STABLE)
// --------------------
function getPixel(e) {
    const rect = map.getBoundingClientRect();

    const px = Math.floor((e.clientX - rect.left) * (mapW / rect.width));
    const py = Math.floor((e.clientY - rect.top) * (mapH / rect.height));

    return hctx.getImageData(px, py, 1, 1).data;
}

// --------------------
// 🖱️ CLICK (INSTANT)
// --------------------
map.addEventListener("click", (e) => {
    const pixel = getPixel(e);
    const nation = getBestNation(pixel);

    if (!nation) return;

    selectedNation = nation;
    showNation(nation);
    drawHighlight(nation, true); // strong highlight
});

// --------------------
// 👀 HOVER (SMOOTH + RESPONSIVE)
// --------------------
map.addEventListener("mousemove", (e) => {
    const pixel = getPixel(e);
    const nation = getBestNation(pixel);

    if (nation !== hoverNation) {
        hoverNation = nation;

        if (!selectedNation) {
            drawHighlight(nation, false); // soft hover
        }
    }
});

// --------------------
// 🎨 IMPROVED HIGHLIGHT SYSTEM
// --------------------
function drawHighlight(nation, strong) {
    octx.clearRect(0, 0, overlay.width, overlay.height);
    if (!nation) return;

    const imgData = hctx.getImageData(0, 0, mapW, mapH);
    const data = imgData.data;

    const target = nation.color;

    const glow = strong ? 0.95 : 0.6;
    const border = strong ? 255 : 180;

    for (let i = 0; i < data.length; i += 4) {
        const c = [data[i], data[i+1], data[i+2]];

        if (colorDistance(c, target) < 1000) {

            const x = (i / 4) % mapW;
            const y = Math.floor((i / 4) / mapW);

            // soft fill
            octx.fillStyle = `rgba(255,255,255,${glow})`;
            octx.fillRect(x, y, 1, 1);

            // subtle glow border effect
            if (strong && (x % 2 === 0) && (y % 2 === 0)) {
                octx.fillStyle = `rgba(255,255,255,0.15)`;
                octx.fillRect(x, y, 2, 2);
            }
        }
    }
}

// --------------------
// 📦 UI UPDATE
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
