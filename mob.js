"use strict";

class Mob {
    constructor(obj, x, y) {
        this.initialObj = obj;
        this.hint = obj.name;
        this.x = x;
        this.y = y;
        this.pixelX = new SmoothlyChangingNumber(x * tileSize);
        this.pixelY = new SmoothlyChangingNumber(y * tileSize);
        this.zLayer = 1;
        this.rotation = 0;
        this.frameX = 0;

        this.rules = getProp(obj, "Rules");
        if (this.rules) {
            let stats = creatures[this.rules];
            if (stats) {
                this.stats = stats;
                // gameplay:
                this.hp = stats.hp;
                this.ai = new AIStupidLandMob(this, stats);
                if (stats.additionalLight)
                    this.additionalLight = stats.additionalLight;
                // animations/drawing:
                this.img = images.prepare(stats.normalImage);
                this.rotatedDrawing = stats.rotatedDrawing;
                this.numAnimFrames = stats.numAnimFrames;
            }
            if (this.rules == "fish")
                this.ai = new AIFish(this);
        }
        const animImg = getProp(obj, "Image")
        if (animImg) {
            this.img = images.prepare("Animations/" + animImg);
            if (animImg == "duck")
                this.rotatedDrawing = 1;
        }
        if (!this.numAnimFrames)
            this.numAnimFrames = 1;
    }

    draw(ctx, x, y) {
        if (this.dead || !this.img)
            return;
        const img = images.getReadyImage(this.img);
        if (!img)
            return;
        const pixelX = this.pixelX.get(), pixelY = this.pixelY.get();
        x += pixelX - this.x * tileSize;
        y += pixelY - this.y * tileSize;
        if (this.rotatedDrawing) {
            if (this.numAnimFrames > 1) {
                const animFramesPerSecond = 8; // TODO - need to be evaluated from displacement, not time
                const frame = Math.floor(globalTimer * animFramesPerSecond) % this.numAnimFrames;
                const frameW = img.width, frameH = img.height / this.numAnimFrames;
                images.drawRotatedPart(ctx, this.img, Math.PI - this.rotation, 
                    0, frame * frameH, frameW, frameH,
                    x + halfTileSize, y + halfTileSize, frameW, frameH);
            } else
                images.drawRotated(ctx, this.img, Math.PI - this.rotation, x + halfTileSize, y + halfTileSize);
        } else if (this.stats && this.stats.humanoidDrawing) {
            let displacementY = 0;
            if (this.stats.imageDisplacementY)
                displacementY = this.stats.imageDisplacementY;
            this.drawHumanoidAnimation(ctx, img, x, y, pixelX, pixelY,  displacementY);
        } else if (this.stats && this.stats.twoSidedDrawing) {
            this.drawTwoSidedAnimation(ctx, img, x, y, pixelX, pixelY);
        } else {
            images.draw(ctx, this.img, x, y);
        }
        let hpBarY = y;
        if (this.stats && this.stats.hpBarY)
            hpBarY += this.stats.hpBarY;
        if (this.stats && this.hp < this.stats.hp)
            drawHPbar(ctx, this.hp, this.stats.hp, x, hpBarY)
    }

    drawTwoSidedAnimation(ctx, img, x, y, pixelX, pixelY) {
        const walkingFrameCount = img.height / 32 - 1;
        let dx;
        if (this.attackTarget || this.aggred)
            dx = this.attackTarget.x * tileSize - pixelX;
        else
            dx = this.pixelX.target - pixelX;
        if (dx > 0)
            this.frameX = 0;
        else if (dx < 0)
            this.frameX = 1;
        let frameY;
        if (this.attackTarget) {
            const halfSecondPart = 2 * globalTimer - Math.floor(2 * globalTimer);
            if (halfSecondPart < 0.5)
                frameY = 0;
            else
                frameY = walkingFrameCount;
        } else {
            dx = this.pixelX.target - pixelX;
            if (dx)
                frameY = Math.floor((pixelX % 64)/8) % walkingFrameCount;
            else
                frameY = Math.floor((pixelY % 64)/8) % walkingFrameCount;
        }
        images.draw(ctx, this.img, this.frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);
    }

