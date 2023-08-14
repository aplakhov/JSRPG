const grassBiome = {
    tileset: "Europe/",
    hints: ["Трава", "Вода", "Утоптанная земля", "Деревья", "Камень", "Горные породы", "Брусчатка"]
};
const whiteCityBiome = {
    tileset: "Capital/",
    hints: ["Трава", "Вода", "Утоптанная земля", "Деревья", "Камень", "Горные породы", "Брусчатка"],
    exoticStones: true
};
const desertBiome = {
    tileset: "Desert/",
    hints: ["Песок потемнее", "Вода!", "Песок посветлее", "Южные деревья", "Камень", "Стены", "Брусчатка"]
};
const iceBiome = {
    tileset: "Snow/",
    hints: ["Лёд", "Ледяная вода", "Снег", "Заснеженные деревья", "Камень", "Ледяные стены", "Брусчатка"]
};

let player = new Player();
let worlds = {}
let world = null;

function changeWorldTo(worldName, doAutosave) {
    if (!(worldName in TileMaps)) {
        console.error("World", worldName, "is undefined");
        return;
    }
    if (!(worldName in worlds)) {
        worlds[worldName] = new World(worldName);
    }
    let oldWorld = world;
    world = worlds[worldName];
    renderer.setTileset(world.biome);
    if (oldWorld)
        world.comeFromMap(oldWorld.mapName);
    // take all quests from the map that can be taken right now
    for (let questName in quests) {
        let q = quests[questName];
        if (q.map == worldName && !q.introDialog && (!q.canBeTaken || q.canBeTaken()) && player.takenQuests.indexOf(questName) < 0)
            player.takenQuests.push(questName);
    }
    ui.showGoals();
    if (doAutosave)
        autosave();
}

let globalTimer = Date.now() / 1000.;
let renderer = new Renderer();
let ui = new UI();

loadGameFromLocalStorage();
setInterval(() => {
    saveGameToLocalStorage();
}, 30000
);

setInterval(() => {
        globalTimer = Date.now() / 1000.
        const pixelOffset = canvasOffset();
        if ('onDraw' in world.script)
            world.script.onDraw();
        renderer.drawWorld(ctx, pixelOffset, world);
        world.fire.step(pixelOffset);
        world.fire.draw(ctx, pixelOffset);
        world.animations.draw(ctx, pixelOffset, false);
        ui.drawTooltip(ctx, pixelOffset);
        ui.draw(ctx);
    },
    20
);

setInterval(
    () => {
        if (world.script.stopGameplayTime)
            return;
        world.nextTurn(false);
        player.nextTurn();
    },
    1000
);

canvas.onmousemove = function clickEvent(mouseEvent) {
    const rect = mouseEvent.target.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;
    updateTileUnderCursor(x, y);
    ui.onMouseMove(x, y);
}

canvas.onclick = function clickEvent(mouseEvent) {
    ui.tileUnderCursor.hideTooltip();
    if (world.script.noControl)
        return;
    const rect = mouseEvent.target.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;
    updateTileUnderCursor(x, y);
    if (ui.onClick(x, y))
        return;
    player.tryCast(ui.tileUnderCursor)
}

addEventListener("keyup", function(event) {
    ui.onKey(event.key);
});
