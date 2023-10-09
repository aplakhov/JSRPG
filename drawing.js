"use strict"

class Renderer {
    constructor() {
        this.stoneTiles = images.prepare("stone_tiles");
        this.stoneGroundTile = images.prepare("stone_wall_ground_tile");
        this.darknessVeil = images.prepare("darkness_veil");
        this.earthEar = images.prepare("earth_ear");
        this.earthEarDanger = images.prepare("earth_ear_danger");

        this.stableRandom = []
        for (let dx = 0; dx < viewInTiles; dx++) {
            for (let dy = 0; dy < viewInTiles; dy++) {
                this.stableRandom.push(Math.floor(Math.random() * 12000));
            }
        }
    }
    
    _tilesetPicture(biome, name) {
        if (name in biome)
            return biome[name];
        return biome.tilesetPrefix + name; 
    }

    setTileset(biome) {
        this.sandTiles = this._tilesetPicture(biome, "sand_tiles");
        this.grassTiles = this._tilesetPicture(biome, "grass_tiles");
        this.darkGrassBorderTiles = this._tilesetPicture(biome, "dark_grass_border");
        this.groundTiles = this._tilesetPicture(biome, "ground_tiles");
        this.treeImages = this._tilesetPicture(biome, "tree_images");
        this.deadTreeImages = this._tilesetPicture(biome, "dead_trees");
        this.burningTreeImages = this._tilesetPicture(biome, "burning_trees");
        this.rockTiles = this._tilesetPicture(biome, "rock_tiles");
        this.rockGroundTiles = this._tilesetPicture(biome, "rock_ground_tiles");
        this.pavementTiles = this._tilesetPicture(biome, "pavement_tiles");
        this.animatedWater = this._tilesetPicture(biome, "animated_water");
        if ("stone_tiles" in biome)
            this.stoneTiles = this._tilesetPicture(biome, "stone_tiles");
        else
            this.stoneTiles = images.prepare("stone_tiles");
        if ("stone_wall_ground_tile" in biome)
            this.stoneGroundTile = this._tilesetPicture(biome, "stone_wall_ground_tile");
        else
            this.stoneGroundTile = images.prepare("stone_wall_ground_tile");
    }

