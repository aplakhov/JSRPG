"use strict";

function castStone(caster, targetX, targetY) {
    const dx = targetX - caster.x;
    const dy = targetY - caster.y;
    const direction = {
        x: dx * tileSize,
        y: dy * tileSize
    }
    const duration = 0.3;
    world.animations.add(new Bullet(direction, duration, "rgb(0, 0, 0)"), caster);
    setTimeout(() => {
        let interrupted = 'onFinishSpell' in world.script && world.script.onFinishSpell(targetX, targetY, "stone");
        if (!interrupted) {
            let tile = world.terrain[targetX][targetY];
            if (tile != TERRAIN_DARK_FOREST && tile != TERRAIN_STONE_WALL)
                world.terrain[targetX][targetY] = TERRAIN_STONE;
        }
    }, 300);
}

function castWater(caster, targetX, targetY) {
    const dx = targetX - caster.x;
    const dy = targetY - caster.y;
    const direction = {
        x: dx * tileSize,
        y: dy * tileSize
    }
    const duration = 0.3;
    world.animations.add(new Bullet(direction, duration, "rgb(0, 128, 255)"), caster);
    setTimeout(() => {
        let interrupted = 'onFinishSpell' in world.script && world.script.onFinishSpell(targetX, targetY, "water");
        if (!interrupted) {
            let tile = world.terrain[targetX][targetY];
            let occupied = world.pathfinding.isOccupied(targetX, targetY);
            if (tile != TERRAIN_STONE_WALL && tile != TERRAIN_DARK_FOREST && !occupied)
                world.terrain[targetX][targetY] = TERRAIN_WATER;
        }
    }, 300);
}

function applySpellDamage(gameObj, amount) {
    if ('aggro' in gameObj)
        gameObj.aggro();
    if ('applyNonPhysicalDamage' in gameObj)
        gameObj.applyNonPhysicalDamage(amount);
    else if ('applyDamage' in gameObj)
        gameObj.applyDamage(amount);
}

class Lightning {
    constructor(from, to, duration, color1, color2) {
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.color1 = color1;
        this.color2 = color2;
    }    

    renderOneLine(ctx, x, y, dx, dy, color) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        let offsetDirX = -dy / 5, offsetDirY = dx / 5;
        const numSegments = 4;
        for (let n = 1; n <= numSegments; n++) {
            let offsetX = dx * n / numSegments;
            let offsetY = dy * n / numSegments;
            if (n < numSegments) {
                let offset = Math.random() * 2 - 1;
                offsetX += offset * offsetDirX;
                offsetY += offset * offsetDirY;
            }
            ctx.lineTo(x + offsetX, y + offsetY);
            let gameX = Math.floor((this.from.x * tileSize + halfTileSize + offsetX) / tileSize);
            let gameY = Math.floor((this.from.y * tileSize + halfTileSize + offsetY) / tileSize);
            let occluded = false;
            if (gameX >= 0 && gameY >= 0 && gameX < world.width && gameY < world.height) {
                let gameObj = world.pathfinding.isOccupied(gameX, gameY);
                if (gameObj && gameObj != this.from) {
                    applySpellDamage(gameObj, 1);
                    occluded = true;
                }
                let terrainTile = world.terrain[gameX][gameY];
                if (terrainTile == TERRAIN_DARK_FOREST) {
                    burnTreeAt(gameX, gameY, 25);
                    occluded = true;
                } else if (terrainTile == TERRAIN_STONE_WALL)
                    occluded = true;
            }
            if (occluded) {
                ctx.stroke();
                return;
            }
        }
        ctx.stroke();
    }

    draw(ctx, offsetInPixels, time) {
        if (time > this.duration)
            return true;
        let x = offsetInPixels.x;
        let y = offsetInPixels.y;
        let dx = (this.to.x - this.from.x) * tileSize;
        let dy = (this.to.y - this.from.y) * tileSize;
        this.renderOneLine(ctx, x, y, dx, dy, this.color1);
        this.renderOneLine(ctx, x, y, dx, dy, this.color2);

        let rate = Math.random() / 2;
        ctx.fillStyle = `rgba(214, 238, 255, ${rate})`;
        ctx.fillRect(0, 0, tileSize * viewInTiles, tileSize * viewInTiles);

        return false;
    }
}

