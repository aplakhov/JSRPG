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
    constructor(name, biome) {
        let map = TileMaps[name]
        let data = map["layers"][0]["data"]
        this.height = map.height;
        this.width = map.width;
        this.biome = biome;
        this.terrain = [];
        this.objects = [];
        this.scriptObjects = {};
        this.trees = [];
        let darknessAreas = [];
        for (let x = 0; x < this.width; x++) {
            let row = [];
            for (let y = 0; y < this.height; y++) {
                let tile = data[x + y * this.width] - 1
                if (tile == TERRAIN_DARK_FOREST)
                    this.trees.push({x : x, y : y, variation : intRandom(2400), sx : intRandom(9) - 4, sy : intRandom(9) - 4});
                row.push(tile)
            }
            this.terrain.push(row)
        }
        shuffle(this.trees);
        let objects = map["layers"][1]["objects"];
        for (let n = 0; n < objects.length; n++) {
            let obj = objects[n];
            let x = Math.floor((obj.x + 4) / tileSize);
            let y = Math.floor((obj.y + 4) / tileSize);
            if (obj.class == "Darkness") {
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
            } else if (obj.class == "Player") {
                player.x = x;
                player.y = y;
            } else
                this.addNewObject(obj, x, y);
        }
        this.pathfinding = new Pathfinding(this);
        this.pathfinding.recalculateOccupiedTiles(this.objects);
        this.vision = new PlayerVision(darknessAreas, this);
        for (let n = 0; n < objects.length; n++) {
            let obj = objects[n]
            let x = Math.floor((obj.x + 4) / tileSize);
            let y = Math.floor((obj.y + 4) / tileSize);
            let fireEmitter = getProp(obj, "Fire");
            if (fireEmitter != "") {
                let strength = Number(fireEmitter);
                fire.addConstantEmitter(x, y, strength);
                this.vision.addLightSource(x, y, Math.floor(strength / 20));
            }
        }
        this.hints = ["Трава", "Вода", "Утоптанная земля", "Деревья", "Камень", "Горные породы", "Брусчатка"];
        if (name == "intro_map")
            this.script = new IntroMapScript(this);
        else if (name == "town_map")
            this.script = new TownMapScript(this);
        else
            this.script = new EmptyScript(this);
    }

    addNewObject(obj, x, y) {
        if (obj.class == "ManaBottle")
            this.objects.push(new ManaBottle(x, y));
        if (obj.class == "Bones")
            this.objects.push(new DecorativeObject(obj, x, y, images.prepare("bones")));
        if (obj.class == "DecorativeObject")
            this.objects.push(new DecorativeObject(obj, x, y, prepareImageFor(obj)));
        if (obj.class == "BigScaryObject")
            this.objects.push(new BigScaryObject(obj, x, y));
        if (obj.class == "Mob")
            this.objects.push(new Mob(obj, x, y));
        if (obj.class == "Message") {
            let width = Math.floor((obj.width + halfTileSize) / tileSize);
            let height = Math.floor((obj.height + halfTileSize) / tileSize);
            let msg = getProp(obj, "Message");
            if (msg == "")
                msg = obj.name;
            this.objects.push(new Message(msg, x, y, width, height));
        }
        let scriptName = getProp(obj, "ScriptName");
        if (scriptName != "") {
            console.log("Found object with name ", scriptName);
            this.scriptObjects[scriptName] = this.objects.at(-1);
        }
        return this.objects.at(-1);
    }

    nextTurn(forced) {
        if (Math.random() < 0.8) {
            for (let obj of this.objects) {
                if ('nextTurn' in obj)
                    obj.nextTurn(forced);
            };
            this.removeDeadObjects();
        }
        this.vision.recalculateLocalVisibility();
        this.pathfinding.recalculateOccupiedTiles(this.objects);
        this.script.nextTurn(forced);
    }

    isOccluded(x, y) {
        let tile = this.terrain[x][y];
        return tile == TERRAIN_STONE_WALL;
    }

    hint(x, y) {
        if (x == player.x && y == player.y)
            return "Боб"
        let gameObj = this.pathfinding.isOccupied(x, y);
        if (gameObj != null && gameObj.hint)
            return gameObj.hint;
        for (let n = 0; n < this.objects.length; ++n) {
            let o = this.objects[n];
            if (x == o.x && y == o.y && o.hint)
                return o.hint
        }
        let tile = this.terrain[x][y];
        return this.hints[tile];
    }

    removeDeadObjects() {
        this.objects = this.objects.filter(obj => !obj.hasOwnProperty("dead"));
    }
};

