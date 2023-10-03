"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const halfTileSize = tileSize / 2;
const viewInPixels = 768;
const viewInTiles = 24;
const halfViewInPixels = 384;
const halfViewInTiles = 12;

function clamp(x, minx, maxx) {
    return x > minx ? (x < maxx ? x : maxx) : minx;
};

function tileAt(x, y) {
    let r2 = (x - 50) * (x - 50) + (y - 50) * (y - 50);
    return r2 < 2500 ? 1 : 0;
};

function canvasOffset() {
    let viewPointX, viewPointY; 
    if (world.script.viewPoint) {
        viewPointX = world.script.viewPoint.x * tileSize;       
        viewPointY = world.script.viewPoint.y * tileSize;       
    } else {
        viewPointX = player.pixelX.get();
        viewPointY = player.pixelY.get();
    }
    const leftX = viewPointX - halfViewInPixels;
    const topY = viewPointY - halfViewInPixels;
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

function updateTileUnderCursor(x, y) {
    const pixelOffset = canvasOffset();
    if (x >= dialogUIleftOffset)
        ui.tileUnderCursor.hideTooltip();
    const tileX = ((pixelOffset.x + x) / tileSize) >> 0;
    const tileY = ((pixelOffset.y + y) / tileSize) >> 0;
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
            for (let oldAnim of world.animations.animations) {
                if (oldAnim instanceof DialogMessages && oldAnim.baseTile == baseTile) {
                    oldAnim.addMessage(ctx, text, speaker);
                    return;
                }
            }
            world.animations.addUIanimation(new DialogMessages(ctx, text, speaker), baseTile);
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
                images.draw(this.ctx, msg.portrait, this.left + this.padding, bottomOfMessage - this.portraitSize, 50, 50);
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
    portrait: images.prepare("Portraits/player")
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

class GoalsUI {
    constructor(ctx) {
        this.ctx = ctx;
        this.hidden = true;
        this.button = images.prepare("UI/goals_button");
        this.font = "18px sans-serif";
        this.headerFont = "32px sans-serif";
        this.header = "Дела на сегодня";
        ctx.font = this.headerFont;
        this.headerWidth = ctx.measureText(this.header).width;
    }

    draw() {
        if (!this.hidden) {
            let maxGoalWidth = 0;
            let goals = [];
            let goalsDone = [];
            for (let questName of player.takenQuests) {
                const quest = quests[questName];
                if (quest.text && quest.map == world.mapName) {
                    goals.push(String(1 + goals.length) + ". " + quest.text);
                    goalsDone.push(player.doneQuests.indexOf(questName) >= 0);
                }
            }
            if (goals.length == 0) {
                goals.push("1. Осмотреться и разведать, что тут и как");
                goalsDone.push(false);
            }
            this.ctx.font = this.font;
            for (let n in goals) {
                let width = ctx.measureText(goals[n]).width;
                if (maxGoalWidth < width)
                    maxGoalWidth = width;
            }
            const backColor = "rgb(240, 214, 175)";
            const foreColor = "rgb(140, 104, 20)";
            let x = 100,
                y = 100;
            let w = dialogUIleftOffset - 2 * x;
            let h = 64 + 72 + 24 * goals.length;
            this.ctx.fillStyle = backColor;
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeStyle = foreColor;
            this.ctx.strokeRect(x + 0.5, y + 0.5, w, h);
            this.ctx.fillStyle = foreColor;
            this.ctx.font = this.headerFont;
            this.ctx.fillText(this.header, x + (w - this.headerWidth) / 2, y + 64);
            this.ctx.font = this.font;
            for (let n = 0; n < goals.length; ++n) {
                let goal = goals[n];
                let left = x + (w - maxGoalWidth) / 2;
                let top = y + 64 + 48 + 24 * n;
                this.ctx.fillText(goal, left, top);
                if (goalsDone[n])
                    ui._line(ctx, left, top - 6, left + ctx.measureText(goal).width, top - 6);
            }
        }
        this.buttonX = 5;
        this.buttonY = ctx.canvas.height - 34;
        images.draw(this.ctx, this.button, this.buttonX, this.buttonY)
    }

    onClick(x, y) {
        if (this.hidden) {
            let button = images.getReadyImage(this.button);
            if (!button || x < this.buttonX || y < this.buttonY || x >= this.buttonX + button.width || y >= this.buttonY + button.height)
                return false;
        }
        this.hidden = !this.hidden;
        return true;
    }
};

class RichButton {
    constructor(ctx, x, y, width, height, text, addText, squareImage, center) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.image = squareImage;
        ctx.font = systemMessageSpeaker.font;
        if (center) {
            this.textLeft = x + (width - ctx.measureText(text).width) / 2;
            if (squareImage)
                this.textLeft += height / 2;
        } else {
            this.textLeft = x + 20
            if (squareImage)
                this.textLeft += height;
        }
        if (addText) {
            let maxWidth = width;
            if (squareImage)
                maxWidth -= height;
            const padding = 5;
            this.addText = new Utterance(ctx, addText, maxWidth - 20, "rgb(10,10,10)", 
                systemMessageSpeaker.bgColor, systemMessageSpeaker.font, 20, padding);
            if (center) {
                this.addTextLeft = x + (width - this.addText.textBoxWidth) / 2;
                if (squareImage)
                    this.addTextLeft += height / 2;
            } else
                this.addTextLeft = this.textLeft - 5;
            if (this.text) {
                this.textTop = y + 20 + (height - 22 - this.addText.textBoxHeight) / 2;
                this.addTextTop = this.textTop + 6;
            } else {
                this.addTextTop = y + (height - this.addText.textBoxHeight) / 2;
            }
        } else {
            this.textTop = height/2 - 10;
        }
    }
    draw() {
        ctx.fillStyle = systemMessageSpeaker.bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (this.image)
            images.draw(ctx, this.image, this.x, this.y);
        ctx.strokeStyle = systemMessageSpeaker.color;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.font = systemMessageSpeaker.font;
        ctx.fillStyle = systemMessageSpeaker.color;
        if (this.text)
            ctx.fillText(this.text, this.textLeft, this.textTop);
        if (this.addText)
            this.addText.drawOnlyText(this.addTextLeft, this.addTextTop);
    }
    isInside(x, y) {
        return (x >= this.x && y >= this.y && x < this.x + this.width && y < this.y + this.height);
    }
};

function drawButtonSelection(ctx, selected) {
    ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
    ctx.fillRect(selected.x - 5, selected.y - 5, selected.width + 10, selected.height + 10);
}

class NearHouseUI {
    constructor(ctx) {
        this.hidden = true;
    }

    _makeEntryButton(text, addText) {
        ctx.font = systemMessageSpeaker.font;
        const width = Math.max(ctx.measureText(text).width, ctx.measureText(addText).width) + 30;
        const height = 50;
        const x = (768 - width) / 2;
        const y = 768 / 2 - height;
        this.entryButton = new RichButton(ctx, x, y, width, height, text, addText, null, true);
    }

    _updateStateIfNeeded(dx, dy) {
        let x = player.x + dx;
        if (x < 0 || x >= world.width)
            return false;
        let y = player.y + dy;
        if (y < 0 || y >= world.height)
            return false;
        let gameObj = world.pathfinding.isOccupied(x, y);
        if (gameObj && gameObj.coolImage) {
            if (this.hidden) {
                this.coolImage = gameObj.coolImage;
                this.gameObj = gameObj;
                if (gameObj.inside) 
                    this._makeEntryButton(gameObj.hint, "↩: зайти");
                else
                    this.entryButton = null;
            }
            return true;
        }
        if (dx == 0 && dy == 0) {
            let mapTransition = world.findMapTransition(x, y);
            if (mapTransition) {
                if (this.hidden) {
                    this.coolImage = "Places/" + mapTransition.targetMap;
                    this.gameObj = mapTransition;
                    this._makeEntryButton(mapTransition.message, "↩: уйти");
                }
                return true;
            }
        }
        return false;
    }

    updateState() {
        let nearHouse =
            this._updateStateIfNeeded(0, -1) ||
            this._updateStateIfNeeded(1, 0) ||
            this._updateStateIfNeeded(-1, 0) ||
            this._updateStateIfNeeded(0, 1) ||
            this._updateStateIfNeeded(0, 0);
        this.hidden = !nearHouse;
    }

    draw() {
        if (this.hidden)
            return;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, 768, 768);
        const coolImageSize = 256;
        let centerX = 768/2;
        let centerY = 768/2 - 2 * tileSize - coolImageSize / 2;
        let left = centerX - coolImageSize/2;
        let top = centerY - coolImageSize/2;
        images.draw(ctx, this.coolImage, left, top);
        if (this.entryButton) {
            this.entryButton.draw();
            if (this.entryButtonSelected)
                drawButtonSelection(ctx, this.entryButton);
        }
    }

    _enter() {
        if (this.gameObj.inside) {
            ui.blockingUI = new InsideHouseUI(ctx, this.gameObj.inside);
        } else if (this.gameObj.targetMap) {
            world.animations.add(new FadeToBlack(1, ""), player);
            changeWorldTo(this.gameObj.targetMap, true);
            this.hidden = true;
        }
    }

    onClick(x, y) {
        if (!this.hidden && this.entryButton && this.entryButton.isInside(x, y)) {
            this._enter();
            return true;
        }
        return false;
    }

    onMouseMove(x, y) {
        if (!this.hidden) {
            if (this.entryButton && this.entryButton.isInside(x, y))
                this.entryButtonSelected = true;
            else
                this.entryButtonSelected = false;
            return true;
        }
    }

    onKey(key) {
        if (this.hidden)
            return false;
        if (key == "Enter") {
            this._enter();
            return true;
        }
        if (key == "Escape") {
            this.hidden = true;
            return true;
        }        
        return false;
    }
};

