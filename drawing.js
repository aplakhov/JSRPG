"use strict"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let coinImage = new Image(); coinImage.src = "coin.png";
let manaImage = new Image(); manaImage.src = "mana.png";

function hasBorder(world, tile, nearX, nearY) {
    if (tile != 0)
        return false;
    let row = world.terrain[nearX];
    if (!row)
        return false;
    let nearTile = row[nearY];
    if (nearTile == 1)
        return true;
}

function drawWorld(ctx, offset, world) {
    const fillStyles = [["rgb(93, 161, 48)", "rgb(93, 166, 48)"], ["rgb(0, 200, 200)","rgb(0, 195, 205)"]];
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
            let x = offset.x+dx;
            let y = offset.y+dy;
            let tile = world.terrain[x][y];
            let styles = fillStyles[tile];
            let variation = (x + y);
            ctx.fillStyle = styles[variation%styles.length];
            ctx.fillRect(dx*tileSize, dy*tileSize, tileSize, tileSize);
        }
    }
    const borderStyle = "rgb(87,54,36)";
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
            let x = offset.x+dx;
            let y = offset.y+dy;
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
    world.objects.forEach((obj, index, array) => drawObj(ctx, offset, obj))
};

function drawObj(ctx, offset, obj) {
    let img = obj.img()
    let x = obj.x
    let y = obj.y
    if (!img.complete)
        return;
    if (x < offset.x || x >= offset.x + viewInTiles || y < offset.y || y >= offset.y + viewInTiles)
        return;
    ctx.drawImage(img, (x-offset.x)*tileSize, (y-offset.y)*tileSize);
}

function drawPlayer(ctx, offset, player) {
    let x = (player.x - offset.x);
    let y = (player.y - offset.y);
    ctx.fillStyle = "rgb(80, 80, 80)";
    ctx.fillRect(x*tileSize + 8, y*tileSize + 8, 16, 16);
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
            let offsetInPixels = { 
                x: (anim.baseTile.x - offsetInTiles.x) * tileSize + halfTileSize, 
                y: (anim.baseTile.y - offsetInTiles.y) * tileSize + halfTileSize
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

class FadeToBlack {
    constructor(duration, text) {
        this.duration = duration;
        this.text = text;
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
        let measurement = ctx.measureText(this.text);
        let x = tileSize * halfViewInTiles - measurement.width/2;
        let y = tileSize * halfViewInTiles - 12;
        ctx.fillText(this.text, x, y);

        return false;
    }
};

setInterval( () => {
    const offset = canvasOffsetInTiles();
    drawWorld(ctx, offset, world);
    drawPlayer(ctx, offset, player);
    animations.draw(ctx, offset);
    redrawInventory(charCtx);
  },
  20
);
