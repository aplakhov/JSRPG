"use strict"

class Renderer {
    constructor() {
        this.setBiome(world.biome);

        this.stoneTiles = makeImage("stone_tile2");
        this.stoneGroundTile = makeImage("stone_wall_ground_tile");
        this.darknessVeil = makeImage("darkness_veil");

        this.stableRandom = []
        for (let dx = 0; dx < viewInTiles; dx++) {
            for (let dy = 0; dy < viewInTiles; dy++) {
                this.stableRandom.push(Math.floor(Math.random() * 12000));
            }
        }
    }   
    
    setBiome(biome) {
        this.sandTiles = makeImage(biome + "sand_tiles");
        this.grassTiles = makeImage(biome + "grass_tiles");
        this.darkGrassBorderTiles = makeImage(biome + "dark_grass_border");
        this.groundTiles = makeImage(biome + "ground_tiles");
        this.treeImages = makeImage(biome + "trees");
        this.rockTiles = makeImage(biome + "rock_tiles");
        this.rockGroundTiles = makeImage(biome + "rock_ground_tiles");
        this.pavementTiles = makeImage(biome + "pavement_tiles");
        this.animatedWater = makeImage(biome + "animated_water");
    }

    _drawTrees(ctx, pixelOffset, world) {
        let variationsNum = this.treeImages.width / 64;
        for (let tree of world.trees) {
            let variation = tree.variation % variationsNum;
            let x = tree.x * tileSize - 16 + tree.sx;
            let y = tree.y * tileSize - 16 + tree.sy;
            let dx = x - pixelOffset.x;
            if (dx < -64 || dx > viewInPixels)
                continue;
            let dy = y - pixelOffset.y;
            if (dy < -64 || dy > viewInPixels)
                continue;
            ctx.drawImage(this.treeImages, variation * 64, 0, 64, 64, dx, dy, 64, 64); 
        }
    }

