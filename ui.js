"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const viewInTiles = 24;
const halfViewInTiles = 12;

let player = new Player();
let world = new World("intro_map");

setInterval(() => {
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
  if (mouseEvent.clientX >= rect.left + dialogUIleftOffset)
    tileUnderCursor.hideTooltip();
  const tileX = offset.x + ((mouseEvent.clientX - rect.left) / tileSize) >> 0;
  const tileY = offset.y + ((mouseEvent.clientY - rect.top) / tileSize) >> 0;
  tileUnderCursor.set(tileX, tileY);
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

    forceRedraw() {
      this.redraw = true;
    }

    addMessage(text, speaker, baseTile, okToRepeat) {
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
        if (n == this.messages.length - 1) {
          if (timeFromLastMessage < 0.3)
            bottomOfMessage += (0.3 - timeFromLastMessage) * 3.33 * msg.textBoxHeight;
        }
        if (msg.portrait && msg.portrait != oldPortrait && msg.portrait.complete) {
          if (bottomOfMessage > oldPortraitTop - this.padding)
            bottomOfMessage = oldPortraitTop - this.padding;
          this.ctx.drawImage(msg.portrait, this.left + this.padding, bottomOfMessage - this.portraitSize);
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

let portrait1 = makeImage("portrait1");
let portrait2 = makeImage("portrait2");
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
      let w = dialogUIleftOffset - 2 * x;
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

const dialogUIleftOffset = 768;
const uiWidth = canvas.width - dialogUIleftOffset;
const dialogUIheight = canvas.height - 80;
const dialogUIpadding = 5;
const barPadding = 5;

class UI {
  constructor() {
    this.state = 2;

    this.dialogUI = new DialogUI(
      ctx, dialogUIleftOffset, 0, uiWidth, dialogUIheight, dialogUIpadding
    );
    this.stateImages = [
      makeImage("icons1"),
      makeImage("icons2"),
      makeImage("icons3"),
    ];

    this.goals = new Goals(ctx);
    // TODO: move to script
    this.goals.addGoal("1. Перебраться через речку под названием Мокрая")
    this.goals.addGoal("2. Дойти до горы под названием Высокая")
    this.goals.addGoal("3. Найти вход в пещеру под названием Тёмная")
    this.goals.addGoal("4. Добыть сокровища подземных королей")
    this.goals.addGoal("5. Вернуться в город и кутить")
    setTimeout(() => {this.goals.hidden = false}, 500)

    this.manaBar = new ManaBar(ctx, uiWidth - 2 * barPadding, "rgb(0, 38, 255)", "rgb(0, 148, 255)")
    this.healthBar = new ManaBar(ctx, uiWidth - 2 * barPadding, "rgb(255, 0, 40)", "rgb(255, 150, 190)")
  }
  
  draw() {
    if (this.state == 2) {
      this.dialogUI.draw();
    } else {
      const backColor = "rgb(240, 214, 175)";
      ctx.fillStyle = backColor;
      ctx.fillRect(dialogUIleftOffset, 0, uiWidth, canvas.height);
    }
      
    let showMana = player.stats.mana > 0;
    let showHP = player.hp < player.stats.hp;
    const dialogUItopOffset = 40;
    if (showMana || showHP) {
      ctx.fillStyle = 'rgb(240, 214, 175)';
      if (showHP)
        ctx.fillRect(dialogUIleftOffset, 0, uiWidth, dialogUItopOffset);
      else
        ctx.fillRect(dialogUIleftOffset, 0, uiWidth, dialogUItopOffset / 2);
    }
    if (showMana) {
      ctx.strokeStyle = 'rgb(140, 104, 20)';
      ctx.strokeRect(dialogUIleftOffset, dialogUItopOffset / 2, uiWidth, 0);
      this.manaBar.draw(player.mana, player.stats.mana, dialogUIleftOffset + barPadding, dialogUItopOffset / 4);
    }
    if (showHP) {
      ctx.strokeStyle = 'rgb(140, 104, 20)';
      ctx.strokeRect(dialogUIleftOffset, dialogUItopOffset, uiWidth, 0);
      this.healthBar.draw(player.hp, player.stats.hp, dialogUIleftOffset + barPadding, dialogUItopOffset * 3 / 4);
    }
    let stateImg = this.stateImages[this.state];
    if (stateImg.complete)
      ctx.drawImage(stateImg, dialogUIleftOffset, dialogUIheight);
    ctx.strokeStyle = 'rgb(140, 104, 20)';
    ctx.strokeRect(dialogUIleftOffset, 0, 0, canvas.height);
    this.goals.draw();
  }

  onclick(mouseEvent) {
    if (this.goals.onclick(mouseEvent))
      return true;
    const rect = mouseEvent.target.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;
    if (y > dialogUIheight && x > dialogUIleftOffset) {
      let state = Math.floor((x - dialogUIleftOffset) * 3 / (canvas.width - dialogUIleftOffset));
      if (state >= 0 && state <= 2) {
        this.state = state;
        this.dialogUI.forceRedraw();
      }
      return true;
    }   
    return false;    
  }
}
let ui = new UI();

canvas.onmousemove = updateTileUnderCursor;

canvas.onclick = function clickEvent(e) {
  updateTileUnderCursor(e);
  tileUnderCursor.hideTooltip();
  if (ui.onclick(e))
    return;
  player.tryCast(tileUnderCursor.x, tileUnderCursor.y, "stone")
}

addEventListener("keyup", function(event) {
  tileUnderCursor.hideTooltip();
  ui.goals.hidden = true;
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
  if (event.key == "`")
    drawAI = !drawAI;
});
