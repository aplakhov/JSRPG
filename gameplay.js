"use strict";

function getProp(obj, name) {
    if ('properties' in obj) {
        let props = obj.properties;
        for (let n = 0; n < props.length; ++n)
            if (props[n].name == name)
                return props[n].value;
    } else if (name in obj) {
        return obj[name];
    }
    return "";
}

function randomFrom(array) {
    let n = Math.floor(Math.random() * array.length);
    return array[n];
}

function randomNoRepeatFrom(array) {
    for (let n = 0; n < 4; n++) {
        let n = Math.floor(Math.random() * array.length);
        if (array[n]) {
            let res = array[n];
            array[n] = null;
            return res;
        }
    }
    return null;
}

function prepareImageFor(obj) {
    let imageName = getProp(obj, "Image");
    return images.prepare(imageName);
}

let drawAI = false;

const TERRAIN_GRASS = 0;
const TERRAIN_WATER = 1;
const TERRAIN_SAND = 2;
const TERRAIN_DARK_FOREST = 3;
const TERRAIN_STONE = 4;
const TERRAIN_STONE_WALL = 5;
const TERRAIN_PAVEMENT = 6;

function intRandom(max) { // a random number from [0..max)
    return Math.floor(Math.random() * max)
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

class World {
    constructor(name) {
        const biomes = {
            "intro_map": grassBiome,
            "town_map": grassBiome,
            "north_map": northBiome,
            "desert_test_map": desertBiome,
            "dead_sea_map": desertWoodWallsBiome,
            "edge_map": desertBiome,
            "palace_map": desertPalaceBiome,
            "snow_test_map": iceBiome,
            "dungeon1_map": grassBiome,
            "port_map": whiteCityBiome,
            "dark_forest_map": grassBiome,
            "ai_test_map": westBiome,
        }
        const scripts = {
            "intro_map": IntroMapScript,
            // chapter 2
            "town_map": TownMapScript,
            "desert_test_map": DesertMapScript,
            "palace_map": PalaceMapScript,
            "dark_forest_map": DarkForestMapScript,
            "mushrooms_map": MushroomsMapScript,
            "dungeon_map": DungeonScript,
            "north_map": NorthMapScript,
            "edge_map": EdgeScript,
            // chapter 3
            "port_map": PortMapScript,
        }
        this.mapName = name;
        this.biome = biomes[name];
        if (!this.biome)
            this.biome = grassBiome;
        const map = TileMaps[name];
        this._setupTerrain(map);
        this._setupObjectsFromMap(map);
        let darknessAreas = this._setupDarknessAreas(map);
        this._setupRecalculatedData(darknessAreas);
        if (this.mapName in scripts)
            this.script = new (scripts[this.mapName])(this);
        else 
            this.script = new EmptyScript(this);
        if ('setupRecalculatedData' in this.script)
            this.script.setupRecalculatedData(this);
    }

    load(savedWorldState) {
        this.mapName = savedWorldState.mapName;
        this.biome = savedWorldState.biome;
        let map = TileMaps[this.mapName];
        this._setupTerrain(map);
        if (savedWorldState.changedTerrain) {
            const data = savedWorldState.changedTerrain;
            for (let n = 0; n < data.length; n += 3) {
                let x = data[n], y = data[n+1], tile = data[n+2];
                this.terrain[x][y] = tile;
            }
        }
        let darknessAreas = this._setupDarknessAreas(map); // TODO: from savedWorldState instead
        this._setupObjectsFromSavedState(savedWorldState);
        this._setupRecalculatedData(darknessAreas);
        recursiveRestore(this.script, savedWorldState.script);
        if ('setupRecalculatedData' in this.script)
            this.script.setupRecalculatedData(this);
    }

    _setupRecalculatedData(darknessAreas) {
        this.animations = new Animations();
        this.pathfinding = new Pathfinding(this);
        this.pathfinding.recalculateOccupiedTiles(this.objects);
        this.vision = new PlayerVision(darknessAreas, this);
        this.fire = new Fire();
        for (let obj of this.objects) {
            if (!('initialObj' in obj))
                continue;
            let fireEmitter = getProp(obj.initialObj, "Fire");
            if (fireEmitter != "") {
                let strength = Number(fireEmitter);
                this.fire.addConstantEmitter(obj.x, obj.y, strength);
                obj.additionalLight = Math.floor(strength / 20);
            }
            let additionalLight = getProp(obj.initialObj, "Light");
            if (additionalLight)
                obj.additionalLight = additionalLight;
            let fountain = getProp(obj.initialObj, "Fountain");
            if (fountain) {
                let strength = Number(fountain);
                this.animations.add(new Fountain(strength), obj);
            }
        }
    }

    addNewObject(obj, x, y) {
        if (obj.class == "ManaBottle")
            this.objects.push(new ManaBottle(x, y));
        else if (obj.class == "Bones")
            this.objects.push(new DecorativeObject(obj, x, y, images.prepare("bones")));
        else if (obj.class == "DecorativeObject")
            this.objects.push(new DecorativeObject(obj, x, y, prepareImageFor(obj)));
        else if (obj.class == "BigScaryObject")
            this.objects.push(new BigScaryObject(obj, x, y));
        else if (obj.class == "Mob")
            this.objects.push(new Mob(obj, x, y));
        else if (obj.class == "Message")
            this.objects.push(new Message(obj, x, y));
        else if (obj.class == "Autosave")
            this.objects.push(new Autosave(obj, x, y));
        else if (obj.class == "ScriptArea")
            this.objects.push(new ScriptArea(obj, x, y));
        else if (obj.class == "MapTransition")
            this.objects.push(new MapTransition(obj, x, y));
        else if (obj.class == "GameplayFire")
            this.objects.push(new GameplayFire(obj, x, y));
        else if (obj.class != "Darkness") {
            console.error("Cannot add an object: unknown class", obj);
            return;
        }
        let scriptName = getProp(obj, "ScriptName");
        if (!scriptName && obj.class == "ScriptArea")
            scriptName = obj.name;
        if (scriptName != "") {
            console.log("Found object with name ", scriptName);
            this.scriptObjects[scriptName] = this.objects.at(-1);
        }
        let coolImage = getProp(obj, "CoolImage");
        if (coolImage)
            this.objects.at(-1).coolImage = coolImage;
        return this.objects.at(-1);
    }

    _setupObjectsFromMap(map) {
        this.objects = [];
        this.scriptObjects = {};
        let objects = map["layers"][1]["objects"];
        for (let obj of objects) {
            let x = Math.floor((obj.x + 4) / tileSize);
            let y = Math.floor((obj.y + 4) / tileSize);
            if (obj.class == "Player") {
                player.x = x;
                player.y = y;
                player.pixelX = new SmoothlyChangingNumber(x * tileSize);
                player.pixelY = new SmoothlyChangingNumber(y * tileSize);
            } else
                this.addNewObject(obj, x, y);
        }
    }

    _setupObjectsFromSavedState(savedWorldState) {
        this.objects = [];
        this.scriptObjects = {};
        for (let gameObj of savedWorldState.objects) {
            let obj = gameObj.initialObj;
            if (!obj) {
                console.error("Unknown thing in saved state: ", gameObj);
                continue;
            }
            let added = this.addNewObject(obj, gameObj.x, gameObj.y);
            if (!added) {
                console.error("Failed to add an object for saved obj", gameObj);
                continue;
            }
            recursiveRestore(added, gameObj);
        }
    }

    _setupTerrain(map) {
        const data = map["layers"][0]["data"];
        this.height = map.height;
        this.width = map.width;
        this.terrain = [];
        this.trees = [];
        for (let x = 0; x < this.width; x++) {
            let row = [];
            for (let y = 0; y < this.height; y++) {
                const tile = data[x + y * this.width] - 1;
                if (tile == TERRAIN_DARK_FOREST)
                    this.trees.push({x : x, y : y, variation : intRandom(2400), sx : intRandom(9) - 4, sy : intRandom(9) - 4});
                row.push(tile);
            }
            this.terrain.push(row);
        }
        shuffle(this.trees);
    }

    _setupDarknessAreas(map) {
        let darknessAreas = [];
        let objects = map["layers"][1]["objects"];
        for (let obj of objects) {
            if (obj.class == "Darkness") {
                let x = Math.floor((obj.x + 4) / tileSize);
                let y = Math.floor((obj.y + 4) / tileSize);
                let radius = Number(getProp(obj, "Radius"));
                let width = Math.floor((obj.width + halfTileSize) / tileSize);
                let height = Math.floor((obj.height + halfTileSize) / tileSize);        
                if (radius < 4)
                    radius = 4;
                darknessAreas.push({
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    radius: radius
                });
            }
        }
        return darknessAreas;
    }

    nextTurn(forced) {
        for (let obj of this.objects) {
            if ('nextTurn' in obj && Math.random() < 0.8)
                obj.nextTurn(forced);
        }
        this.removeDeadObjects();
        this.vision.recalculateLocalVisibility();
        this.pathfinding.recalculateOccupiedTiles(this.objects);
        if ('nextTurn' in this.script)
            this.script.nextTurn(forced);
    }

    isInside(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    isOccluded(x, y) {
        let tile = this.terrain[x][y];
        return tile == TERRAIN_STONE_WALL;
    }

    hint(x, y) {
        if (x == player.x && y == player.y)
            return "Билл"
        let gameObj = this.pathfinding.isOccupied(x, y);
        if (gameObj != null && gameObj.hint)
            return gameObj.hint;
        for (let o of this.objects) {
            if (x == o.x && y == o.y && o.hint)
                return o.hint
        }
        let tile = this.terrain[x][y];
        if (tile == TERRAIN_DARK_FOREST) {
            for (let t of this.trees)
                if (t.burning > 75 && t.x == x && t.y == y)
                    return "Сгоревшее дерево";
        }
        return this.biome.hints[tile];
    }

    findMapTransition(x, y) {
        for (let o of this.objects) {
            if (o.targetMap && o.check(x, y))
                return o;
        }
        return null;
    }

    comeFromMap(name) {
        for (let o of this.objects) {
            if (o.targetMap && o.targetMap == name) {
                if (o.w > o.h) { // horizontal entry zone
                    player.x = Math.floor(o.x + o.w/2);
                    if (o.y > this.height / 2) {
                        player.y = o.y - 1;
                        player.frameX = 1;
                    } else {
                        player.y = o.y + o.h;
                        player.frameX = 0;
                    }
                } else { // vertical entry zone
                    player.y = Math.floor(o.y + o.h/2);
                    if (o.x > this.width / 2) {
                        player.x = o.x - 1;
                        player.frameX = 3;
                    } else {
                        player.x = o.x + o.w;
                        player.frameX = 2;
                    }
                }
                player.pixelX = new SmoothlyChangingNumber(player.x * tileSize);
                player.pixelY = new SmoothlyChangingNumber(player.y * tileSize);
            }
        }
    }

    removeDeadObjects() {
        this.objects = this.objects.filter(obj => !obj.hasOwnProperty("dead"));
    }
};

class ManaBottle {
    constructor(x, y) {
        this.initialObj = {class: "ManaBottle"};
        this.x = x;
        this.y = y;
        this.img = images.prepare("mana1");
        this.hint = "Бутылочка синей жидкости";
    }
    onContact(player) {
        this.dead = true;
        ui.dialogUI.addMessage("+10 макс.мана", systemMessageSpeaker, player);
        player.stats.mana += 10;
        player.mana += 3;
    }
    draw(ctx, x, y) {
        images.draw(ctx, this.img, x, y);
    }
};

class Message {
    constructor(obj, x, y) {
        this.initialObj = obj;
        this.message = getProp(obj, "Message");
        if (this.message == "")
            this.message = obj.name;
        this.x = x;
        this.y = y;
        this.w = Math.floor((obj.width + halfTileSize) / tileSize);
        this.h = Math.floor((obj.height + halfTileSize) / tileSize);
    }
    hasContact(x, y) {
        return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
    }
    onContact(player) {
        ui.dialogUI.addMessage(this.message, playerSpeaker, player);
        this.dead = true;
    }
    draw(ctx, x, y) {
        if (drawAI) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(x, y, this.w * tileSize, this.h * tileSize);
        }
    }
};

class ScriptArea {
    constructor(obj, x, y) {
        this.initialObj = obj;
        this.x = x;
        this.y = y;
        this.w = Math.floor((obj.width + halfTileSize) / tileSize);
        this.h = Math.floor((obj.height + halfTileSize) / tileSize);
    }
    draw(ctx, x, y) {
        if (drawAI) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(x, y, this.w * tileSize, this.h * tileSize);
            ctx.fillStyle = "red";
            ctx.fillText(this.initialObj.name, x, y - 10);
        }
    }
    isInsideXY(x, y) {
        return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
    }
    isInside(obj) {
        const x = obj.x, y = obj.y;
        return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
    }
    onContact(player) {
        this.touchedByPlayer = true;
    }
};

