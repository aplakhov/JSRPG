class PlayerVision {
    constructor(darknessAreas, world) {
        this.visibilityRadius = []
        this.visibleTiles = []
        this.turnNumber = 0;
        for (let x = 0; x < world.width; x++) {
            let row = [];
            let zeroRow = [];
            for (let y = 0; y < world.height; y++) {
                let radius = 100;
                for (let n = 0; n < darknessAreas.length; n++) {
                    let area = darknessAreas[n];
                    if (x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height)
                        radius = area.radius;
                }
                row.push(radius);
                zeroRow.push(0);
            }
            this.visibilityRadius.push(row);
            this.visibleTiles.push(zeroRow)
        }
        for (let n = 0; n < 6; n++) {
            for (let x = 1; x + 1 < world.width; x++) {
                for (let y = 1; y + 1 < world.height; y++) {
                    if (this.visibilityRadius[x][y] >= 8 || !world.pathfinding.isPassable(x, y, null))
                        continue;
                    this._fixVisibility(x, y, -1, 0, world);
                    this._fixVisibility(x, y, 1, 0, world);
                    this._fixVisibility(x, y, 0, -1, world);
                    this._fixVisibility(x, y, 0, 1, world);
                }
            }
        }    
    }

    _fixVisibility(x, y, dx, dy, world) {
        if (this.visibilityRadius[x][y] < this.visibilityRadius[x + dx][y + dy] - 1
            && world.pathfinding.isPassable(x + dx, y + dy, this))
                this.visibilityRadius[x][y]++;
    }

    _collectNearbyLightSources() {
        this.additionalLight = [];
        for (let obj of world.objects) {
            if (!obj.additionalLight)
                continue;
            if (obj.x < player.x - 10 || obj.x > player.x + 10 || obj.y < player.y - 10 || obj.y > player.y + 10)
                continue;
            this.additionalLight.push(obj);
        }
    }

    everythingVisible() {
        return this.visibilityRadius[player.x][player.y] > 10;
    }

    recalculateLocalVisibility() {
        if (this.everythingVisible())
            return;
        this._collectNearbyLightSources();
        this.turnNumber++;
        let queue = [];
        this.visibleTiles[player.x][player.y] = this.turnNumber;
        queue.push({x: player.x, y: player.y});
        for (let n = 0; n < queue.length; n++) {
            let pos = queue[n];
            if (pos.x <= player.x && pos.x > 0)
                this._addVisibleTile(pos.x - 1, pos.y, queue);
            if (pos.x >= player.x && pos.x + 1 < world.width)
                this._addVisibleTile(pos.x + 1, pos.y, queue);
            if (pos.y <= player.y && pos.y > 0)
                this._addVisibleTile(pos.x, pos.y - 1, queue);
            if (pos.y >= player.y && pos.y + 1 < world.height)
                this._addVisibleTile(pos.x, pos.y + 1, queue);
        }
    }

    _addVisibleTile(x, y, queue) {
        if (this.visibleTiles[x][y] == this.turnNumber)
            return;
        let dist2 = (x-player.x)*(x-player.x) + (y-player.y)*(y-player.y);
        let additionalLightStrength = 0;
        for (let o of this.additionalLight) {
            let r2 = (x - o.x)*(x - o.x) + (y - o.y)*(y - o.y);
            if (r2 > o.additionalLight*o.additionalLight)
                continue;
            let light = o.additionalLight - Math.floor(Math.sqrt(r2));
            if (additionalLightStrength < light)
                additionalLightStrength = light;
        }
        let r = this.visibilityRadius[player.x][player.y] + additionalLightStrength;
        if (this.temporaryAdditionalLight)
            r += this.temporaryAdditionalLight;
        if (dist2 > r*r)
            return;
        this.visibleTiles[x][y] = this.turnNumber;
        if (!world.isOccluded(x, y))
            queue.push({x: x, y: y});
    }
 
    isVisible(x, y) {
        return this.everythingVisible() || this.visibleTiles[x][y] == this.turnNumber;
    }

    _isNeverVisible(x, y) {
        if (x < 0 || x >= world.width)
            return false;
        if (y < 0 || y >= world.height)
            return false;
        if (!world.isOccluded(x, y))
            return false;
        if (x > 0 && !world.isOccluded(x-1, y))
            return false;
        if (y > 0 && !world.isOccluded(x, y-1))
            return false;
        if (x+1 < world.width && !world.isOccluded(x+1, y))
            return false;
        if (y+1 < world.height && !world.isOccluded(x, y+1))
            return false;
        return true;
    }

    isVisibleSafe(x, y) {
        if (this.everythingVisible())
            return !this._isNeverVisible(x, y);
        if (x < 0 || x >= world.height)
            return false;
        if (y < 0 || y >= world.height)
            return false;
        return this.visibleTiles[x][y] == this.turnNumber;
    }
}