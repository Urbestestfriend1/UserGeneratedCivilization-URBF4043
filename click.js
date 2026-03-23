const map = document.getElementById("map");

map.addEventListener("click", (e) => {
    const rect = map.getBoundingClientRect();

    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;

    const nation = nations[key];

    if (nation) {
        showInfo(nation);
    }
});
