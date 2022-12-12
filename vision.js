class PlayerVision {
    constructor(darknessAreas, world) {
        this.visibilityRadius = []
        this.additionalLight = []
        this.visibleTiles = []
        this.turnNumber = 0;
        for (let x = 0; x < world.width; x++) {
          let row = [];
          let zeroRow1 = [];
          let zeroRow2 = [];
          for (let y = 0; y < world.height; y++) {
            let radius = 100;
            for (let n = 0; n < darknessAreas.length; n++) {
              let area = darknessAreas[n];
              if (x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height) {
                radius = area.radius;
              }
            }
            row.push(radius);
            zeroRow1.push(0);
            zeroRow2.push(0);
          }
          this.visibilityRadius.push(row);
          this.additionalLight.push(zeroRow1);
          this.visibleTiles.push(zeroRow2)
        }
        for (let n = 0; n < 6; n++) {
          for (let x = 1; x + 1 < world.width; x++) {
            for (let y = 1; y + 1 < world.height; y++) {
              if (this.visibilityRadius[x][y] >= 8 || !world.pathfinding.isPassable(x, y, null))
                continue;
              this.fixVisibility(x, y, -1, 0, world);
              this.fixVisibility(x, y, 1, 0, world);
              this.fixVisibility(x, y, 0, -1, world);
              this.fixVisibility(x, y, 0, 1, world);
            }
          }
        }    
    }

    fixVisibility(x, y, dx, dy, world) {
        if (this.visibilityRadius[x][y] < this.visibilityRadius[x + dx][y + dy] - 1
          && world.pathfinding.isPassable(x + dx, y + dy, this))
            this.visibilityRadius[x][y]++;
    }

    addLightSource(centerX, centerY, strength) {
        for (let x = centerX - strength; x <= centerX + strength; x++) {
          for (let y = centerY - strength; y <= centerY + strength; y++) {
            if (x < 0 || y < 0 || x >= this.additionalLight.length || y >= this.additionalLight[x].length)
              continue;
            let r2 = (x - centerX)*(x - centerX) + (y - centerY)*(y - centerY);
            if (r2 > strength*strength)
              continue;
            let light = strength - Math.floor(Math.sqrt(r2));
            if (this.additionalLight[x][y] < light)
              this.additionalLight[x][y] = light;
          }
        }
    }

    everythingVisible() {
        return this.visibilityRadius[player.x][player.y] > 10;
    }

    recalculateLocalVisibility() {
        if (this.everythingVisible())
            return;
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
        let dist2 = (x-player.x)*(x-player.x) + (y-player.y)*(y-player.y);
        let r = this.visibilityRadius[player.x][player.y] + this.additionalLight[x][y];
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