class ManaBottle {
    constructor(x, y) {
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
    constructor(message, x, y, w, h) {
        this.message = message;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
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

class DecorativeObject {
    constructor(obj, x, y, image) {
        this.inventoryItem = getProp(obj, "InventoryItem");
        this.foundMessage = getProp(obj, "Message");
        this.hint = obj.name;
        this.x = x;
        this.y = y;
        this.image = image;
        if (getProp(obj, "Blocker") != "") {
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
    draw(ctx, x, y) {
        if (this.image)
            images.draw(ctx, this.image, x, y);
    }
};

function attackIfNear(attacker, target) {
    let dx = target.x - attacker.x;
    let dy = target.y - attacker.y;
    let distToTarget2 = dx * dx + dy * dy;
    let r2 = attacker.stats.attackRadius * attacker.stats.attackRadius;
    if (distToTarget2 > r2)
        return false;
    const duration = 0.2
    const direction = {
        x: dx * tileSize,
        y: dy * tileSize
    }
    animations.add(new Bullet(direction, duration), {
        x: attacker.x,
        y: attacker.y
    });
    setTimeout(() => {
        let damage = Math.floor(attacker.stats.attackMin + (attacker.stats.attackMax - attacker.stats.attackMin + 1) * Math.random());
        if ('damageBonus' in attacker)
            damage += attacker.damageBonus();
        target.applyDamage(damage);
    }, 200);
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
        this.timeAtVal = animations.globalTimer;
        this.timeAtTarget = animations.globalTimer + delay;
    }
    get() {
        if (!this.timeAtTarget)
            return this.target;
        if (animations.globalTimer > this.timeAtTarget)
            return this.target;
        return this.val + (this.target - this.val) * (animations.globalTimer - this.timeAtVal) / (this.timeAtTarget - this.timeAtVal);
    }
};

class Mob {
    constructor(obj, x, y) {
        this.meObj = obj;
        this.hint = obj.name;
        this.x = x;
        this.y = y;
        this.pixelX = new SmoothlyChangingNumber(x * tileSize);
        this.pixelY = new SmoothlyChangingNumber(y * tileSize);
        this.zLayer = 1;
        this.rotation = 0;

        this.rules = getProp(obj, "Rules");
        if (this.rules) {
            let stats = rpg[this.rules];
            if (stats) {
                this.hp = stats.hp;
                this.stats = stats;
                this.roamRadius = stats.roamRadius;
                this.aggroRadius = stats.aggroRadius;
                this.startingX = x;
                this.startingY = y;
            }
        }
        this.img = prepareImageFor(obj);

        const rotatedImages = {"duck" : 1, "scorpion_king" : 1, "dust_scorpio" : 1, "black_scorpio" : 1}
        this.rotatedDrawing = rotatedImages[this.img];
    }

    draw(ctx, x, y) {
        x += this.pixelX.get() - this.x * tileSize;
        y += this.pixelY.get() - this.y * tileSize;
        if (!this.dead && this.img) {
            if (this.rotatedDrawing)
                images.drawRotated(ctx, this.img, Math.PI - this.rotation, x + halfTileSize, y + halfTileSize);
            else
                images.draw(ctx, this.img, x, y);
        }
        if (this.stats && this.hp < this.stats.hp)
            drawHPbar(ctx, this.hp, this.stats.hp, x, y)
    }

    occupy(pathfinding) {
        pathfinding.occupyTile(this, this.x, this.y);
    }

    applyDamage(dmg) {
        if (this.hp) {
            this.hp -= dmg;
            if (this.hp <= 0)
                this.die();
        } else {
            this.die();
        }
    }

    die() {
        this.dead = true;
        ui.dialogUI.addMessage(getProp(this.meObj, "DeathComment"), playerSpeaker, player)
        let loot = getProp(this.meObj, "Loot");
        if (loot == "ManaBottle")
            world.objects.push(new ManaBottle(this.x, this.y));
        else
            world.objects.push(new DecorativeObject({
                name: "Останки"
            }, this.x, this.y, images.prepare("bones")))
    }

    isEnemy() {
        return this.stats && this.stats.enemy && !this.dead;
    }

    nextTurn(forced) {
        if (this.dead)
            return;
        let canMove = true;
        if (this.stats) {
            if (this.hp < this.stats.hp)
                this.hp++;
            if (this.hp > this.stats.hp)
                this.hp = this.stats.hp;
            if (this.stats.enemy) {
                this.checkAggro();
                if (this.stats.attackRadius) {
                    let attacked = attackIfNear(this, player);
                    if (attacked) {
                        this.rotation = Math.atan2(player.x - this.x, player.y - this.y);
                        canMove = false;
                    }
                }
            }
        }
        if (canMove) {
            this.move(forced);
            this.occupy(world.pathfinding);
            let currentPixelX = this.pixelX.get();
            let currentPixelY = this.pixelY.get();
            let nextPixelX = this.x * tileSize;
            let nextPixelY = this.y * tileSize;
            if (nextPixelX != currentPixelX || nextPixelY != currentPixelY) {
                this.rotation = Math.atan2(nextPixelX - currentPixelX, nextPixelY - currentPixelY);
                this.pixelX.set(nextPixelX, 1);
                this.pixelY.set(nextPixelY, 1);
            }
        }
    }

    checkAggro() {
        if (!this.aggred) {
            this.aggred = dist2(this.x, this.y, player.x, player.y) <= this.aggroRadius * this.aggroRadius;
            if (this.aggred && 'aggroMessages' in this.stats && 'speaker' in this.stats) {
                let msg = randomNoRepeatFrom(this.stats.aggroMessages);
                let speaker = {
                    color: this.stats.speaker.color,
                    bgColor: this.stats.speaker.bgColor,
                    font: this.stats.speaker.font,
                    portrait: images.prepare(randomNoRepeatFrom(this.stats.speaker.portraits))
                };
                if (msg && speaker.portrait)
                    ui.dialogUI.addMessage(msg, speaker, this);
            }
        }
    }

    moveRandomlyInsideRoamingArea() {
        let nextx = this.x,
            nexty = this.y;
        let r = Math.random();
        if (r < 0.25)
            nextx += 1;
        else if (r < 0.5)
            nextx -= 1;
        else if (r < 0.75)
            nexty += 1;
        else
            nexty -= 1;
        let insideRoaming = dist2(nextx, nexty, this.startingX, this.startingY) <= this.roamRadius * this.roamRadius;
        if (world.pathfinding.isPassable(nextx, nexty, this) && insideRoaming) {
            this.x = nextx;
            this.y = nexty;
        }
    }

    moveTowardsPlayer() {
        let dx = Math.abs(this.x - player.x);
        let dy = Math.abs(this.y - player.y);
        let nextx = this.x,
            nexty = this.y;
        if (player.x < this.x)
            nextx -= 1;
        else if (player.x > this.x)
            nextx += 1;
        if (player.y < this.y)
            nexty -= 1;
        else if (player.y > this.y)
            nexty += 1;
        if (dx > dy) {
            if (world.pathfinding.isPassable(nextx, this.y, this))
                this.x = nextx;
            else if (world.pathfinding.isPassable(this.x, nexty, this))
                this.y = nexty;
        } else {
            if (world.pathfinding.isPassable(this.x, nexty, this))
                this.y = nexty;
            else if (world.pathfinding.isPassable(nextx, this.y, this))
                this.x = nextx;
        }
    }

    move(forced) {
        if (forced && !this.aggred)
            return;
        if (this.rules == "goblin") {
            if (world.pathfinding.isPassable(this.x, this.y, this)) {
                if (this.aggred)
                    this.moveTowardsPlayer();
                else
                    this.moveRandomlyInsideRoamingArea();
            } else {
                this.die();
            }
        }
        if (this.rules == "fish") {
            if (world.pathfinding.isPassableForFish(this.x, this.y, this)) {
                let dx = 0,
                    dy = 0;
                let r = Math.random();
                if (r < 0.25)
                    dx = 1;
                else if (r < 0.5)
                    dx = -1;
                else if (r < 0.75)
                    dy = 1;
                else
                    dy = -1;
                if (world.pathfinding.isPassableForFish(this.x + dx, this.y + dy, this)) {
                    this.x += dx;
                    this.y += dy;
                }
            } else {
                this.die();
            }
        }
    }
}

class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.stats = rpg.player_start;
        this.mana = this.stats.mana;
        this.hp = this.stats.hp;
        this.img = images.prepare("player");
        this.inventory = []
    }

    tryMove(dx, dy) {
        if (this.hp <= 0)
            return false;
        const newx = this.x + dx;
        const newy = this.y + dy;
        if (!world.pathfinding.isPassable(newx, newy, this))
            return false;
        this.x = newx;
        this.y = newy;
        for (let n = 0; n < world.objects.length; n++) {
            let obj = world.objects[n];
            if ('hasContact' in obj && obj.hasContact(this.x, this.y))
                obj.onContact(this)
            else if (obj.x == this.x && obj.y == this.y && !(obj instanceof BigScaryObject))
                obj.onContact(this)
        }
        world.nextTurn(true)
        return true;
    }

    tryCast(targetX, targetY, spell) {
        if (this.stats.mana < 50)
            return; // casting is not opened yet
        let dx = targetX - this.x;
        let dy = targetY - this.y;
        let manaToCast = 10;
        if (dx <= 2 && dx >= -2 && dy <= 2 && dy >= -2) {
            if (this.mana < manaToCast) {
                animations.add(new SystemMessage(0.5, "Не хватает маны"), player);
                return;
            }
            const duration = 0.3
            const direction = {
                x: dx * tileSize,
                y: dy * tileSize
            }
            animations.add(new Bullet(direction, duration), this);
            this.mana -= manaToCast;
            setTimeout(() => {
                let tile = world.terrain[targetX][targetY];
                if (tile != TERRAIN_DARK_FOREST && tile != TERRAIN_STONE_WALL)
                    world.terrain[targetX][targetY] = TERRAIN_STONE;
                world.script.onCast(targetX, targetY, spell);
            }, 300);
        }
    }

    draw(ctx, x, y) {
        if (this.hp <= 0) {
            images.draw(ctx, "bones", x, y);
            return;
        }
        images.draw(ctx, this.img, x, y);
        if (this.sword && this.sword.img)
            images.draw(ctx, this.sword.img, x, y);
        if (this.shield && this.shield.img)
            images.draw(ctx, this.shield.img, x, y);
        if (this.inCombat)
            drawHPbar(ctx, this.hp, this.stats.hp, x, y)
    }

    nextTurn() {
        if (this.mana < this.stats.mana)
            this.mana++;
        if (this.mana > this.stats.mana)
            this.mana = this.stats.mana;
        if (this.hp < this.stats.hp)
            this.hp++;
        if (this.hp > this.stats.hp)
            this.hp = this.stats.hp;
        this.inCombat = false;
        for (let n = 0; n < world.objects.length; n++) {
            let obj = world.objects[n];
            if ('isEnemy' in obj && obj.isEnemy() && attackIfNear(player, obj)) {
                this.inCombat = true;
                break;
            }
        }
    }

    takeItem(itemName) {
        let itemRpg = rpg[itemName];
        if (!itemRpg) {
            ui.dialogUI.addMessage("Unknown item " + itemName, errorSpeaker);
            return false;
        }
        if (itemRpg.type) {
            let currentSlot = this[itemRpg.type];
            if (this.shouldEquip(currentSlot, itemRpg)) {
                itemRpg.img = images.prepare(itemRpg.equip_img);
                itemRpg.inventoryImg = images.prepare(itemRpg.inventory_img);
                this[itemRpg.type] = itemRpg;
                if (itemRpg.message)
                    ui.dialogUI.addMessage(itemRpg.message, playerSpeaker, player);
                return true;
            } else {
                if (itemRpg.reject)
                    ui.dialogUI.addMessage(itemRpg.reject, playerSpeaker, player);
                return false;
            }
        } else {
            this.inventory.push(itemRpg);
            itemRpg.inventoryImg = images.prepare(itemRpg.inventory_img);
            if (itemRpg.message)
                ui.dialogUI.addMessage(itemRpg.message, playerSpeaker, player);
            return true;
        }
    }

    loseItem(item) {
        if (item == this.sword)
            this.sword = null;
        if (item == this.shield)
            this.shield = null;
        let newInventory = [];
        for (let n = 0; n < this.inventory.length; n++)
            if (this.inventory[n] != item)
                newInventory.push(this.inventory[n]);
        this.inventory = newInventory;
    }

    shouldEquip(current, next) {
        if (!current)
            return true;
        return next.quality > current.quality;
    }

    damageBonus() {
        if (this.sword)
            return this.sword.quality;
        return 0;
    }

    defenceBonus() {
        if (this.shield)
            return this.shield.quality;
        return 0;
    }

    applyDamage(dmg) {
        if (this.hp <= 0) // already dead
            return;
        dmg -= this.defenceBonus();
        if (dmg <= 0)
            return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            world.script.onPlayerDeath();
        }
    }
};
