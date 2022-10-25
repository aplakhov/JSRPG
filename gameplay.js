"use strict";

function getProp(obj, name) {
  if ('properties' in obj) {
    let props = obj.properties;
    for (let n = 0; n < props.length; ++n)
      if (props[n].name == name)
        return props[n].value;
  }
  return "";
}

const TERRAIN_GRASS = 0;
const TERRAIN_WATER = 1;
const TERRAIN_SAND = 2;
const TERRAIN_DARK_FOREST = 3;
const TERRAIN_STONE = 4;
const TERRAIN_STONE_WALL = 5;

class World {
  constructor() {
    let map = TileMaps["intro_map"]
    let data = map["layers"][0]["data"]
    this.height = map.height;
    this.width = map.width;
    this.terrain = [];
    this.objects = [];
    this.occupied = [];
    this.darknessAreas = [];
    for (let x = 0; x < this.width; x++) {
      let row = [];
      let emptyRow = [];
      for (let y = 0; y < this.height; y++) {
        let tile = data[x + y * this.width] - 1
        row.push(tile)
        emptyRow.push(null)
      }
      this.terrain.push(row)
      this.occupied.push(emptyRow)
    }
    let objects = map["layers"][1]["objects"];
    let halfTileSize = tileSize / 2;
    for (let n = 0; n < objects.length; n++) {
      let obj = objects[n]
      let x = Math.floor((obj.x + 4) / tileSize);
      let y = Math.floor((obj.y + 4) / tileSize);
      let width = Math.floor((obj.width + halfTileSize) / tileSize);
      let height = Math.floor((obj.height + halfTileSize) / tileSize);
      if (obj.class == "ManaBottle")
        this.objects.push(new ManaBottle(x,y));
      if (obj.class == "Bones")
        this.objects.push(new Bones(obj, x,y));
      if (obj.class == "Mob")
        this.objects.push(new Mob(obj, x,y));
      if (obj.class == "Message") {
        let msg = getProp(obj, "Message");
        if (msg == "")
          msg = obj.name;
        this.objects.push(new Message(msg, x, y, width, height));
      }
      if (obj.class == "Darkness") {
        let radius = Number(getProp(obj, "Radius"));
        if (radius < 4)
          radius = 4;
        this.darknessAreas.push({x: x, y: y, width: width, height: height, radius: radius});
      }
    }
    this.hints = ["Трава", "Вода", "Утоптанная земля", "Дремучий лес", "Камень", "Горные породы"];
  }

  nextTurn() {
    this.objects.forEach((obj) => {
      if ('nextTurn' in obj) {
        let occupiesPlace = 'occupy' in obj;
        if (occupiesPlace)
          obj.occupy(this.occupied, false);
        obj.nextTurn()
        if (occupiesPlace && !obj.dead)
          obj.occupy(this.occupied, true);
      }
    });
    this.removeDeadObjects();
  }

  isPassable(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return false;
    if (this.occupied[x][y])
      return false;
    let tile = this.terrain[x][y];
    return tile != TERRAIN_WATER && tile != TERRAIN_DARK_FOREST && tile != TERRAIN_STONE_WALL;
  }

  isPassableForFish(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return false;
    if (this.occupied[x][y])
      return false;
    let tile = this.terrain[x][y];
    return tile == TERRAIN_WATER;
  }

  getVisionRadius(x, y) {
    for (let n = 0; n < this.darknessAreas.length; n++) {
      let area = this.darknessAreas[n];
      if (x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height) {
        return area.radius;
      }
    }
    return 100;
  }

  hint(x, y) {
    if (x == player.x && y == player.y)
      return "Боб"
    for (let n = 0; n < this.objects.length; ++n) {
      let o = this.objects[n];
      if (x == o.x && y == o.y && o.hint)
        return o.hint
    }
    let tile = this.terrain[x][y];
    return this.hints[tile];
  }

  removeDeadObjects() {
    this.objects = this.objects.filter(obj => !obj.hasOwnProperty("dead"));
  }
};

