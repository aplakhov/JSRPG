"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const halfTileSize = tileSize / 2;
const viewInPixels = 768;
const viewInTiles = 24;
const halfViewInPixels = 384;
const halfViewInTiles = 12;

let player = new Player();
//let world = new World("intro_map", "Europe/");
//let world = new World("town_map", "Europe/");
//let world = new World("desert_test_map", "Desert/");
let world = new World("snow_test_map", "Snow/");

setInterval(() => {
        if (world.script.stopGameplayTime)
            return;
        world.nextTurn(false);
        player.nextTurn();
        ui.goals.nextTurn();
    },
    1000
);

function clamp(x, minx, maxx) {
    return x > minx ? (x < maxx ? x : maxx) : minx;
};

function tileAt(x, y) {
    let r2 = (x - 50) * (x - 50) + (y - 50) * (y - 50);
    return r2 < 2500 ? 1 : 0;
};

function canvasOffset() {
    const leftX = player.pixelX.get() - halfViewInPixels;
    const topY = player.pixelY.get() - halfViewInPixels;
    const minx = clamp(leftX, 0, world.width * tileSize - viewInPixels);
    const miny = clamp(topY, 0, world.height * tileSize - viewInPixels);
    return {
        x: Math.floor(minx),
        y: Math.floor(miny)
    };
}

class TileUnderCursor {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.changed = 0;
    }

    set(x, y) {
        if (x == this.x && y == this.y)
            return;
        this.x = x;
        this.y = y;
        this.changed = Date.now() / 1000.;
    }

    hideTooltip() {
        this.changed = 0;
    }

    needShowTooltip() {
        let now = Date.now() / 1000.;
        if (world.script.noControl)
            return false;
        if (now < this.changed + 0.5 || now > this.changed + 4)
            return false;
        return true;
    }
}

function updateTileUnderCursor(mouseEvent) {
    const rect = mouseEvent.target.getBoundingClientRect();
    const pixelOffset = canvasOffset();
    if (mouseEvent.clientX >= rect.left + dialogUIleftOffset)
        ui.tileUnderCursor.hideTooltip();
    const tileX = ((pixelOffset.x + mouseEvent.clientX - rect.left) / tileSize) >> 0;
    const tileY = ((pixelOffset.y + mouseEvent.clientY - rect.top) / tileSize) >> 0;
    ui.tileUnderCursor.set(tileX, tileY);
};

class DialogUI {
    constructor(ctx, left, top, width, height, padding) {
        this.ctx = ctx;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.padding = padding;

        this.messages = [];
        this.lineHeight = 24;
        this.distBetweenMessages = 12;
        this.portraitSize = 50;

        this.maxTextWidth = this.width - this.portraitSize - 5 * this.padding;
        this.lastMessageAdded = Date.now() / 1000.;
    }

    addMessageImpl(text, color, bgColor, font, portrait, okToRepeat) {
        if (text == "")
            return false;
        if (!okToRepeat) {
            for (let n = this.messages.length - 1; n >= 0; n--) {
                let oldMessage = this.messages[n];
                if (text == oldMessage.text && portrait && portrait.src == oldMessage.portrait.src)
                    return false;
            }
        }
        let message = new Utterance(this.ctx, text, this.maxTextWidth, color, bgColor, font, this.lineHeight, this.padding);
        message.portrait = portrait;
        this.messages.push(message);
        this.lastMessageAdded = Date.now() / 1000.;
        return true;
    }

    addMessage(text, speaker, baseTile, okToRepeat) {
        if (text instanceof Array)
            text = randomFrom(text);
        if (!this.addMessageImpl(text, speaker.color, speaker.bgColor, speaker.font, speaker.portrait, okToRepeat))
            return;
        if (baseTile) {
            for (let n = 0; n < animations.animations.length; n++) {
                let oldAnim = animations.animations[n];
                if (oldAnim instanceof DialogMessages && oldAnim.baseTile == baseTile) {
                    oldAnim.addMessage(ctx, text, speaker);
                    return;
                }
            }
            animations.add(new DialogMessages(ctx, text, speaker), baseTile);
        }
    }

