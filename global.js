const grassBiome = {
    tilesetPrefix: "Europe/",
    hints: ["Трава", "Вода", "Утоптанная земля", "Деревья", "Камень", "Горные породы", "Брусчатка"]
};
const whiteCityBiome = {
    tilesetPrefix: "Capital/",
    stone_tiles: "Capital/stone_tiles",
    stone_wall_ground_tile: "Capital/stone_wall_ground_tile",
    hints: ["Трава", "Вода", "Утоптанная земля", "Деревья", "Камень", "Горные породы", "Брусчатка"],
};
const desertBiome = {
    tilesetPrefix: "Desert/",
    hints: ["Песок потемнее", "Вода!", "Песок посветлее", "Южные деревья", "Камень", "Стены", "Брусчатка"]
};
const desertWoodWallsBiome = {
    tilesetPrefix: "Desert/",
    rock_tiles: "Desert/wood_wall_tiles",
    rock_ground_tiles: "Desert/wood_wall_ground_tiles",
    hints: ["Песок потемнее", "Вода", "Песок посветлее", "Южные деревья", "Камень", "Деревянные стены", "Брусчатка"]
};
const westBiome = {
    tilesetPrefix: "Desert/",
    pavement_tiles: "West/wooden_floor",
    stone_wall_ground_tile: "Desert/wood_wall_ground_tiles",
    hints: ["Песок потемнее", "Морская вода", "Песок посветлее", "Южные деревья", "Камень", "Стены", "Доски"]
};
const desertPalaceBiome = {
    tilesetPrefix: "Desert/",
    sand_tiles: "Desert/marble",
    pavement_tiles: "Desert/carpet",
    grass_tiles: "Desert/sand_tiles",
    rock_tiles: "Desert/rock_tiles_dark",
    stone_tiles: "Desert/stone_tiles",
    hints: ["Песок", "Вода", "Мрамор", "Южные деревья", "Камень", "Стены", "Древние узоры"]
};
const iceBiome = {
    tilesetPrefix: "Snow/",
    stone_tiles: "Snow/stone_tiles",
    stone_wall_ground_tile: "Snow/stone_wall_ground_tile",
    hints: ["Лёд", "Ледяная вода", "Снег", "Заснеженные деревья", "Камень", "Ледяные стены", "Брусчатка"]
};
const northBiome = {
    tilesetPrefix: "Europe/",
    animated_water: "Snow/animated_water",
    tree_images: "Europe/trees_pines",
    dead_trees: "Snow/dead_trees",
    sand_tiles: "Snow/sand_tiles",
    ground_tiles: "Snow/ground_tiles",
    grass_tiles: "Snow/tundra_tiles",
    dark_grass_border: "Snow/tundra_border",
    stone_tiles: "Snow/stone_tiles",
    stone_wall_ground_tile: "Snow/stone_wall_ground_tile",
    hints: ["Северные травы", "Вода", "Утоптанная земля", "Северные деревья", "Камень", "Горные породы", "Брусчатка"]
};

let player = new Player();
let worlds = {}
let world = null;

function changeWorldTo(worldName, doAutosave, oldWorldName) {
    if (!(worldName in TileMaps)) {
        console.error("World", worldName, "is undefined");
        return;
    }
    if (!(worldName in worlds)) {
        worlds[worldName] = new World(worldName);
    }
    if (!oldWorldName && world)
        oldWorldName = world.mapName;
    world = worlds[worldName];
    renderer.setTileset(world.biome);
    if (oldWorldName)
        world.comeFromMap(oldWorldName);
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

function reloadAll() {
    localStorage.clear();
    worlds = {};
    ui.dialogUI.messages = [];    
    changeWorldTo(world.mapName);
}

let globalTimer = Date.now() / 1000.;
let renderer = new Renderer();
let ui = new UI();

loadGameFromLocalStorage();
setInterval(() => {
    if (!world.script.stopGameplayTime)
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
        world.animations.draw(ctx, pixelOffset, 1);
        ui.drawTooltip(ctx, pixelOffset);
        ui.draw(ctx);
        world.animations.draw(ctx, pixelOffset, 2);
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