class Autosave {
    constructor(obj, x, y) {
        this.initialObj = obj;
        this.x = x;
        this.y = y;
        this.w = Math.floor((obj.width + halfTileSize) / tileSize);
        this.h = Math.floor((obj.height + halfTileSize) / tileSize);
    }
    hasContact(x, y) {
        return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
    }
    onContact(player) {
        if (player.hp > player.stats.hp / 2) {
            this.dead = true;
            autosave();
        }
    }
    draw(ctx, x, y) {
        if (drawAI) {
            ctx.strokeStyle = "green";
            ctx.strokeRect(x, y, this.w * tileSize, this.h * tileSize);
        }
    }
};

class MapTransition {
    constructor(obj, x, y) {
        this.initialObj = obj;
        this.message = getProp(obj, "Message");
        if (this.message == "")
            this.message = obj.name;
        this.targetMap = getProp(obj, "Target");
        this.x = x;
        this.y = y;
        this.w = Math.floor((obj.width + halfTileSize) / tileSize);
        this.h = Math.floor((obj.height + halfTileSize) / tileSize);
    }
    check(x, y) {
        return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
    }
    draw(ctx, x, y) {
        if (drawAI) {
            ctx.strokeStyle = "magenta";
            ctx.strokeRect(x, y, this.w * tileSize, this.h * tileSize);
        }
    }
};

