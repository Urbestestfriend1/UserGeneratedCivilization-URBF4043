let scale = 1;
let originX = 0;
let originY = 0;
let isDragging = false;
let startX, startY;

function colorDistance(c1, c2) {
    return Math.sqrt(
        (c1[0] - c2[0]) ** 2 +
        (c1[1] - c2[1]) ** 2 +
        (c1[2] - c2[2]) ** 2
    );
}

map.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoom;

    map.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
});

map.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    originX = e.clientX - startX;
    originY = e.clientY - startY;

    map.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
});

const nations = [
    {
        color: [255, 0, 0],
        name: "ALTA",
        allies: [],
        rivals: [],
        population: "???",
        provinces: 0,
        tech: 1,
        stability: "Max"
    },

    {
        color: [255, 165, 0],
        name: "Nation B",
        allies: [],
        rivals: [],
        population: "???",
        provinces: 0,
        tech: 1,
        stability: "Max"
    }
];
