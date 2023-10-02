"use strict";

class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.pixelX = new SmoothlyChangingNumber(0);
        this.pixelY = new SmoothlyChangingNumber(0);
        this.stats = rpg.player_start;
        this.mana = this.stats.mana;
        this.hp = this.stats.hp;
        this.img = images.prepare("Animations/player");
        this.inventory = []
        this.takenQuests = []
        this.doneQuests = []
        this.doneAndRewardedQuests = []
        this.dialogState = {}
        this.frameX = 0
    }

    tryMove(dx, dy) {
        if (this.hp <= 0)
            return false;
        let newx, newy;
        if (dx)
            newx = dx + Math.round(this.pixelX.get() / tileSize);
        else
            newx = Math.round(this.pixelX.target / tileSize);
        if (dy)
            newy = dy + Math.round(this.pixelY.get() / tileSize);
        else
            newy = Math.round(this.pixelY.target / tileSize);
        if (!world.pathfinding.isPassable(newx, newy, this))
            return false;
        this.x = newx;
        this.y = newy;
        world.pathfinding.occupyTile(this, this.x, this.y);
        this.pixelX.set(this.x * tileSize, 0.2);
        this.pixelY.set(this.y * tileSize, 0.2);
        for (let n = 0; n < world.objects.length; n++) {
            let obj = world.objects[n];
            if ('hasContact' in obj && obj.hasContact(this.x, this.y))
                obj.onContact(this)
            else if (obj.x == this.x && obj.y == this.y && !(obj instanceof BigScaryObject) && 'onContact' in obj)
                obj.onContact(this)
        }
        world.nextTurn(true);
        ui.nearHouseUI.updateState();
        return true;
    }

    tryCast(target) {
        if (this.stats.spells.length == 0)
            return;
        if (!(this.selectedSpell >= 0 && this.selectedSpell < this.stats.spells.length))
            this.selectedSpell = 0;
        const spell = this.stats.spells[this.selectedSpell];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const range = rpg.spells[spell].radius;
        if (dx * dx + dy *dy > range * range)
            return;
        const manaToCast = rpg.spells[spell].cost;
        if (this.mana < manaToCast) {
            world.animations.add(new SystemMessage(0.5, "Не хватает маны"), player);
            return;
        }
        if ('checkCanCast' in world.script) {
            let canCast = world.script.checkCanCast(target.x, target.y, spell);
            if (!canCast)
                return;
        }    
        if (castSpell(player, spell, target))
            this.mana -= manaToCast;
    }

    draw(ctx, pixelOffset) {
        const pixelX = this.pixelX.get(), pixelY = this.pixelY.get();
        let x = pixelX - pixelOffset.x;
        let y = pixelY - pixelOffset.y;
        if (this.hp <= 0) {
            images.draw(ctx, "bones", x, y);
            return;
        }
        const img = images.getReadyImage(this.img);
        if (!img)
            return;
        const walkingFrameCount = img.height / 32 - 1;
        let frameY = 0;
        let dx, dy;
        if (this.combatTarget) {
            dx = this.combatTarget.x * tileSize - pixelX;
            dy = this.combatTarget.y * tileSize - pixelY;
        } else {
            dx = this.pixelX.target - pixelX;
            dy = this.pixelY.target - pixelY;
        }
        if (dy < 0 && -dy > dx && -dy > -dx) {
            // up
            this.frameX = 1;
            frameY = Math.floor((pixelY % 64)/16) % walkingFrameCount;
        } else if (dy > 0 && dy > dx && dy > -dx) {
            // down
            this.frameX = 0;
            frameY = Math.floor((pixelY % 64)/16) % walkingFrameCount;
        } else if (dx > 0) {
            // right
            this.frameX = 2;
            frameY = Math.floor((pixelX % 64)/16) % walkingFrameCount;
        } else if (dx < 0) {
            // left
            this.frameX = 3;
            frameY = Math.floor((pixelX % 64)/16) % walkingFrameCount;
        }
        let equipmentFrameY = 0;
        if (this.combatTarget) {
            let halfSecondPart = 0.3 + 2 * globalTimer
            halfSecondPart -= Math.floor(halfSecondPart);
            if (halfSecondPart < 0.5)
                frameY = 0;
            else {
                frameY = walkingFrameCount;
                equipmentFrameY = 1;
            }
        }
        const drawEquipment = this.img == "Animations/player";
        const swordOnTheBack = (this.frameX == 1 || this.frameX == 2);
        const shieldOnTheBack = (this.frameX == 1);
        // back
        if (drawEquipment) {
            if (swordOnTheBack && this.sword && rpg[this.sword].equipImg)
                images.draw(ctx, rpg[this.sword].equipImg, this.frameX * 32, equipmentFrameY * 32, 32, 32, x, y, 32, 32);
            if (shieldOnTheBack && this.shield && rpg[this.shield].equipImg)
                images.draw(ctx, rpg[this.shield].equipImg, this.frameX * 32, equipmentFrameY * 32, 32, 32, x, y, 32, 32);
        }
        // body
        images.draw(ctx, this.img, this.frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);
        // front
        if (drawEquipment) {
            if (!swordOnTheBack && this.sword && rpg[this.sword].equipImg)
                images.draw(ctx, rpg[this.sword].equipImg, this.frameX * 32, equipmentFrameY * 32, 32, 32, x, y, 32, 32);
            if (!shieldOnTheBack && this.shield && rpg[this.shield].equipImg)
                images.draw(ctx, rpg[this.shield].equipImg, this.frameX * 32, equipmentFrameY * 32, 32, 32, x, y, 32, 32);
        }
        if (this.hp < this.stats.hp)
            drawHPbar(ctx, this.hp, this.stats.hp, x, y - 2)
    }

    nextTurn() {
        this.combatTarget = null;
        for (let n = 0; n < world.objects.length; n++) {
            let obj = world.objects[n];
            if ('isEnemy' in obj && obj.isEnemy() && attackIfNear(player, obj, player.sword)) {
                this.combatTarget = obj;
                break;
            }
        }
        if (this.mana < this.stats.mana)
            this.mana++;
        if (this.mana > this.stats.mana)
            this.mana = this.stats.mana;
        if (!this.combatTarget) {
            let restoreHp = 4;
            if ('getRestoreHp' in world.script)
                restoreHp = world.script.getRestoreHp();
            if (this.hp < this.stats.hp)
                this.hp += restoreHp;
            if (this.hp > this.stats.hp)
                this.hp = this.stats.hp;
        }
    }

    takeItem(itemName) {
        const itemRpg = rpg[itemName];
        if (!itemRpg) {
            ui.dialogUI.addMessage("Unknown item " + itemName, errorSpeaker);
            return false;
        }
        // check if already has one
        if (itemName == this.sword || itemName == this.shield || this.inventory.indexOf(itemName) >= 0) {
            if (itemRpg.reject)
                ui.dialogUI.addMessage(itemRpg.reject, playerSpeaker, player);
            else
                ui.dialogUI.addMessage(itemRpg.name + " у меня уже есть", playerSpeaker, player);
            return false;
        }
        // add to inventory
        this.inventory.push(itemName);
        images.prepare(itemRpg.inventoryImg);
        if (itemRpg.message)
            ui.dialogUI.addMessage(itemRpg.message, playerSpeaker, player);
        //ui.showStateHint(1);
        // see it should be auto-equipped
        if (itemRpg.type) {
            let currentItemInSlot = this[itemRpg.type];
            if (this.shouldAutoEquip(rpg[currentItemInSlot], itemRpg)) {
                images.prepare(itemRpg.equipImg);
                this[itemRpg.type] = itemName;
                if (currentItemInSlot)
                    this.inventory[this.inventory.length-1] = currentItemInSlot;
                else
                    this.inventory.pop();
            }
        }
        return true;
    }

    equipItem(itemName) {
        if (!itemName)
            return false;
        const itemRpg = rpg[itemName];
        if (!itemRpg.type)
            return false;
        const currentItemInSlot = this[itemRpg.type];
        images.prepare(itemRpg.equipImg);
        this[itemRpg.type] = itemName;
        if (currentItemInSlot) {
            const invIndex = this.inventory.indexOf(itemName);
            if (invIndex >= 0)
                this.inventory[invIndex] = currentItemInSlot;
            else
                this.inventory.push(currentItemInSlot);
        }
        return true;
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

    shouldAutoEquip(current, next) {
        if (!current)
            return true;
        return next.quality > current.quality;
    }

    damageBonus() {
        if (this.sword)
            return rpg[this.sword].quality;
        return 0;
    }

    defenceBonus() {
        if (this.shield)
            return rpg[this.shield].quality;
        return 0;
    }

    applyDamage(dmg, item) {
        if (this.hp <= 0) // already dead
            return;
        if (item != "magic")
            dmg -= this.defenceBonus();
        if (dmg <= 0)
            return;
        this.hp -= dmg;
        this.checkDeath();
    }

    applyHealing(amount) {
        this.hp += amount;
        if (this.hp > this.stats.hp)
            this.hp = this.stats.hp;
    }

    checkDeath() {
        if (this.hp > 0)
            return;
        let deathMessage1, deathMessage2;
        if ('playerDeathMessage' in world.script) {
            deathMessage1, deathMessage2 = world.script.playerDeathMessage();
        }
        if (!deathMessage1) {
            deathMessage1 = randomFrom(player.stats.deathMessages);
            deathMessage2 = "";
        }    
        world.animations.add(new FadeToBlack(4, deathMessage1, deathMessage2), player);
        setTimeout(() => {
            loadAutosave();
        }, 1500);
    }

    teleport(x, y) {
        this.x = x;
        this.y = y;
        this.pixelX = new SmoothlyChangingNumber(x * tileSize);
        this.pixelY = new SmoothlyChangingNumber(y * tileSize);
        world.vision.recalculateLocalVisibility();
    }
};
