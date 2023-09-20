function saveWorld(w) {
    const ignoredKeys = {
        // do not saveload terrain 
        'terrain':1, 
        'trees':1,
    
        // do not saveload data that strictly follows from objects
        'scriptObjects':1, 
        'pathfinding':1, 
        'vision':1, 
        'fire':1,
    
        // do not saveload stats for mobs
        'stats':1,
    
        // do not saveload functions and lists of functions
        'triggers':1,
    }
    // add terrain that was changed
    w.changedTerrain = [];
    const map = TileMaps[w.mapName];
    const mapData = map["layers"][0]["data"];
    for (let x = 0; x < w.width; x++) {
        for (let y = 0; y < w.height; y++) {
            if (w.terrain[x][y] != mapData[x + y * w.width] - 1) {
                w.changedTerrain.push(x);
                w.changedTerrain.push(y);
                w.changedTerrain.push(w.terrain[x][y]);
            }
        }
    }
    // ok, we're ready to go
    return JSON.stringify(w, (key, value) => { 
        return key in ignoredKeys? undefined : value 
    });    
}

function recursiveRestore(to, from) {
    for (let prop in from) {
        val = from[prop]
        if (val === null)
            continue; // we shouldn't use "null" as a meaningful thing in a game state
        if (val.constructor == Object && prop in to)
            recursiveRestore(to[prop], val);
        else
            to[prop] = val;
    }
}

let lastAutosave = {}

function autosave() {
    let worldState = saveWorld(world);
    let playerState = JSON.stringify(player);
    let dialogsState = JSON.stringify(ui.dialogUI.messages)
    console.log("Autosaved.");
    console.log("World state: ", worldState.length);
    console.log("Player state: ", playerState.length);
    console.log("Dialogs state: ", dialogsState.length);
    console.log("Total: ", worldState.length + playerState.length + dialogsState.length);
    lastAutosave = {
        world: worldState,
        player: playerState,
        dialogs: dialogsState
    }
}

function loadDialogs(dialogStr) {
    let dialogsState = JSON.parse(dialogStr);
    ui.dialogUI.messages = [];
    for (let m of dialogsState) {
        let speaker = {
            color: m.colors[0],
            bgColor: m.bgColor,
            font: m.font,
            portrait: m.portrait          
        }
        ui.dialogUI.addMessage(m.text, speaker, null, true);
    }
}

function loadAutosave() {
    world.load(JSON.parse(lastAutosave.world));
    playerState = JSON.parse(lastAutosave.player);
    recursiveRestore(player, playerState);
    loadDialogs(lastAutosave.dialogs);
    world.vision.recalculateLocalVisibility();
}

function saveGameToLocalStorage() {
    for (let name in worlds)
        localStorage["world." + name] = saveWorld(worlds[name]);
    localStorage["player"] = JSON.stringify(player);
    localStorage["dialogs"] = JSON.stringify(ui.dialogUI.messages);
    localStorage["map"] = world.mapName;
    localStorage["autosave.world"] = lastAutosave.world;
    localStorage["autosave.player"] = lastAutosave.player;
    localStorage["autosave.dialogs"] = lastAutosave.dialogs;
}

function loadGameFromLocalStorage() {
    let currentMap = "intro_map";
    for (let prop in localStorage) {
        if (prop == "player") {
            playerState = JSON.parse(localStorage[prop]);
            recursiveRestore(player, playerState);
        } else if (prop == "dialogs") {
            loadDialogs(localStorage[prop]);
        } else if (prop.startsWith("autosave.")) {
            propName = prop.substring(9);
            lastAutosave[propName] = localStorage[propName];
        } else if (prop.startsWith("world.")) {
            mapName = prop.substring(6);
            worlds[mapName] = new World(mapName);
            worlds[mapName].load(JSON.parse(localStorage[prop]));
        } else if (prop == "map") {
            currentMap = localStorage[prop];
        }
    }
    changeWorldTo(currentMap, false);
    world.vision.recalculateLocalVisibility();
}