class InsideHouseUI {
    constructor(ctx, inside) {
        this.inside = inside;
        this._switchToTalkersOverview()
    }

    _addExitButton(x, y) {
        const exitText = "← уйти";
        const width = ctx.measureText(exitText).width + 30;
        const height = 30;
        let b = new RichButton(ctx, x, y, width, height, "", exitText, null, true);
        this.buttons.push(b);
    }

    _switchToTalkersOverview() {
        this.buttons = []
        const padding = 10;
        const width = 768 - 2 * padding;
        const height = 256;
        const smallPadding = 6;
        const portraitHeight = 100;
        let inside = this.inside;
        this.buttons.push(new RichButton(ctx, padding, padding, width, height, inside.header, inside.description, inside.art, true));
        const portraitX = 200 + padding;
        let portraitY = padding * 2 + height;
        const buttonWidth = 768 - 2 * portraitX;
        this.characters = [];
        for (let questName in quests) {
            let quest = quests[questName];
            if (quest.map != world.mapName || !quest.place || world.scriptObjects[quest.place].inside != this.inside)
                continue;
            // ok, this is a quest from this place
            if (quest.canBeTaken && player.takenQuests.indexOf(questName) < 0 && !quest.canBeTaken())
                continue;
            // ok, this is a taken quest or a quest that we can take
            if (getCurrentDialog(questName) && this.characters.indexOf(quest.character) < 0)
                this.characters.push(quest.character);
        }
        for (let talkerName of this.characters) {
            let who = characters[talkerName];
            let b = new RichButton(ctx, portraitX, portraitY, buttonWidth, portraitHeight, who.text, who.addText, who.portrait, true);
            this.buttons.push(b);
            portraitY += smallPadding + portraitHeight;
        }
        this._addExitButton(portraitX, portraitY);
        this.selectedButton = 0;
        this.selectedTalker = null;
    }

