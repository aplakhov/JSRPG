"use strict"

function hasBorder(world, tile, nearX, nearY) {
    if (tile == TERRAIN_WATER)
        return false;
    let row = world.terrain[nearX];
    if (!row)
        return false;
    let nearTile = row[nearY];
    if (nearTile == TERRAIN_WATER)
        return true;
}

let stableRandom = [];
for (let dx = 0; dx < viewInTiles; dx++) {
    for (let dy = 0; dy < viewInTiles; dy++) {
        stableRandom.push(Math.floor(Math.random() * 10000));
    }
}

function drawWorld(ctx, offset, world) {
    const fillStyles = [
        ["rgb(93, 161, 48)", "rgb(91, 164, 49)", "rgb(93, 166, 48)", "rgb(93, 163, 48)"],
        ["rgb(0, 200, 200)", "rgb(0, 195, 205)", "rgb(0, 198, 205)", "rgb(0, 202, 198)"],
        ["rgb(252, 221, 118)", "rgb(255, 224, 120)"],
        ["rgb(66, 83, 43)", "rgb(69, 87, 45)", "rgb(62, 77, 40)"],
        ["rgb(81, 81, 81)", "rgb(127, 127, 127)", "rgb(95, 95, 95)"],
        ["rgb(62, 42, 25)", "rgb(50, 30, 20)", "rgb(75, 45, 30)"],
    ];
    // draw terrain
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
            let x = offset.x+dx;
            let y = offset.y+dy;
            if (world.vision.isVisible(x, y)) {
                let tile = world.terrain[x][y];
                let styles = fillStyles[tile];
                let variation = stableRandom[(x*17 + y*31)%stableRandom.length];
                ctx.fillStyle = styles[variation%styles.length];
                ctx.fillRect(dx*tileSize, dy*tileSize, tileSize, tileSize);
            }
        }
    }
    const borderStyle = "rgb(87,54,36)";
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
            let x = offset.x+dx;
            let y = offset.y+dy;
            if (!world.vision.isVisible(x, y))
                continue;
            let tile = world.terrain[x][y];
            let borderRight = hasBorder(world, tile, x + 1, y);
            let borderDown = hasBorder(world, tile, x, y + 1);
            let borderLeft = hasBorder(world, tile, x - 1, y);
            let borderUp = hasBorder(world, tile, x, y - 1);
            if (borderDown || borderLeft || borderRight || borderUp) {
                ctx.fillStyle = borderStyle;
                if (borderDown)
                    ctx.fillRect(dx*tileSize, dy*tileSize + tileSize-3, 33, 6);
                if (borderUp)
                    ctx.fillRect(dx*tileSize, dy*tileSize, 33, 1);
                if (borderLeft)
                    ctx.fillRect(dx*tileSize, dy*tileSize, 1, 32);
                if (borderRight)
                    ctx.fillRect(dx*tileSize + tileSize - 1, dy*tileSize, 2, 32);
            }
        }
    }
    // draw objects
    world.objects.forEach((obj) => {
        if (!obj.zLayer)
            drawObj(ctx, offset, obj)
    });
    player.draw(ctx, (player.x-offset.x)*tileSize, (player.y-offset.y)*tileSize);
    world.objects.forEach((obj) => {
        if (obj.zLayer == 1)
            drawObj(ctx, offset, obj)
    });
    world.objects.forEach((obj) => {
        if (obj.zLayer == 2)
            drawObj(ctx, offset, obj)
    });
    // draw darkness
    ctx.fillStyle = 'black';
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
            let x = offset.x+dx;
            let y = offset.y+dy;
            if (!world.vision.isVisible(x, y))
                ctx.fillRect(dx*tileSize, dy*tileSize, tileSize, tileSize);
        }
    }    
    //draw AI
    if (drawAI) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
        for (let dx = 0; dx < viewInTiles; dx++) {
            for (let dy = 0; dy < viewInTiles; dy++) {
                let x = offset.x+dx;
                let y = offset.y+dy;
                if (!world.pathfinding.isPassable(x, y, null))
                    ctx.fillRect(dx*tileSize, dy*tileSize, tileSize, tileSize);
            }
        }    
    }
};

