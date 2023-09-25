class AllScripts {
    constructor() {
        this.triggers = [];
        this.done = [];
    }

    _executeTriggers() {
        for (let n = this.done.length; n < this.triggers.length; n++)
            this.done.push(false);
        for (let n = 0; n < this.triggers.length; n++) {
            if (this.done[n])
                continue;
            let t = this.triggers[n];
            let finished = t();
            if (finished)
                this.done[n] = true;
        }
        for (let questName in quests) {
            let quest = quests[questName];
            if (quest.map == world.mapName && quest.isDone && quest.isDone())
                finishQuest(questName);
        }
    }

    _startSequence() {
        this.delay = 0;
        this.noControl = true;
        this.stopGameplayTime = true;
        ui.state = 2;
    }

    _finishSequence() {
        setTimeout(() => {
            this.noControl = false;
            this.stopGameplayTime = false;
            this.viewPoint = null;
        }, this.delay * 1000);
    }

    _wait(seconds) {
        this.delay += seconds;
    }

    _do(fn) {
        setTimeout(fn, this.delay * 1000);
    }

    _finishQuest(name) {
        setTimeout(() => {
            finishQuest(name);
        }, this.delay * 1000);
    }

    _say(text, speaker, gameplayObj) {
        setTimeout(() => {
            ui.dialogUI.addMessage(text, speaker, gameplayObj, true);
        }, this.delay * 1000);
        this.delay += (text.length + 80) / 40
    }

    _teleportPlayer(x, y) {
        setTimeout(() => {
            player.teleport(x, y)
        }, this.delay * 1000);
    }

    _movePlayer(dx, dy) {
        setTimeout(() => {
            player.x += dx;
            player.y += dy;
            player.pixelX.set(player.x * tileSize, 0.5);
            player.pixelY.set(player.y * tileSize, 0.5);
            world.vision.recalculateLocalVisibility();
        }, this.delay * 1000);
        this.delay += 0.5
    }

    _addMob(x, y, name, image, rules, loot) {
        let obj = {
            class: "Mob",
            name: name,
            Image: image,
            Rules: rules,
            Loot: loot
        };
        return world.addNewObject(obj, x, y);
    }

    _moveMob(mob, dx, dy) {
        setTimeout(() => {
            mob.x += dx;
            mob.y += dy;
            mob.pixelX.set(mob.x * tileSize, 0.5);
            mob.pixelY.set(mob.y * tileSize, 0.5);
        }, this.delay * 1000);
        this.delay += 0.5
    }

    _fade(text, time) {
        setTimeout(() => {
            world.animations.add(new FadeToBlack(time, text), player);
        }, this.delay * 1000);
    }

    _changeMap(name, oldName) {
        setTimeout(() => {
            changeWorldTo(name, true, oldName);
        }, this.delay * 1000);
    }
}

function addSmokeParticle(baseObject, pixelXobject, pixelYobject, strength, fire, pixelOffset) {
    let pixelX = baseObject.toWorldX(pixelXobject, pixelYobject);
    let pixelY = baseObject.toWorldY(pixelXobject, pixelYobject);
    fire.emitParticles(pixelX, pixelY, strength, pixelOffset);
}

function isLookingGlass(item) {
    
}

function playerKnowsSpell(spell) {
    return player.stats.spells.indexOf(spell) >= 0;
}

function dist2obj(obj1, obj2) {
    return (obj1.x - obj2.x) * (obj1.x - obj2.x) + (obj1.y - obj2.y) * (obj1.y - obj2.y)
}

class EmptyScript extends AllScripts {
    constructor(world) {
        super();
    }
    nextTurn(forced) {
        this._executeTriggers()
    }
    onItemUse(item) {
        return false;
    }
};
