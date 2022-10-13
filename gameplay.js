"use strict";

class World {
  constructor() {
    this.width = 100;
    this.height = 100;
    this.terrain = [];
    this.objects = [];
    for (let x = 0; x < this.width; x++) {
      let row = []
      for (let y = 0; y < this.height; y++) {
        row.push(tileAt(x, y))
      }
      this.terrain.push(row)
    }
    this.objects.push(new ManaBottle(2,2))
    this.objects.push(new Coin(5,18))
  }
};

class ManaBottle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  onContact(player) {
    player.maxMana++;
    this.dead = true;
  }
  img() {
    return manaImage;
  }
};

class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  onContact(player) {
    this.dead = true;
  }
  img() {
    return coinImage;
  }
};

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.maxMana = 0;
    this.mana = 0;
  }

  tryMove(dx, dy) {
    const newx = clamp(this.x + dx, 0, world.width - 1);
    const newy = clamp(this.y + dy, 0, world.height - 1);
    const tile = world.terrain[newx][newy];
    if (tile == 1)
      return false;
    this.x = newx;
    this.y = newy;
    let wereDead = false;
    world.objects.forEach((obj, index, array) => {
      if (obj.x == this.x && obj.y == this.y)
        obj.onContact(this)
      if (obj.dead)
        wereDead = true
    });
    if (wereDead) {
      world.objects = world.objects.filter(obj => !obj.hasOwnProperty("dead"));
    }
    return true;
  }
};