    draw() {
        let timeFromLastMessage = Date.now() / 1000. - this.lastMessageAdded;
        if (timeFromLastMessage > 1)
            timeFromLastMessage = 1;

        this.ctx.fillStyle = 'rgb(240, 214, 175)';
        this.ctx.fillRect(this.left, this.top, this.width, this.height);

        let oldPortrait = null;
        let oldPortraitTop = 100000;
        let bottomOfMessage = this.top + this.height - this.distBetweenMessages;

        for (let n = this.messages.length - 1; n >= 0; n--) {
            let msg = this.messages[n];
            if (n == this.messages.length - 1) {
                if (timeFromLastMessage < 0.3)
                    bottomOfMessage += (0.3 - timeFromLastMessage) * 3.33 * msg.textBoxHeight;
            }
            if (msg.portrait && msg.portrait != oldPortrait) {
                if (bottomOfMessage > oldPortraitTop - this.padding)
                    bottomOfMessage = oldPortraitTop - this.padding;
                images.draw(this.ctx, msg.portrait, this.left + this.padding, bottomOfMessage - this.portraitSize);
                oldPortrait = msg.portrait;
                oldPortraitTop = bottomOfMessage - this.portraitSize;
            }
            let textBoxLeft = this.left + this.portraitSize + 2 * this.padding;
            let textBoxTop = bottomOfMessage - msg.textBoxHeight;
            msg.draw(this.ctx, textBoxLeft, textBoxTop, this.maxTextWidth, false);

            bottomOfMessage -= msg.textBoxHeight;
            bottomOfMessage -= this.distBetweenMessages;
            if (bottomOfMessage <= 0)
                return;
        }
    }
};

const playerSpeaker = {
    color: "rgb(10, 10, 10)",
    bgColor: "rgb(255, 255, 255)",
    font: '18px sans-serif',
    portrait: images.prepare("portrait1")
};
const systemMessageSpeaker = {
    color: "rgb(140, 104, 20)",
    bgColor: "rgb(240, 214, 175)",
    font: '18px sans-serif',
    portrait: null
};
const errorSpeaker = {
    color: "rgb(255, 0, 0)",
    bgColor: "rgb(0, 0, 0)",
    font: '18px sans-serif',
    portrait: null
};

class ManaBar {
    constructor(ctx, width, color1, color2) {
        this.ctx = ctx;
        ctx.font = "10px sans-serif";
        this.textWidth = ctx.measureText("199/199").width;
        this.gapWidth = 3;
        this.barWidth = Math.floor(width - this.textWidth - this.gapWidth);
        this.color1 = color1;
        this.color2 = color2;
    }

    draw(mana, maxMana, x, y) {
        let wMana = Math.floor(this.barWidth * mana / maxMana);

        this.ctx.fillStyle = this.color1;
        this.ctx.fillRect(x, y - 4, wMana, 8);
        if (wMana < this.barWidth) {
            this.ctx.fillStyle = this.color2;
            this.ctx.fillRect(x + wMana, y - 4, this.barWidth - wMana, 8);
        }

        let text = mana + "/" + maxMana;
        this.ctx.font = "10px sans-serif";
        this.ctx.fillStyle = "black";
        let realTextWidth = this.ctx.measureText(text).width;
        let textX = x + this.barWidth + this.gapWidth + (this.textWidth - realTextWidth) / 2;
        this.ctx.fillText(text, textX, y + 3); // TODO: magic const 3
    }
}

class Goals {
    constructor(ctx) {
        this.ctx = ctx;
        this.hidden = true;
        this.button = makeImage("goals_button");
        this.font = "18px sans-serif";
        this.headerFont = "32px sans-serif";
        this.header = "Дела на сегодня";
        ctx.font = this.headerFont;
        this.headerWidth = ctx.measureText(this.header).width;
        this.maxGoalWidth = 0;
        this.goals = []
        this.triggers = []
        this.done = []
    }

    addGoal(line, trigger) {
        this.ctx.font = this.font;
        let width = ctx.measureText(line).width;
        if (this.maxGoalWidth < width)
            this.maxGoalWidth = width;
        this.goals.push(line);
        this.triggers.push(trigger);
        this.done.push(false);
    }

    nextTurn() {
        for (let n = 0; n < this.triggers.length; n++) {
            if (this.done[n])
                continue;
            let t = this.triggers[n];
            if (!t)
                continue;
            if (t())
                this.done[n] = true;
        }
    }