function castLightning(caster, target) {
    const lightningDurationSec = 1;
    world.animations.add(new Lightning(caster, target, lightningDurationSec, "rgb(237, 246, 255)", "rgb(214, 238, 255)"), caster);
    world.vision.temporaryAdditionalLight = 3;
    world.vision.recalculateLocalVisibility();
    setTimeout(() => {
        world.vision.temporaryAdditionalLight = 0;
        world.vision.recalculateLocalVisibility();
        if ('onFinishSpell' in world.script)
            world.script.onFinishSpell(target.x, target.y, "lightning");
    }, lightningDurationSec * 1000);    
}

class GameplayFire {
    constructor(x, y) {
        this.initialObj = {class: "GameplayFire"};
        this.x = x;
        this.y = y;
    }
    
    _checkTerrain() {
        let tile = world.terrain[this.x][this.y];
        if (tile == TERRAIN_WATER || tile == TERRAIN_STONE_WALL) {
            this.noDecal = true; 
            if (!this.timeWhenBurnedOut)
                this.timeWhenBurnedOut = globalTimer;
            else if (this.timeWhenBurnedOut + 1 <= globalTimer)
                this.dead = true;
        }
    }

    startFire(durationTurns, fireStrength) {
        this.durationTurns = durationTurns;
        const variationsNum = renderer.burningTreeImages.width / 64;
        this.variation = Math.floor(Math.random() * variationsNum);
        this.decal = images.prepare("Spells/fire_decal");
        const decalVariations = 4;
        this.decalVariation = Math.floor(Math.random() * decalVariations);
        this.fireStrength = fireStrength;
    }

    applyHealing() {
        if (this.timeWhenBurnedOut + 1 < globalTimer) {
            this.noDecal = true;
            this.dead = true;
        }
    }

    draw(ctx, x, y) {
        this._checkTerrain();
        if (!this.timeWhenBurnedOut) {
            checkFireEffects(this.x, this.y, this.fireStrength);
        }
        if (!this.timeWhenBurnedOut || this.timeWhenBurnedOut + 1 > globalTimer) {
            const animationFrames = renderer.burningTreeImages.height / 84;
            const animationFrame = (x + y + Math.floor(globalTimer*16)) % animationFrames;
            if (this.timeWhenBurnedOut)
                ctx.globalAlpha = (this.timeWhenBurnedOut + 1 - globalTimer);
            ctx.drawImage(renderer.burningTreeImages, this.variation * 64, animationFrame * 84, 64, 84, x - 16, y - 36, 64, 84);
            ctx.globalAlpha = 1;
        }
        if (this.timeWhenBurnedOut && !this.noDecal) {
            if (this.timeWhenBurnedOut + 1 > globalTimer)
                ctx.globalAlpha = (globalTimer - this.timeWhenBurnedOut);
            images.draw(ctx, this.decal, 32 * this.decalVariation, 0, 32, 32, x, y, 32, 32);
            ctx.globalAlpha = 1;
        }
    }

    nextTurn(forced) {
        if (this.durationTurns <= 0)
            return;
        if (this.durationTurns < 100)
            this.durationTurns -= 1;
        if (this.durationTurns == 0) {
            this.timeWhenBurnedOut = globalTimer;
            this.additionalLight = 0;
            world.vision.recalculateLocalVisibility();
        }
    }
}