function drawTooltip(ctx, offset, tileUnderCursor) {
    if (!world.vision.isVisible(tileUnderCursor.x, tileUnderCursor.y))
        return;
    let left = (tileUnderCursor.x-offset.x+0.5)*tileSize;
    let top = (tileUnderCursor.y-offset.y+0.5)*tileSize;
    let text = world.hint(tileUnderCursor.x, tileUnderCursor.y);

    const maxWidth = 320;
    const lineHeight = 24;
    const padding = 5;
    let u = new Utterance(ctx, text, maxWidth, systemMessageSpeaker.color,
        systemMessageSpeaker.bgColor, systemMessageSpeaker.font, lineHeight, padding);
    u.draw(ctx, left - u.textBoxWidth/2, top - tileSize, 0, true);
}

function isVisible(x, y, offset) {
    if (x < offset.x || x >= offset.x + viewInTiles || y < offset.y || y >= offset.y + viewInTiles)
        return false;
    if (!world.vision.isVisible(x, y))
        return false;
    return true;
}

function drawObj(ctx, offset, obj) {
    let x = obj.x
    let y = obj.y
    let visible = 'isVisible' in obj? obj.isVisible(offset) : isVisible(x, y, offset);
    if (visible)
        obj.draw(ctx, (x-offset.x)*tileSize, (y-offset.y)*tileSize);
}

// Animations. Every animation is an object with a function draw(ctx, offsetInPixels, timeFromStart) => bool
// if this function returns false, then an animation is over and will be deleted from this list
// Every animation has a "startTime" and "baseTile" (which game tile is its zero point). 
// An animation itself doesn't (and probably shouldn't) use either; only outer drawing loop does.
// But, for convenience, startTime and baseInTiles are stored inplace.
class Animations {
    constructor () {
        this.animations = []
        this.globalTimer = 0
    }

    add(animation, baseTile) {
        animation.startTime = this.globalTimer;
        animation.baseTile = baseTile;
        this.animations.push(animation)
    }

    draw(ctx, offsetInTiles) {
        this.globalTimer = Date.now() / 1000.
        if (animations.length == 0)
            return;
        let halfTileSize = tileSize / 2;
        let newAnimations = [];
        this.animations.forEach((anim) => {
            let x = ('pixelX' in anim.baseTile)? anim.baseTile.pixelX.get() : anim.baseTile.x * tileSize;
            let y = ('pixelY' in anim.baseTile)? anim.baseTile.pixelY.get() : anim.baseTile.y * tileSize;
            let offsetInPixels = { 
                x: x - offsetInTiles.x * tileSize + halfTileSize, 
                y: y - offsetInTiles.y * tileSize + halfTileSize
            }
            let finished = anim.draw(ctx, offsetInPixels, this.globalTimer - anim.startTime);
            if (!finished)
                newAnimations.push(anim)
        });
        this.animations = newAnimations;    
    }
};
let animations = new Animations();

class Bullet {
    constructor(direction, duration) {
        this.direction = direction;
        this.duration = duration;
    }

    draw(ctx, offsetInPixels, time) {
        let rate = time / this.duration 
        if (rate > 1)
            return true;
        ctx.fillStyle = "rgb(0, 0, 0)";
        let x = offsetInPixels.x + this.direction.x * rate;
        let y = offsetInPixels.y + this.direction.y * rate;
        ctx.fillRect(x - 2, y - 2, 4, 4);
        return false;
    }
};

class SystemMessage {
    constructor(duration, text) {
        this.duration = duration;
        this.text = text;
    }

    draw(ctx, offsetInPixels, time) {
        if (time > this.duration)
            return true;
        ctx.font = '24px sans-serif';
        let measurement = ctx.measureText(this.text);
        let x = tileSize * halfViewInTiles - measurement.width/2;
        let y = 60;
        ctx.fillStyle = "black";
        ctx.fillText(this.text, x-1, y);
        ctx.fillText(this.text, x+1, y);
        ctx.fillText(this.text, x, y-1);
        ctx.fillText(this.text, x, y+1);
        ctx.fillStyle = "white";
        ctx.fillText(this.text, x, y);
        return false;
    }
}

class FadeToBlack {
    constructor(duration, text1, text2) {
        this.duration = duration;
        this.text1 = text1;
        this.text2 = text2;
    }