class ManaBottle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hint = "Бутылочка синей жидкости"
  }
  onContact(player) {
    this.dead = true;
    dialogUI.addMessage("+10 макс.мана", systemMessageSpeaker);
    if (player.maxMana == 0)
      dialogUI.addMessage("На вкус жидкость тоже синяя. Не знаю, как это работает", speaker1);
    player.stats.mana += 10;
    if (player.stats.mana == 50) {
      dialogUI.addMessage("Кажется, пора вспоминать, чему меня учили в университете", speaker1);  
      dialogUI.addMessage('Доступно заклинание "Создать камень"', systemMessageSpeaker);
      dialogUI.addMessage('Кликните мышкой на клетку рядом с собой, чтобы использовать', systemMessageSpeaker);
    }
    player.mana += 3;
  }
  draw(ctx, x, y) {
    if (manaImage.complete)
      ctx.drawImage(manaImage, x, y);
  }
};

class Bones {
  constructor(obj, x, y) {
    this.foundMessage = getProp(obj, "Message");
    this.hint = obj.name;
    this.x = x;
    this.y = y;
  }
  onContact(player) {
    if (this.foundMessage) {
      dialogUI.addMessage(this.foundMessage, speaker1);
      this.foundMessage = null;
    }
  }
  draw(ctx, x, y) {
    if (bonesImage.complete)
      ctx.drawImage(bonesImage, x, y);
  }
};

function attackIfNear(attacker, target) {
  let dx = target.x - attacker.x;
  let dy = target.y - attacker.y;
  let distToTarget2 = dx*dx + dy*dy;
  let r2 = attacker.stats.attackRadius * attacker.stats.attackRadius;
  if (distToTarget2 > r2)
    return false;
  const duration = 0.2
  const direction = { x: dx * tileSize, y: dy * tileSize }
  animations.add(new Bullet(direction, duration), {x:attacker.x, y:attacker.y});
  setTimeout(() => {
    let damage = Math.floor(attacker.stats.attackMin + (attacker.stats.attackMax - attacker.stats.attackMin + 1) * Math.random());
    target.damage(damage);
  }, 200);
  return true;
}

function drawHPbar(ctx, hp, maxHp, x, y) {
  let w = tileSize - 8;
  let w1 = w * hp / maxHp;
  ctx.fillStyle = "rgb(255, 0, 40)";
  ctx.fillRect(x + 4, y + 4, w1, 3);
  ctx.fillStyle = "rgb(255, 150, 190)";
  ctx.fillRect(x + 4 + w1, y + 4, w - w1, 3);
}

class Mob {
  constructor(obj, x, y) {
    this.meObj = obj;
    this.hint = obj.name;
    this.x = x;
    this.y = y;

    this.rules = getProp(obj, "Rules");
    if (this.rules) {
      let stats = rpg[this.rules];
      if (stats) {
        this.hp = stats.hp;
        this.stats = stats;
      }
    }

    let imageName = getProp(obj, "Image");
    if (!imageName.endsWith(".png"))
      imageName += ".png";
    this.img = new Image(); this.img.src = imageName;
  }

  draw(ctx, x, y) {
    if (!this.dead && this.img && this.img.complete)
      ctx.drawImage(this.img, x, y);
    if (this.stats && this.hp < this.stats.hp)
        drawHPbar(ctx, this.hp, this.stats.hp, x, y)
  }

  occupy(occupied, on) {
    occupied[this.x][this.y] = on? this : null;
  }

  damage(dmg) {
    if (this.hp) {
      this.hp -= dmg;
      if (this.hp <= 0)
        this.die();
    } else {
      this.die();
    }
  }

  die() {
    this.dead = true;
    dialogUI.addMessage(getProp(this.meObj, "DeathComment"), speaker1)
    let loot = getProp(this.meObj, "Loot");
    if (loot == "ManaBottle")
      world.objects.push(new ManaBottle(this.x, this.y));
    else
      world.objects.push(new Bones({name: "Останки"}, this.x, this.y))
  }

  isEnemy() {
    return this.stats && this.stats.enemy;
  }

