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
                this.roamRadius = stats.roamRadius;
                this.aggroRadius = stats.aggroRadius;
                this.startingX = x;
                this.startingY = y;
                this.maxChaseRadius = stats.maxChaseRadius;
                // animations/drawing:
                this.img = images.prepare(stats.normalImage);
                this.rotatedDrawing = stats.rotatedDrawing;
                this.numAnimFrames = stats.numAnimFrames;
            }
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
            this.drawHumanoidAnimation(ctx, img, x, y, pixelX, pixelY);
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
        if (this.attacking || this.aggred)
            dx = player.x * tileSize - pixelX;
        else
            dx = this.pixelX.target - pixelX;
        if (dx > 0)
            this.frameX = 0;
        else if (dx < 0)
            this.frameX = 1;
        let frameY;
        if (this.attacking) {
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

    drawHumanoidAnimation(ctx, img, x, y, pixelX, pixelY) {
        const walkingFrameCount = img.height / 32 - 1;
        let frameY = 0;
        let dx, dy;
        if (this.attacking) {
            dx = player.x * tileSize - pixelX;
            dy = player.y * tileSize - pixelY;
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
        if (this.attacking) {
            const halfSecondPart = 2 * globalTimer - Math.floor(2 * globalTimer);
            if (halfSecondPart < 0.5)
                frameY = 0;
            else
                frameY = walkingFrameCount;
        }
        images.draw(ctx, this.img, this.frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);
    }

    occupy(pathfinding) {
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
        } else {
            this.die();
        }
    }

    applyHealing(amount) {
        if (this.stats) {
            this.hp += amount;
            if (this.hp > this.stats.hp)
                this.hp = this.stats.hp;
            this.aggred = false;
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
        return this.stats && this.stats.enemy && !this.dead;
    }

    nextTurn(forced) {
        if (this.dead)
            return;
        let canMove = true;
        if (this.stats) {
            if (this.hp < this.stats.hp)
                this.hp++;
            if (this.hp > this.stats.hp)
                this.hp = this.stats.hp;
            if (this.stats.enemy) {
                this.checkAggro();
                if (this.stats.attackRadius) {
                    this.attacking = attackIfNear(this, player, null);
                    if (this.attacking) {
                        this.rotation = Math.atan2(player.x - this.x, player.y - this.y);
                        canMove = false;
                    }
                }
            }
        }
        if (canMove) {
            this.move(forced);
            this.occupy(world.pathfinding);
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
    }

    aggro() {
        this.aggred = true;
        if ('aggroMessages' in this.stats && 'speaker' in this.stats) {
            let msg = randomNoRepeatFrom(this.stats.aggroMessages);
            let speaker = {
                color: this.stats.speaker.color,
                bgColor: this.stats.speaker.bgColor,
                font: this.stats.speaker.font,
                portrait: images.prepare(randomNoRepeatFrom(this.stats.speaker.portraits))
            };
            if (msg && speaker.portrait)
                ui.dialogUI.addMessage(msg, speaker, this);
        }
    }

    checkAggro() {
        if (!this.aggred && dist2obj(this, player) <= this.aggroRadius * this.aggroRadius)
            this.aggro();
    }

    moveRandomlyInsideRoamingArea() {
        let nextx = this.x,
            nexty = this.y;
        let r = Math.random();
        if (r < 0.25)
            nextx += 1;
        else if (r < 0.5)
            nextx -= 1;
        else if (r < 0.75)
            nexty += 1;
        else
            nexty -= 1;
        let insideRoaming = dist2(nextx, nexty, this.startingX, this.startingY) <= this.roamRadius * this.roamRadius;
        if (world.pathfinding.isPassable(nextx, nexty, this) && insideRoaming) {
            this.x = nextx;
            this.y = nexty;
        }
    }

    moveTowardsPlayer() {
        let dx = Math.abs(this.x - player.x);
        let dy = Math.abs(this.y - player.y);
        let nextx = this.x,
            nexty = this.y;
        if (player.x < this.x)
            nextx -= 1;
        else if (player.x > this.x)
            nextx += 1;
        if (player.y < this.y)
            nexty -= 1;
        else if (player.y > this.y)
            nexty += 1;
        
        if (this.maxChaseRadius) {
            let canChase = dist2(nextx, nexty, this.startingX, this.startingY) <= this.stats.maxChaseRadius * this.stats.maxChaseRadius;
            if (!canChase) {
                this.moveRandomlyInsideRoamingArea();
                return;
            }
        }

        if (dx > dy) {
            if (world.pathfinding.isPassable(nextx, this.y, this))
                this.x = nextx;
            else if (world.pathfinding.isPassable(this.x, nexty, this))
                this.y = nexty;
        } else {
            if (world.pathfinding.isPassable(this.x, nexty, this))
                this.y = nexty;
            else if (world.pathfinding.isPassable(nextx, this.y, this))
                this.x = nextx;
        }
    }

    move(forced) {
        if (forced && !this.aggred)
            return;
        if (this.stunnedUntil && this.stunnedUntil > globalTimer)
            return;
        let stats = this.stats;
        if (stats && stats.movement == "land_mob") {
            if (world.pathfinding.isPassable(this.x, this.y, this)) {
                if (this.aggred)
                    this.moveTowardsPlayer();
                else
                    this.moveRandomlyInsideRoamingArea();
            } else {
                this.die();
            }
        }
        if (this.rules == "fish") {
            if (world.pathfinding.isPassableForFish(this.x, this.y, this)) {
                let dx = 0,
                    dy = 0;
                let r = Math.random();
                if (r < 0.25)
                    dx = 1;
                else if (r < 0.5)
                    dx = -1;
                else if (r < 0.75)
                    dy = 1;
                else
                    dy = -1;
                if (world.pathfinding.isPassableForFish(this.x + dx, this.y + dy, this)) {
                    this.x += dx;
                    this.y += dy;
                }
            } else {
                this.die();
            }
        }
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