class DecorativeObject {
    constructor(obj, x, y, image, rotation) {
        this.initialObj = obj;
        this.foundMessage = getProp(obj, "Message");
        if (this.foundMessage && this.foundMessage.indexOf('"') < 0)
            this.foundMessage = '"' + this.foundMessage + '"';
        this.inventoryItem = getProp(obj, "InventoryItem");
        this.hint = obj.name;
        this.x = x;
        this.y = y;
        this.zLayer = getProp(obj, "zLayer");
        this.image = image;
        if (rotation)
            this.rotation = rotation;
        else
            this.rotation = getProp(obj, "Rotation");
        this.animationFrames = getProp(obj, "AnimationFrames");
        this.animationTime = getProp(obj, "AnimationTime");
        if (this.animationFrames && !this.animationTime)
            this.animationTime = 1;
        let blocker = getProp(obj, "Blocker");
        if (blocker.length == 3 && blocker[1] == 'x') {
            let w = Number(blocker[0]), h = Number(blocker[2]);
            this.occupy = (pathfinding) => {
                for (let x = 0; x < w; x++)
                    for (let y = 0; y < h; y++)
                        pathfinding.occupyTile(this, this.x + x, this.y + y);
            }
        } else if (blocker != "") {
            this.occupy = (pathfinding) => {
                pathfinding.occupyTile(this, this.x, this.y);
            }
        }
    }
    onContact(player) {
        if (this.foundMessage) {
            ui.dialogUI.addMessage(this.foundMessage, playerSpeaker, player);
            this.foundMessage = null;
        }
        if (this.inventoryItem) {
            if (player.takeItem(this.inventoryItem)) {
                this.inventoryItem = null;
                this.dead = true;
            }
        }
    }
    _checkTerrain() {
        let isLightObject = !this.occupy;
        if (isLightObject) {
            let tile = world.terrain[this.x][this.y];
            if (tile == TERRAIN_WATER)
                this.dead = true;
        }
    }
    draw(ctx, x, y) {
        this._checkTerrain();
        if (!this.dead && this.image) {
            if (this.animationFrames) {
                const img = images.getReadyImage(this.image);
                if (!img)
                    return;
                let frame = Math.floor(globalTimer * this.animationFrames / this.animationTime) % this.animationFrames;
                let frameSizeX = img.width, frameSizeY = img.height / this.animationFrames;
                images.draw(ctx, this.image, 0, frameSizeY * frame, frameSizeX, frameSizeY, x, y, frameSizeX, frameSizeY);
            } else if (this.rotation) {
                images.drawRotated(ctx, this.image, this.rotation, x + halfTileSize, y + halfTileSize);
            } else
                images.draw(ctx, this.image, x, y);
        }
    }
};