    _drawTerrainLayer(ctx, pixelOffset, world, tile, tileImages) {
        const variationsNum = tileImages.width / 64;
        const stableRandomLen = this.stableRandom.length;
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (tile == world.terrain[x][y]) {
                    let variation = this.stableRandom[(x + y * viewInTiles) % stableRandomLen] % variationsNum;
                    ctx.drawImage(tileImages, variation*64, 0, 64, 64, x*tileSize - pixelOffset.x - 16, y*tileSize - pixelOffset.y - 16, 64, 64); 
                }
            }
        }
    }

    _drawTerrainBorder(ctx, pixelOffset, world, tile1, tile2, tileImages) {
        const variationsNum = tileImages.width / 64;
        const stableRandomLen = this.stableRandom.length;
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (world.terrain[x][y] != tile1)
                    continue;
                let hasBorder = (x > 0 && world.terrain[x-1][y] == tile2) ||
                    (y > 0 && world.terrain[x][y-1] == tile2) || 
                    (x + 1 < world.width && world.terrain[x+1][y] == tile2) || 
                    (y + 1 < world.height && world.terrain[x][y+1] == tile2);
                if (hasBorder) {
                    let variation = this.stableRandom[(x + y * viewInTiles) % stableRandomLen] % variationsNum;
                    ctx.drawImage(tileImages, variation*64, 0, 64, 64, x*tileSize - pixelOffset.x - 16, y*tileSize - pixelOffset.y - 16, 64, 64);
                } 
            }
        }
    }

    _drawTerrainLayer32(ctx, pixelOffset, world, tile, tileImages) {
        const variationsNum = tileImages.width / 64;
        const stableRandomLen = this.stableRandom.length;
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (tile == world.terrain[x][y]) {
                    let variation = this.stableRandom[(x + y * viewInTiles) % stableRandomLen] % variationsNum;
                    ctx.drawImage(tileImages, variation*32, 0, 32, 32, x*tileSize - pixelOffset.x, y*tileSize - pixelOffset.y, 32, 32); 
                }
            }
        }
    }

    _drawTerrain(ctx, pixelOffset, world) {
        let numWaterFrames = this.animatedWater.width/32
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (TERRAIN_WATER == world.terrain[x][y]) {
                    let animatedWaterFrame = Math.floor(animations.globalTimer*8) % numWaterFrames;
                    ctx.drawImage(this.animatedWater, animatedWaterFrame*32, 0, 32, 32, x*tileSize - pixelOffset.x, y*tileSize - pixelOffset.y, 32, 32); 
                }
            }
        }
        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_SAND, TERRAIN_WATER, this.groundTiles);
        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_GRASS, TERRAIN_WATER, this.groundTiles);
        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_STONE, TERRAIN_WATER, this.stoneGroundTile);

        this._drawTerrainLayer32(ctx, pixelOffset, world, TERRAIN_STONE, this.stoneTiles);
        this._drawTerrainLayer(ctx, pixelOffset, world, TERRAIN_SAND, this.sandTiles);
        this._drawTerrainLayer32(ctx, pixelOffset, world, TERRAIN_PAVEMENT, this.pavementTiles);

        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_GRASS, TERRAIN_PAVEMENT, this.darkGrassBorderTiles);
        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_GRASS, TERRAIN_SAND, this.darkGrassBorderTiles);        
        this._drawTerrainLayer(ctx, pixelOffset, world, TERRAIN_GRASS, this.grassTiles);

        this._drawTerrainLayer(ctx, pixelOffset, world, TERRAIN_STONE_WALL, this.rockGroundTiles);
        this._drawTerrainLayer(ctx, pixelOffset, world, TERRAIN_STONE_WALL, this.rockTiles);
    } 

    _drawObj(ctx, pixelOffset, obj) {
        if ('draw' in obj) {
            let x = obj.x
            let y = obj.y
            let visible = 'isVisible' in obj ? obj.isVisible(pixelOffset) : world.vision.isVisibleSafe(x, y);
            //TODO: check viewport for second case
            if (visible)
                obj.draw(ctx, x * tileSize - pixelOffset.x, y * tileSize - pixelOffset.y);
        }
    }
    
    _drawObjects(ctx, pixelOffset, world) {
        for (let obj of world.objects) {
            if (!obj.zLayer)
                this._drawObj(ctx, pixelOffset, obj)
        };
        player.draw(ctx, pixelOffset);
        for (let obj of world.objects) {
            if (obj.zLayer == 1)
                this._drawObj(ctx, pixelOffset, obj)
        };
    }

    _drawHighObjects(ctx, pixelOffset, world) {
        for (let obj of world.objects) {
            if (obj.zLayer == 2)
                this._drawObj(ctx, pixelOffset, obj)
        };
    }
        
    _drawDarkness(ctx, pixelOffset, world) {
        const fromX = Math.floor(pixelOffset.x / tileSize) - 1;
        const fromY = Math.floor(pixelOffset.y / tileSize) - 1;
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;    
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                let upleftVisible = world.vision.isVisibleSafe(x, y)
                let uprightVisible = world.vision.isVisibleSafe(x+1, y)
                let downleftVisible = world.vision.isVisibleSafe(x, y+1)
                let downrightVisible = world.vision.isVisibleSafe(x+1, y+1)
                let tile = (upleftVisible? 1: 0) + (uprightVisible? 2: 0) + (downleftVisible? 4: 0) + (downrightVisible? 8: 0)
                if (tile < 15)
                    ctx.drawImage(this.darknessVeil, 32*tile, 0, 32, 32, x*tileSize+16-pixelOffset.x, y*tileSize+16-pixelOffset.y, 32, 32)
            }
        }
    }        

    drawWorld(ctx, pixelOffset, world) {
        ctx.fillRect(0, 0, 768, 768);
        this._drawTerrain(ctx, pixelOffset, world);
        this._drawObjects(ctx, pixelOffset, world);
        this._drawTrees(ctx, pixelOffset, world);
        this._drawHighObjects(ctx, pixelOffset, world);
        this._drawDarkness(ctx, pixelOffset, world);
        if (drawAI) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
            const fromX = Math.floor(pixelOffset.x / tileSize);
            const fromY = Math.floor(pixelOffset.y / tileSize);
            const toX = (pixelOffset.x + viewInPixels) / tileSize;
            const toY = (pixelOffset.y + viewInPixels) / tileSize;    
            for (let y = fromY; y < toY; y++) {
                for (let x = fromX; x < toX; x++) {
                    if (!world.pathfinding.isPassable(x, y, null))
                        ctx.fillRect(x * tileSize - pixelOffset.x, y * tileSize - pixelOffset.y, tileSize, tileSize);
                }
            }
        }
    }

    _drawCoolImageIfNeeded(ctx, pixelOffset, dx, dy, world) {
        let x = player.x + dx;
        if (x < 0 || x >= world.width)
            return false;
        let y = player.y + dy;
        if (y < 0 || y >= world.height)
            return false;
        let gameObj = world.pathfinding.isOccupied(x, y);
        if (gameObj && gameObj.coolImage) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, 768, 768);
            let centerX = player.pixelX.get() - pixelOffset.x;
            let centerY = player.pixelY.get() - 2 * tileSize - pixelOffset.y - gameObj.coolImage.height / 2;
            let left = centerX - gameObj.coolImage.width/2;
            let top = centerY - gameObj.coolImage.height/2;
            ctx.drawImage(gameObj.coolImage, left, top);
            return true;
        }
        return false;
    }
    drawCoolImage(ctx, pixelOffset, world) {
        this._drawCoolImageIfNeeded(ctx, pixelOffset, 0, -1, world) ||
        this._drawCoolImageIfNeeded(ctx, pixelOffset, 1, 0, world) ||
        this._drawCoolImageIfNeeded(ctx, pixelOffset, -1, 0, world) ||
        this._drawCoolImageIfNeeded(ctx, pixelOffset, 0, 1, world);
    }
}