  nextTurn() {
    if (this.dead)
      return;
    let canMove = true;
    if (this.stats) {
      if (this.hp < this.stats.hp)
        this.hp++;
      if (this.hp > this.stats.hp)
        this.hp = this.stats.hp;
      if (this.stats.attackRadius && this.stats.enemy) {
        let attacked = attackIfNear(this, player);
        if (attacked)
          canMove = false;
      }
    }
    if (canMove)
      this.move();
  }

  move() {
    if (this.rules == "goblin") {
      if (world.isPassable(this.x, this.y)) {
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
        if (world.isPassable(this.x + dx, this.y + dy)) {
          this.x += dx;
          this.y += dy;
        }
      } else {
        this.die();
      }
    }
    if (this.rules == "fish") {
      if (world.isPassableForFish(this.x, this.y)) {
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
        if (world.isPassableForFish(this.x + dx, this.y + dy)) {
          this.x += dx;
          this.y += dy;
        }
      } else {
        this.die();
      }
    }
  }
}

class Message {
  constructor(message, x, y, w, h) {
    this.message = message;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  hasContact(x, y) {
    return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
  }
  onContact(player) {
    dialogUI.addMessage(this.message, speaker1);
    this.dead = true;
  }
  draw(ctx, x, y) {
    let drawAI = false;
    if (drawAI) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(x, y, this.w * tileSize, this.h * tileSize);
    }
  }
  
};

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.stats = rpg.player_start;
    this.mana = this.stats.mana;
    this.hp = this.stats.hp;
    this.img = new Image(); this.img.src = "player.png";
  }

  tryMove(dx, dy) {
    const newx = this.x + dx;
    const newy = this.y + dy;
    if (!world.isPassable(newx, newy))
      return false;
    world.occupied[this.x][this.y] = null;
    world.occupied[newx][newy] = this;
    this.x = newx;
    this.y = newy;
    for (let n = 0; n < world.objects.length; n++) {
      let obj = world.objects[n];
      if ('hasContact' in obj && obj.hasContact(this.x, this.y))
        obj.onContact(this)
      else if (obj.x == this.x && obj.y == this.y)
        obj.onContact(this)
    }
    world.removeDeadObjects()
    return true;
  }

  tryCast(targetX, targetY) {
    if (this.maxMana < 50)
      return; // casting is not opened yet
    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let manaToCast = 10;
    if (this.mana < manaToCast) {
      animations.add(new SystemMessage(0.5, "Не хватает маны"), player);
      return;
    }
    if (dx <= 2 && dx >= -2 && dy <= 2 && dy >= -2) { // add test Bullet animation
      const duration = 0.3
      const direction = { x: dx * tileSize, y: dy * tileSize }
      animations.add(new Bullet(direction, duration), this);
      this.mana -= manaToCast;
      setTimeout(() => {
        let tile = world.terrain[targetX][targetY];
        if (tile != TERRAIN_DARK_FOREST && tile != TERRAIN_STONE_WALL)
          world.terrain[targetX][targetY] = TERRAIN_STONE;
      }, 300);
    }  
  }

  draw(ctx, x, y) {
    if (this.img.complete)
      ctx.drawImage(this.img, x, y);
    if (this.inCombat)
      drawHPbar(ctx, this.hp, this.stats.hp, x, y)
  }

  nextTurn() {
    if (this.mana < this.stats.mana)
      this.mana++;
    if (this.mana > this.stats.mana)
      this.mana = this.stats.mana;
    if (this.hp < this.stats.hp) {
      this.hp++;
      if (this.hp >= this.stats.hp)
        dialogUI.forceRedraw(); // force hiding HP bar
    }
    if (this.hp > this.stats.hp)
      this.hp = this.stats.hp;
    this.inCombat = false;
    for (let n = 0; n < world.objects.length; n++) {
      let obj = world.objects[n];
      if ('isEnemy' in obj && obj.isEnemy() && attackIfNear(player, obj)) {
        this.inCombat = true;
        break;
      }
    }
  }

  damage(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 1;
      this.mana = 1;
      animations.add(new FadeToBlack(3, "На самом деле, конечно, всё было не совсем так..."), player)
      setTimeout(() => {
        this.x = 0;
        this.y = 0;
      }, 1000);
    }
  }
};

setInterval( () => {
    world.nextTurn();
    player.nextTurn();
  },
  1000
);
