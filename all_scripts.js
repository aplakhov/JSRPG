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
    }
    _startSequence() {
        this.delay = 0;
        this.noControl = true;
        this.stopGameplayTime = true;
        ui.goals.hidden = true;
        ui.state = 2;
    }

    _finishSequence() {
        setTimeout(() => {
            this.noControl = false;
            this.stopGameplayTime = false;
        }, this.delay * 1000);
    }

    _pause(seconds) {
        this.delay += seconds;
    }

    _say(text, speaker, gameplayObj) {
        setTimeout(() => {
            ui.dialogUI.addMessage(text, speaker, gameplayObj, true);
        }, this.delay * 1000);
        this.delay += (text.length + 80) / 40
    }

    _movePlayer(dx, dy) {
        setTimeout(() => {
            player.x += dx;
            player.y += dy;
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
            animations.add(new FadeToBlack(time, text), player);
        }, this.delay * 1000);
    }
}
