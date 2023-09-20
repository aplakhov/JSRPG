class Pathfinding {
    constructor(world) {
        this.occupied = [];
        this.epoch = [];
        this.dijkstra = [];
        this.width = world.width;
        this.height = world.height;
        this.terrain = world.terrain;
        for (let x = 0; x < this.width; x++) {
            let emptyRow = [];
            let epochRow = [];
            let dijkstraRow = [];
            for (let y = 0; y < this.height; y++) {
                emptyRow.push(null);
                epochRow.push(0);
                dijkstraRow.push(0);
            }
            this.occupied.push(emptyRow);
            this.epoch.push(epochRow);
            this.dijkstra.push(dijkstraRow);
        }
        this.currentEpoch = 0;
        this.dijkstraEpoch = 0;
    }

    findPath(who, fromX, fromY, toX, toY) {
        this.dijkstraEpoch++;
        let d = this.dijkstra;
        // fill all possible moves
        let queue = [];
        d[fromX][fromY] = this.dijkstraEpoch << 4;
        queue.push({x: fromX, y: fromY});
        let reachedDestination = false;
        for (let n = 0; n < queue.length && n < 41; n++) {
            let pos = queue[n];
            let step = (d[pos.x][pos.y] & 15) + 1;
            if (pos.x > 0)
                this._visitNextPos(who, pos.x - 1, pos.y, step, queue);
            if (pos.x + 1 < this.width)
                this._visitNextPos(who, pos.x + 1, pos.y, step, queue);
            if (pos.y > 0)
                this._visitNextPos(who, pos.x, pos.y - 1, step, queue);
            if (pos.y + 1 < this.height)
                this._visitNextPos(who, pos.x, pos.y + 1, step, queue);
            // early stop    
            if (this.dijkstra[toX][toY] >> 4 == this.dijkstraEpoch) {
                reachedDestination = true;
                break;
            }
        }
        // find nearest point to destination
        let finalX, finalY;
        if (reachedDestination) {
            finalX = toX;
            finalY = toY;
        } else {
            let bestQuality = 10000;
            for (let x = fromX - 4; x <= fromX + 4; x++) {
                if (x < 0 || x >= this.width)
                    continue;
                for (let y = fromY - 4; y <= fromY + 4; y++) {
                    if (y < 0 || y >= this.height)
                        continue;
                    if (d[x][y] >> 4 != this.dijkstraEpoch)
                        continue;
                    const distFromStart = d[x][y] & 15;
                    const dist2fromFinish = dist2(toX, toY, x, y);
                    const quality = distFromStart + dist2fromFinish * 10;
                    if (quality < bestQuality) {
                        bestQuality = quality;
                        finalX = x;
                        finalY = y;
                    }
                }
            }
        }
        // backtrack starting from finalX, finalY
        let step = d[finalX][finalY] & 15;
        const offset = this.dijkstraEpoch << 4;
        while (step > 1) {
            if (finalX > 0 && d[finalX - 1][finalY] == offset + step - 1) {
                finalX -= 1;
            } else if (finalY > 0 && d[finalX][finalY - 1] == offset + step - 1) {
                finalY -= 1;
            } else if (finalX + 1 < this.width && d[finalX + 1][finalY] == offset + step - 1) {
                finalX += 1;
            } else if (finalY + 1 < this.height && d[finalX][finalY + 1] == offset + step - 1) {
                finalY += 1;
            } else {
                console.error("Pathfinding did something bad");
                break;
            }
            step -= 1;
        }
        return [finalX, finalY];
    }

    _visitNextPos(who, x, y, step, queue) {
        if (this.dijkstra[x][y] >> 4 == this.dijkstraEpoch)
            return;
        if (!this.isPassable(x, y, who))
            return;
        this.dijkstra[x][y] = (this.dijkstraEpoch << 4) + step;
        queue.push({x: x, y: y});
    }

    recalculateOccupiedTiles(objects) {
        this.currentEpoch++;
        this.occupyTile(player, player.x, player.y);
        for (let n = 0; n < objects.length; n++) {
            let obj = objects[n]
            if ('occupy' in obj)
                obj.occupy(this);
        }
    }

    occupyTile(obj, x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.occupied[x][y] = obj;
            this.epoch[x][y] = this.currentEpoch;
        }
    }

    isOccupied(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return null;
        if (this.epoch[x][y] != this.currentEpoch)
            return null;
        return this.occupied[x][y];
    }

    isPassableTerrain(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return false;
        let tile = this.terrain[x][y];
        return tile != TERRAIN_WATER && tile != TERRAIN_DARK_FOREST && tile != TERRAIN_STONE_WALL;
    }

    isPassable(x, y, who) {
        if (!this.isPassableTerrain(x, y))
            return false;
        let occupies = this.isOccupied(x,y);
        return !occupies || occupies == who;
    }
    
    isPassableForFish(x, y, who) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return false;
        let occupies = this.isOccupied(x,y);
        if (occupies && occupies != who)
            return false;
        let tile = this.terrain[x][y];
        return tile == TERRAIN_WATER;
    }
    
}
