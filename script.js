const map = document.getElementById("map");
const overlay = document.getElementById("overlay");
const octx = overlay.getContext("2d");

const buffer = document.getElementById("buffer");
const bctx = buffer.getContext("2d");

const img = new Image();
img.src = "fullmap.png";

let W, H;

img.onload = () => {
    W = img.width;
    H = img.height;

    buffer.width = W;
    buffer.height = H;
    overlay.width = W;
    overlay.height = H;

    bctx.drawImage(img, 0, 0);
};

const nations = [
    {
        id: 1,
        color: [255, 0, 0],
        name: "ALTA",
        allies: [],
        rivals: [],
        population: "120,000",
        provinces: 5,
        tech: 1,
        stability: "Max"
    },
    {
        id: 2,
        color: [255, 0, 0], // duplicate allowed now
        name: "Second Red Nation",
        allies: [],
        rivals: [],
        population: "80,000",
        provinces: 3,
        tech: 1,
        stability: "Max"
    }
];

function colorDistance(a, b) {
    return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]);
}

function getNation(pixel) {
    const p = [pixel[0], pixel[1], pixel[2]];

    let matches = [];

    for (const n of nations) {
        const dist = colorDistance(p, n.color);
        if (dist < 40) {
            matches.push({ nation: n, dist });
        }
    }

    if (matches.length === 0) return null;

    // pick best match (or first stable one)
    matches.sort((a,b) => a.dist - b.dist);
    return matches[0].nation;
}

let scale = 1;
let x = 0;
let y = 0;

let targetX = 0;
let targetY = 0;

let dragging = false;
let lastX, lastY;

map.addEventListener("dragstart", e => e.preventDefault());

map.addEventListener("mousedown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    map.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
    dragging = false;
    map.style.cursor = "grab";
});

window.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    targetX += (e.clientX - lastX);
    targetY += (e.clientY - lastY);

    lastX = e.clientX;
    lastY = e.clientY;
});

function animate() {
    x += (targetX - x) * 0.15;
    y += (targetY - y) * 0.15;

    const transform = `translate(${x}px, ${y}px) scale(${scale})`;

    map.style.transform = transform;
    overlay.style.transform = transform;
    buffer.style.transform = transform;

    requestAnimationFrame(animate);
}

animate();

map.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoom;

    scale = Math.min(Math.max(scale, 0.5), 5);
});

let currentNation = null;

map.addEventListener("mousemove", (e) => {
    const rect = map.getBoundingClientRect();

    const xPos = Math.floor((e.clientX - rect.left) * (W / rect.width));
    const yPos = Math.floor((e.clientY - rect.top) * (H / rect.height));

    const pixel = bctx.getImageData(xPos, yPos, 1, 1).data;

    currentNation = getNation(pixel);
});

map.addEventListener("click", () => {
    if (!currentNation) return;
    showInfo(currentNation);
});

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