    _collectAvailableQuests(characterName) {
        let res = [];
        for (let questName in quests) {
            let quest = quests[questName];
            if (quest.character == characterName && quest.map == world.mapName && getCurrentDialog(questName))
                res.push(questName);
        }
        return res;
    }

    _showTalkerUI(characterName) {
        console.log("Talking to", characterName);
        this.buttons = []
        const padding = 10;
        const width = 768 - 2 * padding;
        const smallPadding = 6;
        const portraitHeight = 100;
        let availableQuests = this._collectAvailableQuests(characterName);
        console.log("Available quests", availableQuests);
        if (!player.dialogState[characterName])
            player.dialogState[characterName] = { currentQuest: "", currentTalkingPoint: 0 }
        let dialogState = player.dialogState[characterName];

        if (!dialogState.currentQuest) {
            for (let questName of availableQuests) {
                let dialog = getCurrentDialog(questName);
                if (dialog[0][0] == "") { // первая реплика в этом диалоге принадлежит не игроку
                    dialogState.currentQuest = questName;
                    dialogState.currentTalkingPoint = 0;
                    break;
                }
            }
        }

        let dialog = getCurrentDialog(dialogState.currentQuest);
        let currentTalkingPoint = dialog[dialogState.currentTalkingPoint];

        // prepare portrait, caption and speaker data
        let who = characters[characterName];
        let caption = who.text;
        let portrait = who.portrait;
        let speaker = who.speaker;
        if (currentTalkingPoint.length > 3) {
            speaker = currentTalkingPoint[3];
            portrait = speaker.portrait;
            caption = speaker.text;
        }
        if (!speaker)
            speaker = {
                color: "rgb(10, 10, 10)",
                bgColor: "rgb(239, 230, 215)",
                font: '18px sans-serif',
                portrait: who.portrait
            };
        //
        setTimeout(() => {
            ui.dialogUI.addMessage(currentTalkingPoint[1], speaker);
        }, 500);
        this.buttons.push(new RichButton(ctx, padding, padding, width, portraitHeight, caption, currentTalkingPoint[1], portrait, false));
        const portraitX = 100 + padding;
        let buttonY = padding * 2 + portraitHeight;
        const buttonWidth = 768 - 2 * portraitX;
        const fontSize = 20;
        const buttonHeight = 2 * (fontSize + padding);
        if (currentTalkingPoint[2].length > 0) {
            for (let n of currentTalkingPoint[2]) {
                let answerText = dialog[n][0];
                let b = new RichButton(ctx, portraitX, buttonY, buttonWidth, buttonHeight, "", answerText, null, false);
                b.answerText = answerText;
                b.nextQuest = dialogState.currentQuest;
                b.nextTalkingPoint = n;
                this.buttons.push(b);
                buttonY += smallPadding + buttonHeight;
            }
        } else { // current dialog is finished
            finishDialog(dialogState.currentQuest);
            for (let questName of availableQuests) {
                if (questName == dialogState.currentQuest)
                    continue;
                let dialog = getCurrentDialog(questName);
                let talkingText = dialog[0][0];
                let b = new RichButton(ctx, portraitX, buttonY, buttonWidth, buttonHeight, "", talkingText, null, false);
                b.answerText = talkingText;
                b.nextQuest = questName;
                b.nextTalkingPoint = 0;
                this.buttons.push(b);
                buttonY += smallPadding + buttonHeight;
            }
            this._addExitButton(portraitX, buttonY);
        }
        this.selectedButton = 0;
        this.selectedTalker = characterName;
    }