    _drawTrees(ctx, pixelOffset, world) {
        const treeImg = images.getReadyImage(this.treeImages);
        if (!treeImg)
            return;        
        const variationsNum = treeImg.width / 64;

        const burningTreeImg = images.getReadyImage(this.burningTreeImages);
        if (!burningTreeImg)
            return;        
        const animationFrames = burningTreeImg.height / 84;
        
        const fireGrowing = 10;
        const treeDies = 50 + fireGrowing;
        const fireStartsDecreasing = 350 + fireGrowing;
        const fireDecreasing = 50;
        const fireDies = fireStartsDecreasing + fireDecreasing;

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
            if (tree.burning) {
                if (tree.burning < treeDies)
                    images.draw(ctx, this.treeImages, variation * 64, 0, 64, 64, dx, dy, 64, 64); 
                else
                    images.draw(ctx, this.deadTreeImages, variation * 64, 0, 64, 64, dx, dy, 64, 64); 
                if (tree.burning < fireDies) {
                    const animationFrame = (x + y + Math.floor(globalTimer*16)) % animationFrames;
                    if (tree.burning < fireGrowing)
                        ctx.globalAlpha = tree.burning / fireGrowing;
                    else if (tree.burning > fireStartsDecreasing)
                        ctx.globalAlpha = (fireDies - tree.burning) / fireDecreasing;
                    images.draw(ctx, this.burningTreeImages, variation * 64, animationFrame * 84, 64, 84, dx, dy - 20, 64, 84);
                    ctx.globalAlpha = 1;
                    tree.burning++;
                }
                if (tree.burning > fireGrowing && tree.burning < fireDies) {
                    const treeFireStrength = 5;
                    checkFireEffects(tree.x, tree.y, treeFireStrength);
                }
            } else {
                images.draw(ctx, this.treeImages, variation * 64, 0, 64, 64, dx, dy, 64, 64); 
            }
        }
    }

    _drawTerrainLayer(ctx, pixelOffset, world, tile, tileImages) {
        let img = images.getReadyImage(tileImages);
        if (!img)
            return;
        const variationsNum = img.width / 64;
        const stableRandomLen = this.stableRandom.length;
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (tile == world.terrain[x][y]) {
                    let variation = this.stableRandom[(x + y * viewInTiles) % stableRandomLen] % variationsNum;
                    images.draw(ctx, tileImages, variation*64, 0, 64, 64, x*tileSize - pixelOffset.x - 16, y*tileSize - pixelOffset.y - 16, 64, 64); 
                }
            }
        }
    }

    _drawTerrainBorder(ctx, pixelOffset, world, tile11, tile12, tile2, tileImages) {
        let img = images.getReadyImage(tileImages);
        if (!img)
            return;
        const variationsNum = img.width / 64;
        const stableRandomLen = this.stableRandom.length;
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (world.terrain[x][y] != tile11 && world.terrain[x][y] != tile12)
                    continue;
                let hasBorder = (x > 0 && world.terrain[x-1][y] == tile2) ||
                    (y > 0 && world.terrain[x][y-1] == tile2) || 
                    (x + 1 < world.width && world.terrain[x+1][y] == tile2) || 
                    (y + 1 < world.height && world.terrain[x][y+1] == tile2);
                if (hasBorder) {
                    let variation = this.stableRandom[(x + y * viewInTiles) % stableRandomLen] % variationsNum;
                    images.draw(ctx, tileImages, variation*64, 0, 64, 64, x*tileSize - pixelOffset.x - 16, y*tileSize - pixelOffset.y - 16, 64, 64);
                } 
            }
        }
    }

    _drawTerrainLayer32(ctx, pixelOffset, world, tile, tileImages) {
        let img = images.getReadyImage(tileImages);
        if (!img)
            return;
        const variationsNum = img.width / 32;
        const stableRandomLen = this.stableRandom.length;
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (tile == world.terrain[x][y]) {
                    let variation = this.stableRandom[(x + y * viewInTiles) % stableRandomLen] % variationsNum;
                    images.draw(ctx, tileImages, variation*32, 0, 32, 32, x*tileSize - pixelOffset.x, y*tileSize - pixelOffset.y, 32, 32); 
                }
            }
        }
    }

    _drawTerrain(ctx, pixelOffset, world) {
        let waterImg = images.getReadyImage(this.animatedWater);
        if (!waterImg)
            return;
        let numWaterFrames = waterImg.width / 32;
        const fromX = Math.floor(pixelOffset.x / tileSize);
        const fromY = Math.floor(pixelOffset.y / tileSize);
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (TERRAIN_WATER == world.terrain[x][y]) {
                    let animatedWaterFrame = Math.floor(globalTimer*8) % numWaterFrames;
                    images.draw(ctx, this.animatedWater, animatedWaterFrame*32, 0, 32, 32, x*tileSize - pixelOffset.x, y*tileSize - pixelOffset.y, 32, 32); 
                }
            }
        }
        // draw subsurface animations after water but before anything else
        world.animations.draw(ctx, pixelOffset, 0);

        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_SAND, TERRAIN_GRASS, TERRAIN_WATER, this.groundTiles);
        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_STONE, TERRAIN_PAVEMENT, TERRAIN_WATER, this.stoneGroundTile);

        this._drawTerrainLayer32(ctx, pixelOffset, world, TERRAIN_STONE, this.stoneTiles);
        this._drawTerrainLayer(ctx, pixelOffset, world, TERRAIN_SAND, this.sandTiles);
        this._drawTerrainLayer32(ctx, pixelOffset, world, TERRAIN_PAVEMENT, this.pavementTiles);

        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_GRASS, -1, TERRAIN_PAVEMENT, this.darkGrassBorderTiles);
        this._drawTerrainBorder(ctx, pixelOffset, world, TERRAIN_GRASS, -1, TERRAIN_SAND, this.darkGrassBorderTiles);        
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
                    images.draw(ctx, this.darknessVeil, 32*tile, 0, 32, 32, x*tileSize+16-pixelOffset.x, y*tileSize+16-pixelOffset.y, 32, 32)
            }
        }
    }
    
    _randomDisplacement() {
        if (Math.random() < 0.8)
            return 0;
        return Math.floor(Math.random() * 3 - 1);
    }

    _drawEarthEar(ctx, pixelOffset, world) {
        const fromX = Math.floor(pixelOffset.x / tileSize) - 1;
        const fromY = Math.floor(pixelOffset.y / tileSize) - 1;
        const toX = (pixelOffset.x + viewInPixels) / tileSize;
        const toY = (pixelOffset.y + viewInPixels) / tileSize;
        let px = pixelOffset.x, py = pixelOffset.y;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                let upleftVisible = world.pathfinding.isPassableTerrain(x, y);
                let uprightVisible = world.pathfinding.isPassableTerrain(x+1, y);
                let downleftVisible = world.pathfinding.isPassableTerrain(x, y+1);
                let downrightVisible = world.pathfinding.isPassableTerrain(x+1, y+1);
                let tile = (upleftVisible? 1: 0) + (uprightVisible? 2: 0) + (downleftVisible? 4: 0) + (downrightVisible? 8: 0)
                if (tile < 15)
                    images.draw(ctx, this.earthEar, 32*tile, 0, 32, 32, x*tileSize+16-px, y*tileSize+16-py, 32, 32)
            }
        }
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                let objectThere = world.pathfinding.isOccupied(x, y);
                if (objectThere && objectThere != player) {
                    let drawX, drawY;
                    if (objectThere instanceof Mob) {
                        drawX = objectThere.pixelX.get() + this._randomDisplacement();
                        drawY = objectThere.pixelY.get() + this._randomDisplacement();                        
                    } else {
                        drawX = x * tileSize;
                        drawY = y * tileSize;
                    }
                    images.draw(ctx, this.earthEarDanger, drawX-px-16, drawY-py-16);
                }
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
        if (player.earthEarUntil && player.earthEarUntil > globalTimer)
            this._drawEarthEar(ctx, pixelOffset, world);
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
    }

    add(animation, baseTile, subsurface) {
        animation.startTime = globalTimer;
        animation.baseTile = baseTile;
        if (subsurface)
            animation.layer = 0;
        else
            animation.layer = 1;
        this.animations.push(animation)
    }

    addUIanimation(animation, baseTile) {
        animation.startTime = globalTimer;
        if (baseTile)
            animation.baseTile = baseTile;
        else
            animation.baseTile = player;
        animation.layer = 2;
        this.animations.push(animation);
    }

    draw(ctx, pixelOffset, layer) {
        if (this.animations.length == 0)
            return;
        let newAnimations = [];
        for (let anim of this.animations) {
            if (anim.layer != layer) {
                newAnimations.push(anim);
                continue;
            }
            let x = ('pixelX' in anim.baseTile) ? anim.baseTile.pixelX.get() : anim.baseTile.x * tileSize;
            let y = ('pixelY' in anim.baseTile) ? anim.baseTile.pixelY.get() : anim.baseTile.y * tileSize;
            let offsetInPixels = {
                x: x - pixelOffset.x + halfTileSize,
                y: y - pixelOffset.y + halfTileSize
            }
            let finished = anim.draw(ctx, offsetInPixels, globalTimer - anim.startTime);
            if (!finished)
                newAnimations.push(anim)
        };
        this.animations = newAnimations;
    }
};