function drawTooltip(ctx, pixelOffset, tileUnderCursor) {
    if (tileUnderCursor.x < 0 || tileUnderCursor.x >= world.width)
        return;
    if (tileUnderCursor.y < 0 || tileUnderCursor.y >= world.height)
        return;
    if (!world.vision.isVisible(tileUnderCursor.x, tileUnderCursor.y))
        return;
    let left = (tileUnderCursor.x + 0.5) * tileSize - pixelOffset.x;
    let top = (tileUnderCursor.y + 0.5) * tileSize - pixelOffset.y;
    let text = world.hint(tileUnderCursor.x, tileUnderCursor.y);

    const maxWidth = 320;
    const lineHeight = 24;
    const padding = 5;
    let u = new Utterance(ctx, text, maxWidth, systemMessageSpeaker.color,
        systemMessageSpeaker.bgColor, systemMessageSpeaker.font, lineHeight, padding);
    left -= u.textBoxWidth / 2;
    if (left < 0)
        left = 0;
    if (left + u.textBoxWidth + 12 >= dialogUIleftOffset)
        left = dialogUIleftOffset - u.textBoxWidth - 12;
    u.draw(ctx, left, top - tileSize, 0, true);
}

// Animations. Every animation is an object with a function draw(ctx, offsetInPixels, timeFromStart) => bool
// if this function returns false, then an animation is over and will be deleted from this list
// Every animation has a "startTime" and "baseTile" (which game tile is its zero point). 
// An animation itself doesn't (and probably shouldn't) use either; only outer drawing loop does.
// But, for convenience, startTime and baseInTiles are stored inplace.
class Animations {
    constructor() {
        this.animations = []
        this.globalTimer = 0
    }

    add(animation, baseTile) {
        animation.startTime = this.globalTimer;
        animation.baseTile = baseTile;
        this.animations.push(animation)
    }

