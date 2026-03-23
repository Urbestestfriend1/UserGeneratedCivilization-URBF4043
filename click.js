map.addEventListener("click", (e) => {
    const rect = map.getBoundingClientRect();

    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const clickedColor = [pixel[0], pixel[1], pixel[2]];

    // 🧠 Ignore ocean / near-black
    if (clickedColor[0] < 10 && clickedColor[1] < 10 && clickedColor[2] < 10) {
        return;
    }

    let closestNation = null;
    let closestDistance = Infinity;

    for (const nation of nations) {
        const dist = colorDistance(clickedColor, nation.color);

        if (dist < closestDistance) {
            closestDistance = dist;
            closestNation = nation;
        }
    }

    // 🎯 Threshold so random pixels don’t trigger
    if (closestDistance < 50 && closestNation) {
        showInfo(closestNation);
    }
});