    _selectButton(n) {
        if (this.ignoreClicks)
            return;
        if (this.selectedTalker == null) {
            let t = this.characters[n];
            if (t)
                this._showTalkerUI(t);
            else {
                ui.blockingUI = null;
                ui.nearHouseUI.hidden = true;
            }
        } else {
            let t = this.selectedTalker;
            let b = this.buttons[n + 1];
            if (typeof b.nextTalkingPoint == "number") {
                ui.dialogUI.addMessage(b.answerText, playerSpeaker);
                player.dialogState[t].currentQuest = b.nextQuest;
                player.dialogState[t].currentTalkingPoint = b.nextTalkingPoint;
                this._showTalkerUI(t);
            } else {
                this._switchToTalkersOverview();
            }
        }
        this.ignoreClicks = true;
        setTimeout(() => {
            this.ignoreClicks = false;
        }, 500);
    }

    draw() {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, 768, 768);
        for (let b of this.buttons)
            b.draw();
        if (this.selectedButton > 0) {
            let selected = this.buttons[this.selectedButton];
            drawButtonSelection(ctx, selected);
        }
    }

    onMouseMove(x, y) {
        for (let n = 1; n < this.buttons.length; n++) {
            if (this.buttons[n].isInside(x, y)) {
                this.selectedButton = n;
            }
        }
    }

    onClick(x, y) {
        for (let n = 1; n < this.buttons.length; n++) {
            if (this.buttons[n].isInside(x, y))
                this._selectButton(n - 1);
        }
        return true;
    }

    onKey(key) {
        if (key == "ArrowUp")
            this.selectedButton = Math.max(1, this.selectedButton - 1);
        if (key == "ArrowDown")
            this.selectedButton = Math.min(this.buttons.length - 1, this.selectedButton + 1);
        if (key == "Enter")
            this._selectButton(this.selectedButton - 1);
        if (key == "Escape") {
            ui.blockingUI = null;
        }
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
        this.inventoryImg = images.prepare("UI/inventory");

        this.dialogUI = new DialogUI(
            ctx, dialogUIleftOffset, 0, uiWidth, dialogUIheight, dialogUIpadding
        );
        this.stateImages = [
            images.prepare("UI/icons1"),
            images.prepare("UI/icons2"),
            images.prepare("UI/icons3"),
        ];
        this.spellImages = {
            none: images.prepare("Spells/none"),
            stone: images.prepare("Spells/stone"),
            fire: images.prepare("Spells/fire"),
            water: images.prepare("Spells/water"),
            lightning: images.prepare("Spells/lightning"),
            healing: images.prepare("Spells/healing"),
            meteor_shower: images.prepare("Spells/meteor_shower"),
            earth_ear: images.prepare("Spells/earth_ear"),
            selection: images.prepare("Spells/selected")
        };

        this.goals = new GoalsUI(ctx);

        this.manaBar = new ManaBar(ctx, uiWidth - 2 * barPadding, "rgb(0, 38, 255)", "rgb(0, 148, 255)")
        this.healthBar = new ManaBar(ctx, uiWidth - 2 * barPadding, "rgb(255, 0, 40)", "rgb(255, 150, 190)")

        this.nearHouseUI = new NearHouseUI(ctx);
        this.blockingUI = null;
    }

    showGoals() {
        setTimeout(() => {
            this.goals.hidden = false
        }, 500);
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

    _drawMagicItem(slotX, slotY, img) {
        images.draw(ctx, img, this._inventoryGridX() + slotX * 64, 90 + slotY * 64);
    }

    _drawMagic() {
        const maxSlotX = 3, maxSlotY = 4;
        const x = this._inventoryGridX();
        const y = 90;
        
        for (let slotX = 0; slotX < maxSlotX; slotX++) {
            for (let slotY = 0; slotY < maxSlotY; slotY++) {
                let img = this.spellImages.none;
                let idx = slotY * maxSlotX + slotX
                if (player.stats.spells.length > idx)
                    img = this.spellImages[player.stats.spells[idx]]
                this._drawMagicItem(slotX, slotY, img);
            }
        }

        if (player.selectedSpell == 0 || player.selectedSpell > 0) {
            let slotY = Math.floor(player.selectedSpell / maxSlotX);
            let slotX = player.selectedSpell - slotY * maxSlotX;
            this._drawMagicItem(slotX, slotY, this.spellImages.selection);    
        }

        let slotX = Math.floor((this.mouseSelfX - x)/64);
        let slotY = Math.floor((this.mouseSelfY - y)/64);
        if (slotX >= 0 && slotY >= 0) {
            let idx = slotY * maxSlotX + slotX;
            let tooltip, tooltipEm;
            if (idx >= 0 && player.stats.spells.length > idx) {
                let spell = player.stats.spells[idx]
                tooltip = rpg.spells[spell].tooltip;
                tooltipEm = rpg.spells[spell].cost + " мана";
            } else if (slotX >= 0 && slotX < maxSlotX && slotY >= 0 && slotY < maxSlotY)
                tooltip = "Не выученное заклинание";
            if (tooltip)
                this._drawInventoryTooltip(tooltip, tooltipEm, this.mouseSelfX, this.mouseSelfY);
        }
    }

    _onMagicClick() {
        const maxSlotX = 3, maxSlotY = 4;
        const x = this._inventoryGridX();
        const y = 90;
        let slotX = Math.floor((this.mouseSelfX - x)/64);
        let slotY = Math.floor((this.mouseSelfY - y)/64);
        if (slotX >= 0 && slotY >= 0) {
            let idx = slotY * maxSlotX + slotX
            if (idx >= 0 && idx < player.stats.spells.length)
                player.selectedSpell = idx
        }
    }

    _drawInventoryItem(x, y, img) {
        if (img)
            images.draw(ctx, img, dialogUIleftOffset + x, 45 + y);
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

    _inventoryGridX() {
        const width = canvas.width - dialogUIleftOffset;
        return dialogUIleftOffset + Math.floor((width - 193) / 2);
    }

    _getInventoryAreaUnderMouse() {
        const x = this.mouseSelfX - dialogUIleftOffset, y = this.mouseSelfY - 45;
        //console.log("in inventory", x, y)
        if (x >= 15 && y >= 110 && x <= 15+64 && y <= 110+64)
            return -1;
        if (x >= 175 && y >= 110 && x <= 175+64 && y <= 110+64)
            return -2;
        if (x >= 30 && y >= 244) {
            const invSlotX = Math.floor((x - 30)/64);
            const invSlotY = Math.floor((y - 244)/64);
            if (invSlotX < 3 && invSlotY < 6)
                return invSlotX + 3 * invSlotY;
        }
        return -100;
    }

    _drawInventory() {
        images.draw(ctx, this.inventoryImg, dialogUIleftOffset, 45);

        const areaUnderMouse = this._getInventoryAreaUnderMouse();
        let tooltip, tooltipEm;

        if (player.sword) {
            let rpgSword = rpg[player.sword];
            this._drawInventoryItem(15, 110, rpgSword.inventoryImg);
            if (areaUnderMouse == -1) {
                tooltip = rpgSword.name;
                if (rpgSword.quality)
                    tooltipEm = "Атака +" + rpgSword.quality;
            }
        }
        if (player.shield) {
            let rpgShield = rpg[player.shield];
            this._drawInventoryItem(175, 110, rpgShield.inventoryImg);
            if (areaUnderMouse == -2) {
                tooltip = rpgShield.name;
                tooltipEm = "Защита +" + rpgShield.quality;
            }
        }
        for (let n = 0; n < player.inventory.length; n++) {
            let item = rpg[player.inventory[n]];
            let invSlotX = n % 3, invSlotY = Math.floor(n/3);
            if (invSlotY >= 6)
                break;
            this._drawInventoryItem(30 + 64 * invSlotX, 244 + 64 * invSlotY, item.inventoryImg);
            if (areaUnderMouse == n) {
                tooltip = item.name;
                tooltipEm = item.description;
            }
        }

        if (tooltip)
            this._drawInventoryTooltip(tooltip, tooltipEm, this.mouseSelfX, this.mouseSelfY);
    }

    _onInventoryClick() {
        const areaUnderMouse = this._getInventoryAreaUnderMouse();
        let itemToUse = null;
        if (areaUnderMouse == -1 && player.sword)
            itemToUse = player.sword;
        if (areaUnderMouse == -2 && player.shield)
            itemToUse = player.shield;
        if (areaUnderMouse >= 0 && areaUnderMouse < player.inventory.length)
            itemToUse = player.inventory[areaUnderMouse];        
        if (!itemToUse)
            return;
        let success = world.script.onItemUse(itemToUse);
        const type = rpg[itemToUse].type;
        if (!success && (type == "sword" || type == "shield") && player[type] != itemToUse)
            success = player.equipItem(itemToUse);
        if (!success && itemToUse == "lookingGlass")
            success = useLookingGlass();
        if (!success && rpg[itemToUse].use_message)
            this.dialogUI.addMessage(rpg[itemToUse].use_message, playerSpeaker, player, true);
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
    
    showStateHint(state) {
        world.animations.addUIanimation(new UIstateHint(state));
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
                this._drawStats(this._inventoryGridX() + statsPadding, 400);
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
        images.draw(ctx, stateImg, dialogUIleftOffset, dialogUIheight);
        this._line(ctx, dialogUIleftOffset, 0, dialogUIleftOffset, canvas.height);

        if (world.script.noControl) {
            images.draw(ctx, "UI/cinematic", (768-90)/2, 0);
        } else {
            this.goals.draw();
            if (this.blockingUI) {
                this.blockingUI.draw();
            } else {
                this.nearHouseUI.draw();
            }
        }
    }

    onClick(x, y) {
        if (this.goals.onClick(x, y))
            return true;
        if (this.blockingUI) {
            this.blockingUI.onClick(x, y);
            return true;
        }
        if (this.nearHouseUI.onClick(x, y))
            return true;
        this.onMouseMove(x, y);
        if (this.mouseSelfY > dialogUIheight && this.mouseSelfX > dialogUIleftOffset) {
            let state = Math.floor((this.mouseSelfX - dialogUIleftOffset) * 3 / (canvas.width - dialogUIleftOffset));
            if (state >= 0 && state <= 2)
                this.state = state;
        } else if (this.state == 1) {
            this._onInventoryClick();
        } else if (this.state == 0) {
            this._onMagicClick();
        }
        return this.mouseSelfX > dialogUIleftOffset;
    }

    onMouseMove(x, y) {
        this.mouseSelfX = x;
        this.mouseSelfY = y;
        if (this.blockingUI) {
            this.blockingUI.onMouseMove(x, y);
            return true;
        }
        if (this.nearHouseUI.onMouseMove(x, y))
            return true;
    }

    onKey(key) {
        this.tileUnderCursor.hideTooltip();
        this.goals.hidden = true;
        if (world.script.noControl)
            return;
        if (this.blockingUI) {
            this.blockingUI.onKey(key);
            return true;
        }
        if (this.nearHouseUI.onKey(key))
            return;
        if (key == "ArrowLeft")
            player.tryMove(-1, 0);
        if (key == "ArrowUp")
            player.tryMove(0, -1);
        if (key == "ArrowRight")
            player.tryMove(1, 0);
        if (key == "ArrowDown")
            player.tryMove(0, 1);
        if (key == "`")
            drawAI = !drawAI;
        if (key == "h")
            world.animations.add(new Rain(40), {x:0, y:0});
    }
}

class UIstateHint {
    constructor(state) {
        this.state = state;
    }

    draw(ctx, _, time) {
        if (time > 6.5 || this.state == ui.state)
            return true;
        const subSecond = time - Math.floor(time);
        if (subSecond > 0.5)
            return false;
        ctx.fillStyle = "rgba(255, 255, 240, 0.5)";
        ctx.fillRect(dialogUIleftOffset + 85 * this.state, dialogUIheight, 85, 80);
        return false;
    }
};