    _draw(ctx, y, text) {
        let measurement = ctx.measureText(text);
        let x = tileSize * halfViewInTiles - measurement.width/2;
        ctx.fillText(text, x, y);
    }

    draw(ctx, offsetInPixels, time) {
        if (time > this.duration)
            return true;
        let rate = time;
        if (time > this.duration - 1)
            rate = this.duration - time;
        else if (time > 1)
            rate = 1;
        ctx.fillStyle = `rgba(0, 0, 0, ${rate})`;
        ctx.fillRect(0, 0, tileSize * viewInTiles, tileSize * viewInTiles);

        ctx.fillStyle = `rgba(200, 200, 180, ${rate})`;
        ctx.font = '24px sans-serif';
        let y = tileSize * halfViewInTiles - 12;
        this._draw(ctx, y, this.text1);
        this._draw(ctx, y + 24, this.text2);

        return false;
    }
};

class Utterance {
    constructor(ctx, text, maxTextWidth, color, bgColor, font, lineHeight, padding) {
      this.text = text;
      this.color = color;
      this.bgColor = bgColor;
      this.font = font;
      this.lineHeight = lineHeight;
      this.padding = padding;
  
      let words = text.split(" ");
      this.lines = [];
      let line = "";
      ctx.font = font;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxTextWidth) {
          this.lines.push(line)
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      this.lines.push(line);
  
      this.textBoxWidth = 0;
      this.textBoxHeight = this.lineHeight * this.lines.length + this.lineHeight/2;
      for (let n = 0; n < this.lines.length; n++) {
        let w = ctx.measureText(this.lines[n]).width;
        if (this.textBoxWidth < w)
          this.textBoxWidth = w;
      }
    }
  
    _roundedRect(ctx, x, y, width, height, radius, doBorder) {
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.arcTo(x, y + height, x + radius, y + height, radius);
      ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
      ctx.arcTo(x + width, y, x + width - radius, y, radius);
      ctx.arcTo(x, y, x, y + radius, radius);
      ctx.fill();
      if (doBorder)
        ctx.stroke();
    }
  
    draw(ctx, textBoxLeft, textBoxTop, fixedWidth, doBorder) {
      ctx.fillStyle = this.bgColor;
      ctx.strokeStyle = this.color;
      let width = fixedWidth;
      if (width < this.textBoxWidth)
        width = this.textBoxWidth;
      this._roundedRect(ctx, textBoxLeft, textBoxTop,
        width + 2 * this.padding, this.textBoxHeight, 6, doBorder);
      ctx.fillStyle = this.color;
      ctx.font = this.font;
      for (let l = 0; l < this.lines.length; l++)
        ctx.fillText(this.lines[l], textBoxLeft + this.padding, textBoxTop + (l + 1) * this.lineHeight);
    }
}
  
class DialogMessages {
    constructor(ctx, text, speaker) {
        this.msgQueue = [];
        this.addMessage(ctx, text, speaker);
    }
    addMessage(ctx, text, speaker) {
        const maxWidth = 320;
        const lineHeight = 24;
        const padding = 5;
        let u = new Utterance(ctx, text, maxWidth, speaker.color, speaker.bgColor, speaker.font, lineHeight, padding);
        u.endTime = animations.globalTimer + (text.length + 80) / 40;
        this.msgQueue.push(u);
    }
    draw(ctx, offsetInPixels, time) {
        let y = offsetInPixels.y + 4;
        for (let n = this.msgQueue.length - 1; n >= 0; n--) {
            let msg = this.msgQueue[n];
            if (msg.endTime < animations.globalTimer)
                return n == this.msgQueue.length - 1;
            let left = offsetInPixels.x - msg.textBoxWidth/2;
            if (left < 0)
                left = 0;
            msg.draw(ctx, left, y - msg.textBoxHeight - 20, 0, true);
            y -= msg.textBoxHeight + msg.padding;
        }
        return false;
    }
}

setInterval( () => {
    const offset = canvasOffsetInTiles();
    drawWorld(ctx, offset, world);
    fire.step(canvasOffsetInTiles());
    fire.draw(ctx, offset);
    animations.draw(ctx, offset);
    if (tileUnderCursor.needShowTooltip())
        drawTooltip(ctx, offset, tileUnderCursor);
    drawUI();
  },
  20
);