    draw(ctx, pixelOffset) {
        this.globalTimer = Date.now() / 1000.
        if (animations.length == 0)
            return;
        let newAnimations = [];
        for (let anim of this.animations) {
            let x = ('pixelX' in anim.baseTile) ? anim.baseTile.pixelX.get() : anim.baseTile.x * tileSize;
            let y = ('pixelY' in anim.baseTile) ? anim.baseTile.pixelY.get() : anim.baseTile.y * tileSize;
            let offsetInPixels = {
                x: x - pixelOffset.x + halfTileSize,
                y: y - pixelOffset.y + halfTileSize
            }
            let finished = anim.draw(ctx, offsetInPixels, this.globalTimer - anim.startTime);
            if (!finished)
                newAnimations.push(anim)
        };
        this.animations = newAnimations;
    }
};

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
        let x = tileSize * halfViewInTiles - measurement.width / 2;
        let y = 60;
        ctx.fillStyle = "black";
        ctx.fillText(this.text, x - 1, y);
        ctx.fillText(this.text, x + 1, y);
        ctx.fillText(this.text, x, y - 1);
        ctx.fillText(this.text, x, y + 1);
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
        let x = tileSize * halfViewInTiles - measurement.width / 2;
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
        if (this.text2)
            this._draw(ctx, y + 24, this.text2);

        return false;
    }
};

class Utterance {
    constructor(ctx, text, maxTextWidth, color, bgColor, font, lineHeight, padding) {
        this.text = text;
        this.lines = [];
        this.colors = [];
        this.bgColor = bgColor;
        this.font = font;
        this.lineHeight = lineHeight;
        this.padding = padding;
        this.addText(ctx, text, maxTextWidth, color);
    }

    addText(ctx, text, maxTextWidth, color) {
        let words = text.split(" ");
        let line = "";
        ctx.font = this.font;
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + " ";
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxTextWidth) {
                this.lines.push(line);
                this.colors.push(color);
                line = words[n] + " ";
            } else {
                line = testLine;
            }
        }
        this.lines.push(line);
        this.colors.push(color);

        this.textBoxWidth = 0;
        this.textBoxHeight = this.lineHeight * this.lines.length + this.lineHeight / 2;
        for (let n = 0; n < this.lines.length; n++) {
            let w = ctx.measureText(this.lines[n]).width;
            if (this.textBoxWidth < w)
                this.textBoxWidth = w;
        }
    }

    _roundedRect(ctx, x, y, width, height, radius, doBorder) {
        x = Math.floor(x) + 0.5;
        y = Math.floor(y) + 0.5;
        width = Math.floor(width);
        height = Math.floor(height);
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
        ctx.strokeStyle = this.colors[0];
        let width = fixedWidth;
        if (width < this.textBoxWidth)
            width = this.textBoxWidth;
        this._roundedRect(ctx, textBoxLeft, textBoxTop,
            width + this.padding, this.textBoxHeight, 6, doBorder);
        ctx.font = this.font;
        for (let l = 0; l < this.lines.length; l++) {
            ctx.fillStyle = this.colors[l];
            ctx.fillText(this.lines[l], textBoxLeft + this.padding, textBoxTop + (l + 1) * this.lineHeight);
        }
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
            let left = offsetInPixels.x - msg.textBoxWidth / 2;
            if (left < 0)
                left = 0;
            if (n == this.msgQueue.length - 1 && y < msg.textBoxHeight + 20)
                y = msg.textBoxHeight + 20 
            msg.draw(ctx, left, y - msg.textBoxHeight - 20, 0, true);
            y -= msg.textBoxHeight + msg.padding;
        }
        return false;
    }
}

let renderer = new Renderer();
let animations = new Animations();
setInterval(() => {
        const pixelOffset = canvasOffset();
        world.script.onDraw();
        renderer.drawWorld(ctx, pixelOffset, world);
        fire.step(pixelOffset);
        fire.draw(ctx, pixelOffset);
        animations.draw(ctx, pixelOffset);
        renderer.drawCoolImage(ctx, pixelOffset, world);
        ui.drawTooltip(ctx, pixelOffset);
        ui.draw(ctx);
    },
    20
);
