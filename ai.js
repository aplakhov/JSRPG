"use strict";

// every AI type has two handlers: nextTurn(aiOwner, forced) and onApplyDamage(aiOwner, dmgAmount, source)

function getAIprop(from, stats, to, name) {
    to[name] = getProp(from.initialObj, name);
    if (!to[name])
        to[name] = stats[name];
}

class AIStupidLandMob {
    constructor(me, stats) {
        this.stats = stats;
        this.startingX = me.x;
        this.startingY = me.y;
        getAIprop(me, stats, this, "roamRadius");
        getAIprop(me, stats, this, "aggroRadius");
        getAIprop(me, stats, this, "maxChaseRadius");
        getAIprop(me, stats, this, "stupidPathfinding");
        this.guardArea = getProp(me.initialObj, "guardArea");
    }

    nextTurn(me, forced) {
        if (this.stats.enemy) {
            if (!this.aggred) {
                if (dist2obj(me, player) <= this.aggroRadius * this.aggroRadius) {
                    this._aggro(me);
                } else if (this.guardArea) {
                    const guardZone = world.scriptObjects[this.guardArea];
                    if (guardZone && guardZone.isPlayerInside())
                        this._aggro(me);
                }
            }
            if (this.stats.attackRadius) {
                me.attacking = attackIfNear(me, player, null);
                if (me.attacking)
                    return;
            }
        }
        this._move(me, forced);
    }

    onApplyDamage(me, dmg, source) {
        if (!this.aggred)
            this._aggro(me);
    }

    _aggro(me) {
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
                ui.dialogUI.addMessage(msg, speaker, me);
        }
    }

    _move(me, forced) {
        if (forced && !this.aggred)
            return;
        if (this.stats && this.stats.movement == "land_mob") {
            if (this.aggred)
                this._moveTowardsPlayer(me);
            else
                this._moveRandomlyInsideRoamingArea(me);
        }
    }

    _moveRandomlyInsideRoamingArea(me) {
        let nextx = me.x, nexty = me.y;
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
        if (world.pathfinding.isPassable(nextx, nexty, me) && insideRoaming) {
            me.x = nextx;
            me.y = nexty;
        }
    }

    _moveTowardsPlayer(me) {
        let nextx = me.x, nexty = me.y;
        if (this.stupidPathfinding) {
            if (player.x < me.x)
                nextx -= 1;
            else if (player.x > me.x)
                nextx += 1;
            if (player.y < me.y)
                nexty -= 1;
            else if (player.y > me.y)
                nexty += 1;
        } else {
            [nextx, nexty] = world.pathfinding.findPath(me, me.x, me.y, player.x, player.y);
        }
        
        if (this.maxChaseRadius) {
            let canChase = dist2(nextx, nexty, this.startingX, this.startingY) <= this.stats.maxChaseRadius * this.stats.maxChaseRadius;
            if (!canChase) {
                this._moveRandomlyInsideRoamingArea(me);
                return;
            }
        }

        if (this.stupidPathfinding) {
            const dx = Math.abs(me.x - player.x);
            const dy = Math.abs(me.y - player.y);
            if (dx > dy) {
                if (world.pathfinding.isPassable(nextx, me.y, me))
                    me.x = nextx;
                else if (world.pathfinding.isPassable(me.x, nexty, me))
                    me.y = nexty;
            } else {
                if (world.pathfinding.isPassable(me.x, nexty, me))
                    me.y = nexty;
                else if (world.pathfinding.isPassable(nextx, me.y, me))
                    me.x = nextx;
            }
        } else {
            if (world.pathfinding.isPassable(nextx, nexty, me)) {
                me.x = nextx;
                me.y = nexty;
            } else
                console.error("Pathfinding failed and returned impassable point");
        }
    }
}

class AIFish {
    constructor() {
    }
    nextTurn(me, forced) {
        if (forced)
            return;
        let dx = 0, dy = 0;
        let r = Math.random();
        if (r < 0.25)
            dx = 1;
        else if (r < 0.5)
            dx = -1;
        else if (r < 0.75)
            dy = 1;
        else
            dy = -1;
        if (world.pathfinding.isPassableForFish(me.x + dx, me.y + dy, me)) {
            me.x += dx;
            me.y += dy;
        }
    }
    // there's no onApplyDamage in AIFish as fish immediately dies
}
