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
        color: [165, 6, 241],
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
// 🧠 Color distance (REAL FIX)
// --------------------
function colorDistance(a, b) {
    return (
        (a[0] - b[0]) ** 2 +
        (a[1] - b[1]) ** 2 +
        (a[2] - b[2]) ** 2
    );
}

// --------------------
// 🧠 BEST MATCH (fixes ALTA-only bug)
// --------------------
function getBestNation(pixel) {
    const c = [pixel[0], pixel[1], pixel[2]];

    // ignore ocean / background
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

    // threshold so random noise doesn't trigger
    return bestDist < 2500 ? best : null;
}

// --------------------
// 🖼️ Load image
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
// 🎮 Camera
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
// 🖱️ Drag
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
// 🔍 Zoom
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
// 🖱️ CLICK
// --------------------
map.addEventListener("click", (e) => {
    const rect = map.getBoundingClientRect();

    const px = Math.floor((e.clientX - rect.left) * (mapW / rect.width));
    const py = Math.floor((e.clientY - rect.top) * (mapH / rect.height));

    const pixel = hctx.getImageData(px, py, 1, 1).data;

    const nation = getBestNation(pixel);

    if (nation) {
        selectedNation = nation;
        showNation(nation);
        drawHighlight(nation);
    }
});

// --------------------
// 🖱️ HOVER
// --------------------
map.addEventListener("mousemove", (e) => {
    const rect = map.getBoundingClientRect();

    const px = Math.floor((e.clientX - rect.left) * (mapW / rect.width));
    const py = Math.floor((e.clientY - rect.top) * (mapH / rect.height));

    const pixel = hctx.getImageData(px, py, 1, 1).data;

    const nation = getBestNation(pixel);

    if (nation !== hoverNation) {
        hoverNation = nation;

        if (!selectedNation) {
            drawHighlight(nation);
        }
    }
});

// --------------------
// 🔥 OUTLINE HIGHLIGHT (IMPORTANT)
// --------------------
function drawHighlight(nation) {
    octx.clearRect(0, 0, overlay.width, overlay.height);

    if (!nation) return;

    const imgData = hctx.getImageData(0, 0, mapW, mapH);
    const data = imgData.data;

    const target = nation.color;

    for (let y = 1; y < mapH - 1; y++) {
        for (let x = 1; x < mapW - 1; x++) {

            const i = (y * mapW + x) * 4;

            const c = [data[i], data[i+1], data[i+2]];

            if (colorDistance(c, target) < 1000) {

                // outline check (edge detection)
                const left = (y * mapW + (x - 1)) * 4;
                const right = (y * mapW + (x + 1)) * 4;
                const up = ((y - 1) * mapW + x) * 4;
                const down = ((y + 1) * mapW + x) * 4;

                const neighbors = [
                    data[left], data[left+1], data[left+2],
                    data[right], data[right+1], data[right+2],
                    data[up], data[up+1], data[up+2],
                    data[down], data[down+1], data[down+2]
                ];

                let edge = false;

                for (let j = 0; j < neighbors.length; j += 3) {
                    const nc = [neighbors[j], neighbors[j+1], neighbors[j+2]];

                    if (colorDistance(nc, target) > 1000) {
                        edge = true;
                        break;
                    }
                }

                if (edge) {
                    octx.fillStyle = "rgba(255,255,255,0.9)";
                    octx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

// --------------------
// 📦 UI
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
