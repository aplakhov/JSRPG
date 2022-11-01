"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const charCanvas = document.getElementById("charCanvas");
const charCtx = charCanvas.getContext("2d");

const tileSize = 32;
const viewInTiles = 24;
const halfViewInTiles = 12;

let player = new Player();
let world = new World("intro_map");

setInterval( () => {
  world.nextTurn(false);
  player.nextTurn();
},
1000
);

function clamp(x, minx, maxx) {
  return x > minx? (x < maxx? x : maxx) : minx;
};

function tileAt(x, y) {
  let r2 = (x - 50) * (x - 50) + (y - 50) * (y - 50);
  return r2 < 2500? 1: 0;
};

function canvasOffsetInTiles() {
  const minx = clamp(player.x - halfViewInTiles, 0, world.width - viewInTiles);
  const miny = clamp(player.y - halfViewInTiles, 0, world.height - viewInTiles);
  return { x : minx, y : miny };
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
    if (now < this.changed + 0.5 || now > this.changed + 3)
      return false;
    return true;
  }
}
let tileUnderCursor = new TileUnderCursor();

function updateTileUnderCursor(mouseEvent) {
  const rect = mouseEvent.target.getBoundingClientRect();
  const offset = canvasOffsetInTiles();
  const tileX = offset.x + ((mouseEvent.clientX - rect.left) / tileSize) >> 0;
  const tileY = offset.y + ((mouseEvent.clientY - rect.top) / tileSize) >> 0;
  tileUnderCursor.set(tileX, tileY);
};

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}

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

    addMessageImpl(text, color, bgColor, font, portrait) {
      if (text == "")
        return;
      for (let n = this.messages.length - 1; n >= 0; n--) {
        let oldMessage = this.messages[n];
        if (text == oldMessage.text && portrait && portrait.src == oldMessage.portrait.src)
          return; 
      }
      let words = text.split(" ");
      let countWords = words.length;
      let lines = [];
      let line = "";
      this.ctx.font = font;
      for (let n = 0; n < countWords; n++) {
        let testLine = line + words[n] + " ";
        let testWidth = this.ctx.measureText(testLine).width;
        if (testWidth > this.maxTextWidth) {
            lines.push(line)
            line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      this.messages.push({
        text: text,
        lines: lines,
        color: color,
        bgColor: bgColor,
        font: font,
        lineHeight: this.lineHeight,
        portrait: portrait
      });
      this.lastMessageAdded = Date.now() / 1000. 
    }

    forceRedraw() {
      this.redraw = true;
    }

    addMessage(text, speaker) {
      this.addMessageImpl(text, speaker.color, speaker.bgColor, speaker.font, speaker.portrait);
    }

    draw() {
      let timeFromLastMessage = Date.now() / 1000. - this.lastMessageAdded;
      if (timeFromLastMessage > 1 && !this.redraw)
          return;
      this.redraw = false;
 
      this.ctx.fillStyle = 'rgb(240, 214, 175)';
      this.ctx.fillRect(this.left, this.top, this.width, this.height);
    
      let oldPortrait = null;
      let oldPortraitTop = 100000;
      let bottomOfMessage = this.top + this.height - this.distBetweenMessages;

      for (let n = this.messages.length - 1; n >= 0; n--) {
        let msg = this.messages[n];
        let textBoxHeight = msg.lineHeight * msg.lines.length + msg.lineHeight/2;
        // last message animation
        if (n == this.messages.length - 1) {
          if (timeFromLastMessage < 0.3)
            bottomOfMessage += (0.3 - timeFromLastMessage) * 3.33 * textBoxHeight;
        }

        this.ctx.fillStyle = msg.bgColor;

        if (msg.portrait && msg.portrait != oldPortrait && msg.portrait.complete) {
          if (bottomOfMessage > oldPortraitTop - this.padding)
            bottomOfMessage = oldPortraitTop - this.padding;
          this.ctx.drawImage(msg.portrait, this.left + this.padding, bottomOfMessage - this.portraitSize);
          oldPortrait = msg.portrait;
          oldPortraitTop = bottomOfMessage - this.portraitSize;
        }

        let textBoxLeft = this.left + this.portraitSize + 2 * this.padding;
        let textBoxTop = bottomOfMessage - textBoxHeight;
        roundedRect(this.ctx, textBoxLeft, textBoxTop,
          this.maxTextWidth + 2 * this.padding, textBoxHeight, 6);
        this.ctx.fillStyle = msg.color;
        this.ctx.font = msg.font;
        for (let l = 0; l < msg.lines.length; l++) {
          let line = msg.lines[l];
          this.ctx.fillText(line, textBoxLeft + this.padding, textBoxTop + (l + 1) * msg.lineHeight);
        }

        bottomOfMessage -= textBoxHeight;        
        bottomOfMessage -= this.distBetweenMessages;
        if (bottomOfMessage <= 0)
          return;
      }
    }
};

const dialogUIleftOffset = 0;
const dialogUIpadding = 5;
let dialogUI = new DialogUI(
  charCtx, dialogUIleftOffset, 0, 
  charCanvas.width - dialogUIleftOffset, charCanvas.height,
  dialogUIpadding
);

let portrait1 = new Image(); portrait1.src = "portrait1.png";
let portrait2 = new Image(); portrait2.src = "portrait2.png";
const speaker1 = {
  color: "rgb(10, 10, 10)",
  bgColor: "rgb(255, 255, 255)",
  font: '18px sans-serif',
  portrait: portrait1
};
const speaker2 = {
  color: "rgb(10, 10, 10)",
  bgColor: "rgb(178, 164, 165)",
  font: '18px sans-serif',
  portrait: portrait2
};
const systemMessageSpeaker = {
  color: "rgb(0, 0, 0)",
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
let barPadding = 5;
let manaBar = new ManaBar(charCtx, charCtx.canvas.width - 2 * barPadding, "rgb(0, 38, 255)", "rgb(0, 148, 255)")
let healthBar = new ManaBar(charCtx, charCtx.canvas.width - 2 * barPadding, "rgb(255, 0, 40)", "rgb(255, 150, 190)")

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
  }

  addGoal(line) {
    this.ctx.font = this.font;
    let width = ctx.measureText(line).width;
    if (this.maxGoalWidth < width)
      this.maxGoalWidth = width;
    this.goals.push(line);
  }

  draw() {
    if (!this.hidden) {
      const backColor = "rgb(240, 214, 175)";
      const foreColor = "rgb(140, 104, 20)";
      let x = 100, y = 100;
      let w = ctx.canvas.width - 2 * x;
      let h = 64 + 72 + 24 * this.goals.length;
      this.ctx.fillStyle = backColor;
      this.ctx.fillRect(x, y, w, h);
      this.ctx.strokeStyle = foreColor;
      this.ctx.strokeRect(x, y, w, h);
      this.ctx.fillStyle = foreColor;
      this.ctx.font = this.headerFont;
      this.ctx.fillText(this.header, x + (w - this.headerWidth) / 2, y + 64);
      this.ctx.font = this.font;
      for (let n = 0; n < this.goals.length; ++n) {
        let goal = this.goals[n];
        this.ctx.fillText(goal, x + (w - this.maxGoalWidth) / 2, y + 64 + 48 + 24*n);
      }
    }
    if (this.button.complete) {
      this.buttonX = (2 * tileSize - this.button.width) / 2;
      this.buttonY = (ctx.canvas.height - 2 * tileSize) + (2 * tileSize - this.button.height)/2;
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
let goals = new Goals(ctx);
goals.addGoal("1. Перебраться через речку под названием Мокрая")
goals.addGoal("2. Дойти до горы под названием Высокая")
goals.addGoal("3. Найти вход в пещеру под названием Тёмная")
goals.addGoal("4. Добыть сокровища подземных королей")
goals.addGoal("5. Вернуться в город и кутить")
setTimeout(() => {goals.hidden = false}, 500)

function drawUI() {
  dialogUI.draw();
  let showMana = player.stats.mana > 0;
  let showHP = player.hp < player.stats.hp;
  const dialogUItopOffset = 40;
  if (showMana || showHP) {
    charCtx.fillStyle = 'rgb(240, 214, 175)';
    if (showHP)
      charCtx.fillRect(0, 0, charCtx.canvas.width, dialogUItopOffset);
    else
      charCtx.fillRect(0, 0, charCtx.canvas.width, dialogUItopOffset / 2);
  }
  if (showMana) {
    charCtx.strokeStyle = 'rgb(140, 104, 20)';
    charCtx.strokeRect(0, dialogUItopOffset / 2, charCtx.canvas.width, 0);
    manaBar.draw(player.mana, player.stats.mana, barPadding, dialogUItopOffset / 4);
  }
  if (showHP) {
    charCtx.strokeStyle = 'rgb(140, 104, 20)';
    charCtx.strokeRect(0, dialogUItopOffset, charCtx.canvas.width, 0);
    healthBar.draw(player.hp, player.stats.hp, barPadding, dialogUItopOffset * 3 / 4);
  }
  goals.draw();
}

canvas.onmousemove = updateTileUnderCursor;

canvas.onclick = function clickEvent(e) {
  updateTileUnderCursor(e);
  tileUnderCursor.hideTooltip();
  if (goals.onclick(e))
    return;
  player.tryCast(tileUnderCursor.x, tileUnderCursor.y)
}

addEventListener("keyup", function(event) {
  tileUnderCursor.hideTooltip();
  goals.hidden = true;
  if (event.key == "ArrowLeft")
    player.tryMove(-1,0);
  if (event.key == "ArrowUp")
    player.tryMove(0,-1);
  if (event.key == "ArrowRight")
    player.tryMove(1,0);
  if (event.key == "ArrowDown")
    player.tryMove(0,1);
  if (event.key == "f")
    animations.add(new FadeToBlack(4, "Тем временем..."), player);
  if (event.key == "s") {
    let person = player.x % 3;
    if (person == 0)
      dialogUI.addMessage("О, привет", speaker1);
    else if (person == 1)
      dialogUI.addMessage("И тебе привет, как там погодка в городе", speaker2);
  }
});
