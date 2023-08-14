class Pathfinding {
    constructor(world) {
        this.occupied = [];
        this.epoch = [];
        this.width = world.width;
        this.height = world.height;
        this.terrain = world.terrain;
        for (let x = 0; x < this.width; x++) {
          let emptyRow = [];
          let epochRow = [];
          for (let y = 0; y < this.height; y++) {
            emptyRow.push(null);
            epochRow.push(0);
          }
          this.occupied.push(emptyRow);
          this.epoch.push(epochRow);
        }
        this.currentEpoch = 0;
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
        this.occupied[x][y] = obj;
        this.epoch[x][y] = this.currentEpoch;
    }

    isOccupied(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return null;
        if (this.epoch[x][y] != this.currentEpoch)
            return null;
        return this.occupied[x][y];
    }

    isPassable(x, y, who) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return false;
        let occupies = this.isOccupied(x,y);
        if (occupies && occupies != who)
            return false;
        let tile = this.terrain[x][y];
        return tile != TERRAIN_WATER && tile != TERRAIN_DARK_FOREST && tile != TERRAIN_STONE_WALL;
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