function attackIfNear(attacker, target, attackingItem) {
    const dx = (target.pixelX.get() - attacker.pixelX.get()) / tileSize;
    const dy = (target.pixelY.get() - attacker.pixelY.get()) / tileSize;
    const distToTarget2 = dx * dx + dy * dy;
    const r = attacker.stats.attackRadius + 0.3;
    if (distToTarget2 > r * r)
        return false;
    setTimeout(() => {
        let damage = Math.floor(attacker.stats.attackMin + (attacker.stats.attackMax - attacker.stats.attackMin + 1) * Math.random());
        if ('damageBonus' in attacker)
            damage += attacker.damageBonus();
        target.applyDamage(damage, attackingItem);
    }, 300);
    return true;
}

function drawHPbar(ctx, hp, maxHp, x, y) {
    let w = tileSize - 8;
    let w1 = w * hp / maxHp;
    ctx.fillStyle = "rgb(255, 0, 40)";
    ctx.fillRect(x + 4, y + 4, w1, 3);
    ctx.fillStyle = "rgb(255, 150, 190)";
    ctx.fillRect(x + 4 + w1, y + 4, w - w1, 3);
}

function dist2(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return dx * dx + dy * dy;
}

class SmoothlyChangingNumber {
    constructor(x) {
        this.val = x;
        this.target = x;
        this.timeAtVal = 0;
        this.timeAtTarget = 0;
    }
    set(target, delay) {
        this.val = this.get();
        this.target = target;
        this.timeAtVal = globalTimer;
        this.timeAtTarget = globalTimer + delay;
    }
    get() {
        if (!this.timeAtTarget)
            return this.target;
        if (globalTimer > this.timeAtTarget)
            return this.target;
        return this.val + (this.target - this.val) * (globalTimer - this.timeAtVal) / (this.timeAtTarget - this.timeAtVal);
    }
};

function cheat() {
    player.stats.mana = 10000;
    player.mana = 10000;
    player.stats.hp = 10000;
    player.hp = 10000;
    player.stats.spells = ["stone", "water", "fire", "lightning", "earth_ear", "healing", "meteor_shower"];
    player.takeItem("great_shield");
    player.takeItem("short_sword");
    player.takeItem("lookingGlass");    
}

function after1() {
    player.stats.mana = 50;
    player.mana = 50;
    player.stats.spells = ["stone", "water", "healing"];
    player.takeItem("wooden_shield");
    player.takeItem("short_sword");    
    player.takeItem("lookingGlass");    
}