class Bullet {
    constructor(direction, duration, color) {
        this.direction = direction;
        this.duration = duration;
        this.color = color;
    }

    draw(ctx, offsetInPixels, time) {
        let rate = time / this.duration
        if (rate > 1)
            return true;
        ctx.fillStyle = this.color;
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

class Fountain {
    constructor(strength) {
        this.strength = strength
        this.particles = []
        for (let n = 0; n < this.strength / 3; n++) {
            this.particles.push({
                dx: 20 * Math.random() - 10, 
                start: Math.random() * 1.5,
                strength: this.strength + 2 * Math.random() - 1}
            )
        }
    }
    draw(ctx, offsetInPixels, time) {
        ctx.fillStyle = "rgb(235, 235, 255)";
        const g = 80; // pixels / sec^2
        const oneParticleTime = 2; // sec
        for (let p of this.particles) {
            let t = (time - p.start) % oneParticleTime;
            let x = p.dx * t;
            let y = p.strength * t - g * t * t / 2;
            if (y > 0)
                ctx.fillRect(offsetInPixels.x + x, offsetInPixels.y - y, 2, 2);
        }
        return false;
    }
}

class GiantTurtle {
    constructor(cycleTime) {
        this.cycleTime = cycleTime;
        this.body = images.prepare("Turtle/body");
        this.upFront = images.prepare("Turtle/up_front_leg");
        this.upBack = images.prepare("Turtle/up_back_leg");
        this.downFront = images.prepare("Turtle/down_front_leg");
        this.downBack = images.prepare("Turtle/down_back_leg");
    }
    _drawLimb(ctx, limb, phase, angle1, angle2, x, y, zeroX, zeroY, r, phaseShift) {
        let rotation = (angle1 + angle2)/2 + (angle2 - angle1)/2 * Math.sin(phase);
        ctx.save();
        ctx.translate(x + r * Math.cos(phase + phaseShift), y + r * Math.sin(phase + phaseShift));
        ctx.rotate(rotation * Math.PI / 180);
        images.draw(ctx, limb, -zeroX, -zeroY);
        ctx.restore();
    }
    draw(ctx, offsetInPixels, time) {
        let zeroX = 290, zeroY = 232;
        let phase = (time / this.cycleTime) * (2 * Math.PI);
        this._drawLimb(ctx, this.upFront, phase, -10, 45, offsetInPixels.x + 160, offsetInPixels.y - 188, 180, 180, 24, 0);
        this._drawLimb(ctx, this.downFront, phase + 0.02, 10, -45, offsetInPixels.x + 160, offsetInPixels.y + 224, 180, 75, 24, 0);
        this._drawLimb(ctx, this.upBack, phase - 0.03, 0, -45, offsetInPixels.x - 220, offsetInPixels.y - 128, 108, 108, 24, 0);
        this._drawLimb(ctx, this.downBack, phase, 0, 45, offsetInPixels.x - 220, offsetInPixels.y + 128, 108, 34, 24, 0);

        ctx.save();
        ctx.translate(offsetInPixels.x, offsetInPixels.y);
        let bodyRotation = Math.cos(phase);
        ctx.rotate(bodyRotation * Math.PI / 180);
        images.draw(ctx, this.body, -zeroX, -zeroY);
        ctx.restore();

        //images.draw(ctx, this.body, offsetInPixels.x - zeroX, offsetInPixels.y - zeroY);
        return false;
    }
}

class Rain {
    constructor(duration) {
        this.duration = duration;
        this.transitToDarknessTime = duration / 4;
        this.lightningTime = [];
        for (let t = duration / 4; t < 3 * duration / 4; t++) {
            if (Math.random() < 0.05)
                this.lightningTime.push(t);
        }
        this.maxDarkness = 0.6;
        this.rain = []
        for (let x = 0; x < viewInTiles; x++) {
            this.rain.push([])
            for (let y = 0; y < viewInTiles; y++) {
                let h = Math.random() * 12;
                let dx = Math.random() * tileSize - halfTileSize;
                let dy = Math.random() * tileSize - halfTileSize;
                this.rain[x].push([h, dx, dy])
            }
        }
    }

    draw(ctx, offsetInPixels, time) {
        if (time > this.duration)
            return true;
        let darkness = this.maxDarkness;
        if (time < this.transitToDarknessTime)
            darkness = this.maxDarkness * time / this.transitToDarknessTime;
        else if (time > this.duration - this.transitToDarknessTime)
            darkness = this.maxDarkness * (this.duration - time) / this.transitToDarknessTime;
        ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
        for (let t of this.lightningTime) {
            if (time > t && time < t + 0.5) {
                let rate = Math.random() / 4;
                ctx.fillStyle = `rgba(214, 238, 255, ${rate})`;
                break;
            }
        }
        ctx.fillRect(0, 0, tileSize * viewInTiles, tileSize * viewInTiles);    
        for (let x = 0; x < viewInTiles; x++) {
            for (let y = 0; y < viewInTiles; y++) {
                let particle = this.rain[x][y]
                let h = particle[0] - time * 8;
                while (h < 0)
                    h += 12;
                let fx = x * tileSize + halfTileSize + particle[1];
                let fy = y * tileSize + halfTileSize + particle[2];
                fx = (fx + offsetInPixels.x + 100 * viewInPixels) % viewInPixels - halfViewInPixels;
                fy = (fy + offsetInPixels.y + 100 * viewInPixels) % viewInPixels - halfViewInPixels;
                
                //hurricane
                //particle[1] += 2;

                const distortion = 0.05;

                let x1 = fx * (1 + h * distortion) + halfViewInPixels;
                let y1 = fy * (1 + h * distortion * 2) + halfViewInPixels;
        
                let nextH = h - 0.2;
                if (nextH < 0) {
                    nextH = 0;
                    particle[1] = Math.random() * tileSize - halfTileSize;
                    particle[2] = Math.random() * tileSize - halfTileSize;
                }
                let x2 = fx * (1 + nextH * distortion) + halfViewInPixels;
                let y2 = fy * (1 + nextH * distortion * 2) + halfViewInPixels;

                ctx.strokeStyle = "rgb(126, 156, 186)";
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }    
        return false;
    }
}

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

    drawOnlyText(textBoxLeft, textBoxTop) {
        ctx.font = this.font;
        for (let l = 0; l < this.lines.length; l++) {
            ctx.fillStyle = this.colors[l];
            ctx.fillText(this.lines[l], textBoxLeft + this.padding, textBoxTop + (l + 1) * this.lineHeight);
        }
    }

    draw(ctx, textBoxLeft, textBoxTop, fixedWidth, doBorder) {
        ctx.fillStyle = this.bgColor;
        ctx.strokeStyle = this.colors[0];
        let width = fixedWidth;
        if (width < this.textBoxWidth)
            width = this.textBoxWidth;
        this._roundedRect(ctx, textBoxLeft, textBoxTop,
            width + this.padding, this.textBoxHeight, 6, doBorder);
        this.drawOnlyText(textBoxLeft, textBoxTop);
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
        u.endTime = globalTimer + (text.length + 80) / 40;
        this.msgQueue.push(u);
    }
    draw(ctx, offsetInPixels, time) {
        let y = offsetInPixels.y + 4;
        for (let n = this.msgQueue.length - 1; n >= 0; n--) {
            let msg = this.msgQueue[n];
            if (msg.endTime < globalTimer)
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

class VisualDarkness {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = viewInPixels;
        this.canvas.height = viewInPixels;
    }

    draw(ctx, offsetInPixels, time) {
        this.redraw(offsetInPixels);
        ctx.drawImage(this.canvas, 0, 0);
        return false;
    }

    redraw(offsetInPixels) {
        let ctx = this.canvas.getContext("2d", { willReadFrequently: true });
        ctx.willReadFrequently = true;
        ctx.globalCompositeOperation="copy";
        ctx.fillStyle = "rgba(0,0,20,0.5)";
        ctx.fillRect(0, 0, viewInPixels, viewInPixels);
        ctx.globalCompositeOperation="source-over";

        let imageData = ctx.getImageData(0, 0, viewInPixels, viewInPixels);
        let pixels = imageData.data;
        for (let o of world.objects) {
            if (o.additionalLight) {
                let r = 47 + Math.floor(Math.random() * 3);
                let x, y;
                if (o.pixelX) {
                    x = Math.floor(o.pixelX.get());
                    y = Math.floor(o.pixelY.get());
                } else {
                    x = o.x * tileSize;
                    y = o.y * tileSize;
                }
                this.drawLight(x + offsetInPixels.x, y + offsetInPixels.y, r, pixels);
            }
        }
        for (let t of world.trees) {
            if (t.burning && t.burning < 400) {
                let r = 47 + Math.floor(Math.random() * 3);
                this.drawLight(t.x*tileSize + offsetInPixels.x, t.y*tileSize + offsetInPixels.y, r, pixels);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    drawLight(lx, ly, r, pixels) {
        const r2 = r*r;
        const sx = Math.max(0, lx - r), sy = Math.max(0, ly  - r);
        const fx = Math.min(viewInPixels, lx + r + 1), fy = Math.min(viewInPixels, ly + r + 1);
        for (let y = sy; y < fy; y++) {
            for (let x = sx; x < fx; x++) {
                const dx = x - lx, dy = y - ly;
                const d2 = dx*dx+dy*dy;
                if (d2 <= r2) {
                    const n = 4 * (y * viewInPixels + x) + 3;
                    const dst = Math.floor(128 * Math.sqrt(d2 / r2));
                    if (pixels[n] > dst)
                        pixels[n] = dst;
                }
            }
        }
    }
};