    draw() {
        if (!this.hidden) {
            const backColor = "rgb(240, 214, 175)";
            const foreColor = "rgb(140, 104, 20)";
            let x = 100,
                y = 100;
            let w = dialogUIleftOffset - 2 * x;
            let h = 64 + 72 + 24 * this.goals.length;
            this.ctx.fillStyle = backColor;
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeStyle = foreColor;
            this.ctx.strokeRect(x + 0.5, y + 0.5, w, h);
            this.ctx.fillStyle = foreColor;
            this.ctx.font = this.headerFont;
            this.ctx.fillText(this.header, x + (w - this.headerWidth) / 2, y + 64);
            this.ctx.font = this.font;
            for (let n = 0; n < this.goals.length; ++n) {
                let goal = this.goals[n];
                let left = x + (w - this.maxGoalWidth) / 2;
                let top = y + 64 + 48 + 24 * n;
                this.ctx.fillText(goal, left, top);
                if (this.done[n])
                    ui._line(ctx, left, top - 6, left + ctx.measureText(goal).width, top - 6);
            }
        }
        if (this.button.complete) {
            this.buttonX = (2 * tileSize - this.button.width) / 2;
            this.buttonY = (ctx.canvas.height - 2 * tileSize) + (2 * tileSize - this.button.height) / 2;
            this.ctx.drawImage(this.button, this.buttonX, this.buttonY)
        }
    }

    onclick(mouseEvent) {
        const rect = mouseEvent.target.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        if (this.hidden) {
            if (x < this.buttonX || y < this.buttonY || x >= this.buttonX + this.button.width || y >= this.buttonY + this.button.height)
                return false;
        }
        this.hidden = !this.hidden;
        return true;
    }
};

const dialogUIleftOffset = 768;
const uiWidth = canvas.width - dialogUIleftOffset;
const dialogUIheight = canvas.height - 80;
const dialogUIpadding = 5;
const barPadding = 5;

class UI {
    constructor() {
        this.tileUnderCursor = new TileUnderCursor();

        this.state = 2;
        this.inventoryImg = makeImage("inventory");

        this.dialogUI = new DialogUI(
            ctx, dialogUIleftOffset, 0, uiWidth, dialogUIheight, dialogUIpadding
        );
        this.stateImages = [
            makeImage("icons1"),
            makeImage("icons2"),
            makeImage("icons3"),
        ];
        this.spellImages = {
            none: images.prepare("spell_none"),
            stone: images.prepare("spell_stone"),
            fire: images.prepare("spell_fire"),
        };

        this.goals = new Goals(ctx);
        world.script.initGoals(this.goals);
        setTimeout(() => {
            this.goals.hidden = false
        }, 500)

        this.manaBar = new ManaBar(ctx, uiWidth - 2 * barPadding, "rgb(0, 38, 255)", "rgb(0, 148, 255)")
        this.healthBar = new ManaBar(ctx, uiWidth - 2 * barPadding, "rgb(255, 0, 40)", "rgb(255, 150, 190)")
    }

    _drawTwoStatStrings(left, top, str1, str2) {
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "rgb(140, 104, 20)";
        ctx.fillText(str1, left, top + this.statLinesDrawn * 24);
        if (str2) {
            let w = ctx.measureText(str1).width;
            ctx.fillStyle = "rgb(0, 25, 170)";
            ctx.fillText(str2, left + w + 5, top + this.statLinesDrawn * 24);
        }
        this.statLinesDrawn++;
    }

    _drawStats(left, top) {
        this.statLinesDrawn = 0;
        if (player.stats.mana)
            this._drawTwoStatStrings(left, top, "Магическая сила: ", player.stats.mana);
        this._drawTwoStatStrings(left, top, "Здоровье: " + player.stats.hp, "");
        let attackStr = "Атака: " + player.stats.attackMin + "−" + player.stats.attackMax;
        let attackBonusStr = "";
        if (player.damageBonus())
            attackBonusStr = "+" + player.damageBonus();
        this._drawTwoStatStrings(left, top, attackStr, attackBonusStr);
        if (player.defenceBonus()) {
            this._drawTwoStatStrings(left, top, "Защита: ", "+" + player.defenceBonus());
        }
    }

