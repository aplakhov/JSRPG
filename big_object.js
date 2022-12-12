class BigScaryObject {
    constructor(obj, x, y) {
      this.x = x;
      this.y = y;
      this.image = prepareImageFor(obj);
      this.zeroX = getProp(obj, "ZeroX");
      this.zeroY = getProp(obj, "ZeroY");
      this.hint = obj.name;
      this.pixelX = new SmoothlyChangingNumber(this.x * tileSize);
      this.pixelY = new SmoothlyChangingNumber(this.y * tileSize);
      this.rotation = new SmoothlyChangingNumber(0);
      this.visualR = halfViewInTiles; // TODO - can be estimated better
      let occupiedTiles = getProp(obj, "OccupiedTiles");
      if (occupiedTiles)
        this.occupiedTiles = eval(occupiedTiles);
    }
    draw(ctx, x, y) {
      let rotation = this.rotation.get() * Math.PI / 180;
      this.sin = Math.sin(rotation);
      this.cos = Math.cos(rotation);
      if (this.image) {
        x += this.pixelX.get() - this.x * tileSize;
        y += this.pixelY.get() - this.y * tileSize;
        if (rotation) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation);
          images.draw(ctx, this.image, -this.zeroX, -this.zeroY);
          ctx.restore();
        } else {
          images.draw(ctx, this.image, x - this.zeroX, y - this.zeroY);
        }
      }
    }
    isVisible(offset) {
      if (this.x + this.visualR < offset.x)
        return false;
      if (this.y + this.visualR < offset.y)
        return false;
      if (this.x - this.visualR >= offset.x + viewInTiles)
        return false;
      if (this.y - this.visualR >= offset.y + viewInTiles)
        return false;
      return true;
    }
    toWorldX(pixelX, pixelY) {
      return this.pixelX.get() + pixelX * this.cos - pixelY * this.sin;
    }
    toWorldY(pixelX, pixelY) {
      return this.pixelY.get() + pixelX * this.sin + pixelY * this.cos;
    }
    doOccupy(pathfinding, pixelX, pixelY) {
      let worldPixelX = this.toWorldX(pixelX, pixelY);
      let worldPixelY = this.toWorldY(pixelX, pixelY);
      let x = Math.floor(worldPixelX / tileSize);
      let y = Math.floor(worldPixelY / tileSize);
      if (x >= 0 && y >= 0 && x < pathfinding.width && y < pathfinding.height) {
        if (pathfinding.isOccupied(x, y) == player && this.onContact)
          this.onContact(player);
        pathfinding.occupyTile(this, x, y);
      }
    }
    occupy(pathfinding) {
      if (!this.occupiedTiles)
        return;
      for (let dy = 0; dy < this.occupiedTiles.length; dy++) {
        let row = this.occupiedTiles[dy];
        for (let dx = 0; dx < row.length; dx++) {
          if (!row[dx])
            continue;
          let pixelX = dx * tileSize + halfTileSize - this.zeroX;
          let pixelY = dy * tileSize + halfTileSize - this.zeroY;
          this.doOccupy(pathfinding, pixelX, pixelY);
          let leftOccupied = dx + 1 < row.length && row[dx+1];
          let bottomOccupied = dy + 1 < this.occupiedTiles.length && this.occupiedTiles[dy+1][dx];
          if (leftOccupied)
            this.doOccupy(pathfinding, pixelX + halfTileSize, pixelY);
          if (bottomOccupied)
            this.doOccupy(pathfinding, pixelX, pixelY + halfTileSize);
          if (leftOccupied && bottomOccupied && this.occupiedTiles[dy+1][dx+1])
            this.doOccupy(pathfinding, pixelX + halfTileSize, pixelY + halfTileSize);
        }
      }
    }
  };
  