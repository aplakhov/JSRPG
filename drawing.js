"use strict"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let coinImage = new Image(); coinImage.src = "coin.png";
let manaImage = new Image(); manaImage.src = "mana.png";

function drawWorld(ctx, offset, world) {
    const fillStyles = [["rgb(93, 161, 48)", "rgb(93, 166, 48)"], ["rgb(0, 200, 200)","rgb(0, 195, 205)"]];
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
        let tile = world.terrain[offset.x+dx][offset.y+dy];
        ctx.fillStyle = fillStyles[tile][(offset.x+dx+offset.y+dy)%2];
        ctx.fillRect(dx*tileSize, dy*tileSize, tileSize, tileSize)
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
        console.log("Here, time=" + time + " x=" + x + " y=" + y);
        ctx.fillRect(x - 2, y - 2, 4, 4);
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