class Meteor {
    constructor(targetX, targetY, directionX, directionY, duration) {
        this.targetX = targetX;
        this.targetY = targetY;
        if (directionX == 0 && directionY == 0) {
            directionX = Math.random() - 0.5;
            directionY = Math.random() - 0.5;
        }
        let r = Math.sqrt(directionX * directionX + directionY * directionY);
        this.directionX = directionX / r;
        this.directionY = directionY / r;
        this.duration = duration;
        this.image = images.prepare("Spells/meteor");
    }
    draw(ctx, offsetInPixels, time) {
        if (time > this.duration)
            return true;
        let finalX = this.targetX * tileSize + offsetInPixels.x;
        let finalY = this.targetY * tileSize + offsetInPixels.y;
        const speed = 768 / this.duration;
        let size = 16 + 48 * (this.duration - time) / this.duration;
        let x = finalX - speed * (this.duration - time) * this.directionX - size/2;
        let y = finalY - speed * (this.duration - time) * this.directionY - size/2;
        images.draw(ctx, this.image, 0, 0, 64, 64, x, y, size, size);
        world.fire.emitParticles(x - offsetInPixels.x + size/2 + 16, y - offsetInPixels.y + size/2 + 16, 100, canvasOffset());
        return false;
    }
}

function burnTreeAt(x, y, startingAmountOfFire) {
    for (let tree of world.trees) {
        if (tree.x == x && tree.y == y && !(tree.burning >= startingAmountOfFire)) {
            tree.burning = startingAmountOfFire;
            break;
        }
    }
}

function _checkFireEffectsAt(x, y, fireStrength) {
    if (x < 0 || y < 0 || x >= world.width || y >= world.height)
        return;
    let gameObj = world.pathfinding.isOccupied(x, y);
    if (gameObj) {
        let damageProbability = fireStrength / 25;
        if (Math.random() < damageProbability)
            applySpellDamage(gameObj, 1);
    }
    let tile = world.terrain[x][y];
    if (tile == TERRAIN_DARK_FOREST && Math.random() < fireStrength / 2000)
        burnTreeAt(x, y, 1);
}

function checkFireEffects(x, y, fireStrength) {
    _checkFireEffectsAt(x, y, fireStrength);
    _checkFireEffectsAt(x-1, y, fireStrength/2);
    _checkFireEffectsAt(x, y-1, fireStrength/2);
    _checkFireEffectsAt(x+1, y, fireStrength/2);
    _checkFireEffectsAt(x, y+1, fireStrength/2);
}

function startGameplayFire(x, y, durationInTurns, fireStrength) {
    x = Math.floor(x + 0.5);
    y = Math.floor(y + 0.5);
    if (x < 0 || y < 0 || x >= world.width || y >= world.height)
        return;
    let tile = world.terrain[x][y];
    if (tile == TERRAIN_DARK_FOREST) {
        burnTreeAt(x, y, 25);
    } else {
        let f = new GameplayFire(x, y);
        f.startFire(durationInTurns, fireStrength);
        f.additionalLight = 6;
        world.objects.push(f);
        world.vision.recalculateLocalVisibility();
    }
}

function castMeteorShower(caster, target) {
    for (let n = 0; n < 3; n++) {
        const targetX = target.x + Math.random() * 6 - 3;
        const targetY = target.y + Math.random() * 6 - 3;
        const meteorFallTime = 1.2 + 0.6 * Math.random();
        const baseTile = {x: 0, y: 0}
        world.animations.add(new Meteor(targetX, targetY, target.x - caster.x, target.y - caster.y, meteorFallTime), baseTile);
        setTimeout(() => { startGameplayFire(targetX, targetY, 10, 10) }, meteorFallTime * 1000);
    }
}

function castFire(caster, targetX, targetY) {
    const dx = targetX - caster.x;
    const dy = targetY - caster.y;
    const direction = {
        x: dx * tileSize,
        y: dy * tileSize
    }
    const duration = 0.3;
    world.animations.add(new Bullet(direction, duration, "rgb(248,187,84)"), caster);
    setTimeout(() => {
        let interrupted = 'onFinishSpell' in world.script && world.script.onFinishSpell(targetX, targetY, "fire");
        if (!interrupted)
            startGameplayFire(targetX, targetY, 3, 10);
    }, 300);
}