    _drawMagic() {
        const maxSlotX = 3, maxSlotY = 4;
        for (let slotX = 0; slotX < maxSlotX; slotX++) {
            for (let slotY = 0; slotY < maxSlotY; slotY++) {
                let img = this.spellImages.none;
                if (player.stats.mana >= 50 && slotX == 0 && slotY == 0)
                    img = this.spellImages.stone;
                //if (slotX == 1 && slotY == 0)
                //    img = this.spellImages.fire;
                this._drawInventoryItem(slotX, slotY, img);
            }
        }

        const x = this._inventoryX();
        const y = 90;
        let slotX = Math.floor((this.mouseSelfX - x)/64);
        let slotY = Math.floor((this.mouseSelfY - y)/64);
        let tooltip, tooltipEm;
        if (player.stats.mana >= 50 && slotX == 0 && slotY == 0) {
            tooltip = "Создать камень";
            tooltipEm = "10 мана";
        }
        //else if (slotX == 1 && slotY == 0)
        //    tooltip = "Призвать огонь";
        else if (slotX >= 0 && slotX < maxSlotX && slotY >= 0 && slotY < maxSlotY)
            tooltip = "Не выученное заклинание";
        if (tooltip)
            this._drawInventoryTooltip(tooltip, tooltipEm, this.mouseSelfX, this.mouseSelfY);
    }

    _drawInventoryItem(slotX, slotY, img) {
        if (!img)
            return;
        const y = 90;
        images.draw(ctx, img, this._inventoryX() + slotX * 64, y + slotY * 64);
    }

    _drawInventoryTooltip(text, secondaryText, left, top) {
        const maxWidth = 320;
        const lineHeight = 24;
        const padding = 5;
        let u = new Utterance(ctx, text, maxWidth, systemMessageSpeaker.color,
            systemMessageSpeaker.bgColor, systemMessageSpeaker.font, lineHeight, padding);
        if (secondaryText)
            u.addText(ctx, secondaryText, maxWidth, "rgb(0, 25, 170)");
        left -= u.textBoxWidth / 2;
        if (left <= dialogUIleftOffset)
            left = dialogUIleftOffset + 1;
        if (left + u.textBoxWidth + 6 >= canvas.width)
            left = canvas.width - u.textBoxWidth - 6;
        u.draw(ctx, left, top - u.textBoxHeight, 0, true);    
    }

    _inventoryX() {
        const width = canvas.width - dialogUIleftOffset;
        return dialogUIleftOffset + Math.floor((width - this.inventoryImg.width) / 2);
    }

    _drawInventory() {
        const x = this._inventoryX();
        const y = 90;
        ctx.drawImage(this.inventoryImg, x, y);

        let slotX = Math.floor((this.mouseSelfX - x)/64);
        let slotY = Math.floor((this.mouseSelfY - y)/64);
        let tooltip, tooltipEm;

        if (player.sword) {
            this._drawInventoryItem(0, 0, player.sword.inventoryImg);
            if (slotX == 0 && slotY == 0) {
                tooltip = player.sword.name;
                if (player.sword.quality)
                    tooltipEm = "Атака +" + player.sword.quality;
            }
        }
        if (player.shield) {
            this._drawInventoryItem(2, 0, player.shield.inventoryImg);
            if (slotX == 2 && slotY == 0) {
                tooltip = player.shield.name;
                tooltipEm = "Защита +" + player.shield.quality;
            }
        }
        for (let n = 0; n < player.inventory.length; n++) {
            let item = player.inventory[n];
            let invSlotX = n % 3, invSlotY = 1 + Math.floor(n/3);
            this._drawInventoryItem(invSlotX, invSlotY, item.inventoryImg);
            if (slotX == invSlotX && slotY == invSlotY) {
                tooltip = item.name;
                tooltipEm = item.description;
            }
        }

        if (tooltip)
            this._drawInventoryTooltip(tooltip, tooltipEm, this.mouseSelfX, this.mouseSelfY);
    }

    _onInventoryClick() {
        const x = this._inventoryX();
        const y = 90;
        let slotX = Math.floor((this.mouseSelfX - x)/64);
        let slotY = Math.floor((this.mouseSelfY - y)/64);
        let itemToUse = null;
        if (slotX == 0 && slotY == 0 && player.sword)
            itemToUse = player.sword;
        if (slotX == 2 && slotY == 0 && player.shield)
            itemToUse = player.shield;
        if (slotY >= 1) {
            let n = (slotY - 1) * 3 + slotX;
            if (n < player.inventory.length)
                itemToUse = player.inventory[n];
        }
        if (itemToUse) {
            let success = world.script.onItemUse(itemToUse);
            if (!success && itemToUse.use_message)
                this.dialogUI.addMessage(itemToUse.use_message, playerSpeaker, player, true);
        }
    }

