"use strict"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let manaImage = new Image(); manaImage.src = "mana1.png";
let bonesImage = new Image(); bonesImage.src = "bones.png";

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

function isVisible(x, y, visibilityR2) {
    let dist2 = (x-player.x)*(x-player.x) + (y-player.y)*(y-player.y);
    return dist2 <= visibilityR2;
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
    let visibilityR = world.getVisionRadius(player.x, player.y);
    let visibilityR2 = visibilityR * visibilityR;
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
            let x = offset.x+dx;
            let y = offset.y+dy;
            if (isVisible(x, y, visibilityR2)) {
                let tile = world.terrain[x][y];
                let styles = fillStyles[tile];
                let variation = stableRandom[(x*17 + y*31)%stableRandom.length];
                ctx.fillStyle = styles[variation%styles.length];
            } else {
                ctx.fillStyle = 'black';
            }
            ctx.fillRect(dx*tileSize, dy*tileSize, tileSize, tileSize);
        }
    }
    const borderStyle = "rgb(87,54,36)";
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
            let x = offset.x+dx;
            let y = offset.y+dy;
            if (!isVisible(x, y, visibilityR2))
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
    world.objects.forEach((obj) => {
        if (isVisible(obj.x, obj.y, visibilityR2))
            drawObj(ctx, offset, obj)
    });
};

function drawTooltip(ctx, offset, tileUnderCursor) {
    let visibilityR = world.getVisionRadius(player.x, player.y);
    if (!isVisible(tileUnderCursor.x, tileUnderCursor.y, visibilityR*visibilityR))
        return;
    let left = (tileUnderCursor.x-offset.x+0.5)*tileSize;
    let top = (tileUnderCursor.y-offset.y+0.5)*tileSize;
    let text = world.hint(tileUnderCursor.x, tileUnderCursor.y);
    let textWidth = ctx.measureText(text).width;
    let padding = 5;
    ctx.fillStyle = "white"
    ctx.fillRect(left, top - tileSize, textWidth + 2 * padding, 24);
    ctx.fillStyle = "black"
    ctx.font = "18px sans-serif"
    ctx.fillText(text, left + padding, top - 14);
}

function drawObj(ctx, offset, obj) {
    let x = obj.x
    let y = obj.y
    if (x < offset.x || x >= offset.x + viewInTiles || y < offset.y || y >= offset.y + viewInTiles)
        return;
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
        ctx.fillStyle = `white`;
        //ctx.fillRect(x - 5, y - 24, measurement.width + 10, 32);
        //ctx.fillStyle = `black`;
        ctx.fillText(this.text, x, y);
        return false;
    }
}

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
    drawObj(ctx, offset, player);
    animations.draw(ctx, offset);
    if (tileUnderCursor.needShowTooltip())
        drawTooltip(ctx, offset, tileUnderCursor);
    drawUI();
  },
  20
);
