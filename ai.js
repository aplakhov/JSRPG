"use strict";

// every AI type has two handlers: nextTurn(aiOwner, forced) and onApplyDamage(aiOwner, dmgAmount, source)

function getAIprop(from, stats, to, name) {
    to[name] = getProp(from.initialObj, name);
    if (!to[name])
        to[name] = stats[name];
}

function getMobEnemies(world, faction) {
    // this may be slow (quadratic) if there's a map with many objects
    // for now we'll ignore it -- no massive battles right now anyways
    let enemyFaction;
    let res;
    if (faction == 0) { // standard enemies
        enemyFaction = 1;
        res = [player];
    } else if (faction == 1) { // player's allies
        enemyFaction = 0;
        res = [];
    } else if (faction == 2) { // true neutrals
        return [];
    } else {
        console.error("Unknown faction", faction);
        return [];
    }
    for (let obj of world.objects) {
        if (obj.ai && obj.ai.faction == enemyFaction && !obj.dead)
            res.push(obj);
    }
    return res;
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
        getAIprop(me, stats, this, "faction");
        if (!this.faction)
            this.faction = 0;
        this.guardArea = getProp(me.initialObj, "guardArea");
    }

    nextTurn(me, forced) {
        let enemies = getMobEnemies(world, this.faction);
        me.attackTarget = null;
        for (let enemy of enemies) {
            if (!this.aggred) {
                if (dist2obj(me, enemy) <= this.aggroRadius * this.aggroRadius) {
                    this._aggro(me);
                } else if (this.guardArea) {
                    const guardZone = world.scriptObjects[this.guardArea];
                    if (guardZone && guardZone.isInside(enemy))
                        this._aggro(me);
                }
            }
            if (this.stats.attackRadius) {
                let attacking = attackIfNear(me, enemy, null);
                if (attacking) {
                    me.attackTarget = enemy;
                    return;
                }
            }
        }
        this._move(me, enemies, forced);
    }

    onApplyDamage(me, dmg, source) {
        if (!this.aggred)
            this._aggro(me);
    }

    _aggro(me) {
        this.aggred = true;
        if ('aggroMessages' in this.stats && 'speaker' in this.stats)
            ui.dialogUI.addRandomNoRepeatMessage(this.stats.aggroMessages, this.stats.speaker, me)
    }

    _move(me, enemies, forced) {
        if (forced && !this.aggred)
            return;
        if (this.stats && this.stats.movement == "land_mob") {
            if (this.aggred && enemies.length > 0)
                this._moveTowardsEnemy(me, enemies);
            else if (this.patrolPath)
                this._followPatrolPath(me);
            else
                this._moveRandomlyInsideRoamingArea(me);
        }
    }

    _followPatrolPath(me) {
        if (!this.patrolPathNextPoint)
            this.patrolPathNextPoint = 0;
        const patrolPt = this.patrolPath[this.patrolPathNextPoint]; 
        let [nextx, nexty] = world.pathfinding.findPath(me, me.x, me.y, patrolPt[0], patrolPt[1]);
        if (world.pathfinding.isPassable(nextx, nexty, me)) {
            me.x = nextx;
            me.y = nexty;
        } else
            console.error("Pathfinding failed and returned impassable point");
        if (me.x == patrolPt[0] && me.y == patrolPt[1]) {
            if (this.reversePath && this.patrolPathNextPoint == 0)
                this.reversePath = false;
            if (!this.reversePath && this.patrolPathNextPoint + 1 == this.patrolPath.length)
                this.reversePath = true;
            if (this.reversePath)
                this.patrolPathNextPoint--;
            else
                this.patrolPathNextPoint++;
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
        if (!world.pathfinding.isPassable(nextx, nexty, me))
            return;
        const prevDist2 = dist2(me.x, me.y, this.startingX, this.startingY);
        const nextDist2 = dist2(nextx, nexty, this.startingX, this.startingY);
        if (nextDist2 <= this.roamRadius * this.roamRadius || nextDist2 <= prevDist2) {
            me.x = nextx;
            me.y = nexty;
        }
    }

    _moveTowardsEnemy(me, enemies) {
        // select nearest enemy
        let enemy = enemies[0];
        let bestDist2 = dist2(enemy.x, enemy.y, me.x, me.y);
        for (let n = 1; n < enemies.length; n++) {
            let e = enemies[n];
            let dist2enemy = dist2(e.x, e.y, me.x, me.y);
            if (dist2enemy < bestDist2) {
                bestDist2 = dist2enemy;
                enemy = e;
            }
        }
        // find where we want to move
        let nextx = me.x, nexty = me.y;
        if (this.stupidPathfinding) {
            if (enemy.x < me.x)
                nextx -= 1;
            else if (enemy.x > me.x)
                nextx += 1;
            if (enemy.y < me.y)
                nexty -= 1;
            else if (enemy.y > me.y)
                nexty += 1;
        } else {
            [nextx, nexty] = world.pathfinding.findPath(me, me.x, me.y, enemy.x, enemy.y);
        }
        // check if we're too far from our origin
        if (this.maxChaseRadius) {
            let canChase = dist2(nextx, nexty, this.startingX, this.startingY) <= this.stats.maxChaseRadius * this.stats.maxChaseRadius;
            if (!canChase) {
                this._moveRandomlyInsideRoamingArea(me);
                return;
            }
        }
        // execute movement
        if (this.stupidPathfinding) {
            const dx = Math.abs(me.x - enemy.x);
            const dy = Math.abs(me.y - enemy.y);
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
