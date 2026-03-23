function showInfo(nation) {
    document.getElementById("nationName").innerText = nation.name;
    document.getElementById("allies").innerText = nation.allies.join(", ");
    document.getElementById("rivals").innerText = nation.rivals.join(", ");
    document.getElementById("population").innerText = nation.population;
    document.getElementById("provinces").innerText = nation.provinces;
    document.getElementById("tech").innerText = nation.tech;
    document.getElementById("stability").innerText = nation.stability;

    document.getElementById("infoPanel").classList.remove("hidden");
}
