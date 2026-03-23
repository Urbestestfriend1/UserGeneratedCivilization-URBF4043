let scale = 1;
let originX = 0;
let originY = 0;
let isDragging = false;
let startX, startY;

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

const nations = {
    "255,0,0": {
        name: "ALTA",
        allies: ["Nation B"],
        rivals: ["Nation C"],
        population: "120,000",
        provinces: 5,
        tech: 1,
        stability: "Max"
    },

    "0,255,0": {
        name: "Nation B",
        allies: ["ALTA"],
        rivals: [],
        population: "80,000",
        provinces: 3,
        tech: 1,
        stability: "Max"
    }
};