class HealingEffect {
    constructor() {
        this.particles = []
        for (let n = 0; n <= 16; n++) {
            let x = 10 * Math.cos(n * Math.PI / 8);
            let y = 10 * Math.sin(n * Math.PI / 8);
            this.particles.push({x: x, y: y, temperature: 20})
        }
        this.colors = [
            "rgba(255,255,255,0.25)",
            "rgba(200,255,255,0.5)",
            "rgb(100,200,255)",
            "rgb(50,170,255)",
            "rgb(0,148,255)",
            "rgb(0,130,255)",
            "rgb(0,118,255)",
            "rgb(0,98,255)",
            "rgb(0,78,255)",
            "rgb(0,58,255)",
            "rgb(0,38,255)",
        ]        
    }
    draw(ctx, offsetInPixels, time) {
        let allParticlesDead = false;
        for (let n = 0; n < this.particles.length; n++) {
            let p = this.particles[n];
            if (Math.random() < 0.3)
                p.x -= 1;
            if (Math.random() < 0.3)
                p.x += 1;
            if (Math.random() < 0.8)
                p.y -= 1;
            if (Math.random() < 0.7)
                p.temperature--;
            if (p.temperature > 0) {
                allParticlesDead = false;
                ctx.fillStyle = this.colors[Math.floor(p.temperature/2)];
                ctx.fillRect(p.x + offsetInPixels.x, p.y + offsetInPixels.y, 2, 2);
            }
        }
        return false;
    }
}

function castHealing(target) {
    let realTargets = []
    world.pathfinding.isOccupied(target.x, target.y);
    if (world.terrain[target.x][target.y] == TERRAIN_DARK_FOREST) {
        for (let tree of world.trees)
            if (tree.x == target.x && tree.y == target.y && tree.burning)
                realTargets.push(tree);
    }
    for (let obj of world.objects)
        if (obj.x == target.x && obj.y == target.y && 'applyHealing' in obj)
            realTargets.push(obj);
    realTargets.push(player);
    for (let realTarget of realTargets)
        world.animations.add(new HealingEffect(), realTarget);
    setTimeout(() => {
        for (let realTarget of realTargets) {
            let interrupted = 'onFinishSpell' in world.script && world.script.onFinishSpell(realTarget.x, realTarget.y, "healing");
            if (!interrupted) {
                if ('applyHealing' in realTarget)
                    realTarget.applyHealing(25);
                if ('burning' in realTarget)
                    realTarget.burning = 0;
            }
        }
    }, 500);
}

function castSpell(caster, spell, target) {
    if (spell == "stone")
        castStone(caster, target.x, target.y);
    else if (spell == "fire")
        castFire(caster, target.x, target.y);
    else if (spell == "water")
        castWater(caster, target.x, target.y);
    else if (spell == "lightning")
        castLightning(caster, target);
    else if (spell == "meteor_shower")
        castMeteorShower(caster, target);
    else if (spell == "healing")
        castHealing(target);
    else
        console.log(spell, "is not implemented");
}

function _useLookingGlassAt(x, y) {
    if (x < 0 || y < 0 || x >= world.width || y >= world.height)
        return false;
    let target = world.pathfinding.isOccupied(x, y);
    if (target) {
        //...
        return false;
    }
    let tile = world.terrain[x][y];
    if (tile == TERRAIN_WATER && !playerKnowsSpell("water")) {
        const msgs = [
            "Оказывается, вода сделана из двух разных типов воздуха, соединенных вместе огнём",
            "Я себе воду представлял не так",
            "Интересно теперь самому попробовать..."
        ]
        discoverNewSpell(msgs, "water");
        return true;
    }
}

function useLookingGlass() {
    let up = _useLookingGlassAt(player.x, player.y - 1);
    let down = _useLookingGlassAt(player.x, player.y + 1);
    let left = _useLookingGlassAt(player.x - 1, player.y);
    let right = _useLookingGlassAt(player.x + 1, player.y);
    return up || down || left || right;
}

function discoverNewSpell(msgs, spell) {
    player.stats.spells.push(spell);    
    world.script._startSequence();
    for (let msg of msgs)
        world.script._say(msg, playerSpeaker, player);
    world.script._say("Изучено новое заклинание", systemMessageSpeaker, player);
    for (let n = 0; n < 8; n++) {
        world.script._do(() => {
            world.animations.add(new HealingEffect(), {x: player.x + Math.random() * 6 - 3, y: player.y + Math.random() * 6 - 3});
        });
        world.script._wait(0.15);
    }
    world.script._finishSequence();
}