    drawHumanoidAnimation(ctx, img, x, y, pixelX, pixelY, displacementY) {
        const walkingFrameCount = Math.floor(img.height / 32) - 1;
        let frameY = 0;
        let dx, dy;
        if (this.attackTarget) {
            dx = this.attackTarget.x * tileSize - pixelX;
            dy = this.attackTarget.y * tileSize - pixelY;
        } else {
            dx = this.pixelX.target - pixelX;
            dy = this.pixelY.target - pixelY;
        }
        if (dy < 0 && -dy > dx && -dy > -dx) {
            // up
            this.frameX = 1;
            frameY = Math.floor((pixelY % 64)/8) % walkingFrameCount;
        } else if (dy > 0 && dy > dx && dy > -dx) {
            // down
            this.frameX = 0;
            frameY = Math.floor((pixelY % 64)/8) % walkingFrameCount;
        } else if (dx > 0) {
            // right
            this.frameX = 2;
            frameY = Math.floor((pixelX % 64)/8) % walkingFrameCount;
        } else if (dx < 0) {
            // left
            this.frameX = 3;
            frameY = Math.floor((pixelX % 64)/8) % walkingFrameCount;
        }
        if (this.attackTarget) {
            const halfSecondPart = 2 * globalTimer - Math.floor(2 * globalTimer);
            if (halfSecondPart < 0.5)
                frameY = 0;
            else
                frameY = walkingFrameCount;
        }
        images.draw(ctx, this.img, this.frameX * 32, frameY * 32, 32, 32, x, y + displacementY, 32, 32);
    }

    occupy(pathfinding) {
        if (this.x == player.x && this.y == player.y)
            console.error("Somehow on one square with player");
        pathfinding.occupyTile(this, this.x, this.y);
    }

    applyDamage(dmg, source) {
        if (this.stats && this.stats.vulnerable) {
            let vulnerabilityMessage = this.stats.vulnerabilityMessage[source];
            if (!vulnerabilityMessage)
                vulnerabilityMessage = this.stats.vulnerabilityMessage[""];
            ui.dialogUI.addMessage(vulnerabilityMessage, playerSpeaker, player);
            if (this.stats.vulnerable != source)
                return;
        }
        if (this.hp) {
            this.hp -= dmg;
            if (this.hp <= 0)
                this.die();
            else
                this.ai.onApplyDamage(this, dmg, source);
        } else {
            this.die();
        }
    }

    applyHealing(amount) {
        if (this.stats) {
            this.hp += amount;
            if (this.hp > this.stats.hp)
                this.hp = this.stats.hp;
        }
    }

    die() {
        this.dead = true;
        ui.dialogUI.addMessage(getProp(this.initialObj, "DeathComment"), playerSpeaker, player)
        let loot = getProp(this.initialObj, "Loot");
        if (loot == "ManaBottle")
            world.objects.push(new ManaBottle(this.x, this.y));
        else {
            let bonesImg = "bones";
            if (this.stats.bonesImg)
                bonesImg = this.stats.bonesImg;
            let corpseAngle = 0;
            if (this.rotatedDrawing)
                corpseAngle = Math.PI - this.rotation + 0.001;
            world.objects.push(new DecorativeObject({
                class: "Bones",
                name: "Останки"
            }, this.x, this.y, images.prepare(bonesImg), corpseAngle))
        }
    }

    isEnemy() {
        return this.ai && this.ai.faction == 0;
    }

    nextTurn(forced) {
        if (this.dead)
            return;
        if (!this.isInPassablePosition()) {
            this.die();
            return;
        }
        if (this.stunnedUntil && this.stunnedUntil > globalTimer)
            return;
        if (this.ai)
            this.ai.nextTurn(this, forced);
        this.occupy(world.pathfinding);
        if (!this.attackTarget && this.stats && this.hp < this.stats.hp)
            this.hp += 1;
        if (this.attackTarget)
            this.rotation = Math.atan2(this.attackTarget.x - this.x, this.attackTarget.y - this.y);
        let currentPixelX = this.pixelX.get();
        let currentPixelY = this.pixelY.get();
        let nextPixelX = this.x * tileSize;
        let nextPixelY = this.y * tileSize;
        if (nextPixelX != currentPixelX || nextPixelY != currentPixelY) {
            this.rotation = Math.atan2(nextPixelX - currentPixelX, nextPixelY - currentPixelY);
            this.pixelX.set(nextPixelX, 1);
            this.pixelY.set(nextPixelY, 1);
        }
    }

    isInPassablePosition() {
        if (this.stats && this.stats.movement == "land_mob")
            return world.pathfinding.isPassable(this.x, this.y, this);
        if (this.rules == "fish")
            return world.pathfinding.isPassableForFish(this.x, this.y, this);
        console.error("Unknown mob movement rules", this);
        return true;
    }

    stun(seconds) {
        if (!this.stunnedUntil || this.stunnedUntil < globalTimer + seconds)
            this.stunnedUntil = globalTimer + seconds;
    }

    say(text) {
        if (this.stats && this.stats.speaker && this.stats.speaker.portraits) {
            const speaker = {
                color: this.stats.speaker.color,
                bgColor: this.stats.speaker.bgColor,
                font: this.stats.speaker.font,
                portrait: this.stats.speaker.portraits[0]
            }
            ui.dialogUI.addMessage(text, speaker, this);
        } else {
            ui.dialogUI.addMessage(text, systemMessageSpeaker, this);
        }
    }
}