    _line(ctx, x1, y1, x2, y2) {
        ctx.strokeStyle = 'rgb(140, 104, 20)';
        ctx.beginPath();
        ctx.moveTo(x1 + 0.5, y1 + 0.5);
        ctx.lineTo(x2 + 0.5, y2 + 0.5);
        ctx.stroke();
    }

    drawTooltip(ctx, pixelOffset) {
        if (this.tileUnderCursor.needShowTooltip())
            drawTooltip(ctx, pixelOffset, this.tileUnderCursor);
    }

    draw(ctx) {
        if (this.state == 2) {
            this.dialogUI.draw();
        } else {
            const backColor = "rgb(240, 214, 175)";
            ctx.fillStyle = backColor;
            ctx.fillRect(dialogUIleftOffset, 0, uiWidth, canvas.height);
            if (this.state == 0) {
                this._drawMagic();
                let statsPadding = 5;
                this._drawStats(this._inventoryX() + statsPadding, 400);
            } else
                this._drawInventory();
        }

        const dialogUItopOffset = 40;
        let showMana = player.stats.mana > 0;
        let showHP = player.hp < player.stats.hp;
        if (showMana || showHP) {
            ctx.fillStyle = 'rgb(240, 214, 175)';
            if (showHP)
                ctx.fillRect(dialogUIleftOffset, 0, uiWidth, dialogUItopOffset);
            else
                ctx.fillRect(dialogUIleftOffset, 0, uiWidth, dialogUItopOffset / 2);
        }
        if (showMana) {
            this._line(ctx, dialogUIleftOffset, dialogUItopOffset / 2, dialogUIleftOffset + uiWidth, dialogUItopOffset / 2);
            this.manaBar.draw(player.mana, player.stats.mana, dialogUIleftOffset + barPadding, dialogUItopOffset / 4);
        }
        if (showHP) {
            this._line(ctx, dialogUIleftOffset, dialogUItopOffset, dialogUIleftOffset + uiWidth, dialogUItopOffset);
            this.healthBar.draw(player.hp, player.stats.hp, dialogUIleftOffset + barPadding, dialogUItopOffset * 3 / 4);
        }
        let stateImg = this.stateImages[this.state];
        if (stateImg.complete)
            ctx.drawImage(stateImg, dialogUIleftOffset, dialogUIheight);
        this._line(ctx, dialogUIleftOffset, 0, dialogUIleftOffset, canvas.height);

        if (!world.script.noControl)
            this.goals.draw();
    }

    onclick(mouseEvent) {
        if (this.goals.onclick(mouseEvent))
            return true;
        this.onmousemove(mouseEvent);
        if (this.mouseSelfY > dialogUIheight && this.mouseSelfX > dialogUIleftOffset) {
            let state = Math.floor((this.mouseSelfX - dialogUIleftOffset) * 3 / (canvas.width - dialogUIleftOffset));
            if (state >= 0 && state <= 2)
                this.state = state;
        } else if (this.state == 1) {
            this._onInventoryClick();
        }
        return this.mouseSelfX > dialogUIleftOffset;
    }

    onmousemove(mouseEvent) {
        const rect = mouseEvent.target.getBoundingClientRect();
        this.mouseSelfX = mouseEvent.clientX - rect.left;
        this.mouseSelfY = mouseEvent.clientY - rect.top;
    }
}
let ui = new UI();

canvas.onmousemove = function clickEvent(e) {
    updateTileUnderCursor(e);
    ui.onmousemove(e);
}

canvas.onclick = function clickEvent(e) {
    updateTileUnderCursor(e);
    ui.tileUnderCursor.hideTooltip();
    if (world.script.noControl)
        return;
    if (ui.onclick(e))
        return;
    player.tryCast(ui.tileUnderCursor.x, ui.tileUnderCursor.y, "stone")
}

addEventListener("keyup", function(event) {
    ui.tileUnderCursor.hideTooltip();
    ui.goals.hidden = true;
    if (world.script.noControl)
        return;
    if (event.key == "ArrowLeft")
        player.tryMove(-1, 0);
    if (event.key == "ArrowUp")
        player.tryMove(0, -1);
    if (event.key == "ArrowRight")
        player.tryMove(1, 0);
    if (event.key == "ArrowDown")
        player.tryMove(0, 1);
    if (event.key == "f")
        animations.add(new FadeToBlack(4, "Тем временем..."), player);
    if (event.key == "`")
        drawAI = !drawAI;
    if (event.key == "s")
        saveGameState(world, player, ui);
});
