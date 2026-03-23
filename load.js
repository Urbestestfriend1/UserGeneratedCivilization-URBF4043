const canvas = document.getElementById("colorMapCanvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "images/colormap.png";

img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
};
