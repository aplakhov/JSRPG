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

function makeImage(imageName) {
  if (!imageName)
    return null;
  if (!imageName.endsWith(".png"))
    imageName += ".png";
  let image = new Image(); image.src = imageName;
  return image;
}

function randomNoRepeatFrom(array) {
  for (let n = 0; n < 4; n++) {
    let n = Math.floor(Math.random() * array.length);
    if (array[n]) {
      let res = array[n];
      array[n] = null;
      return res;
    }
  }
  return null;
}

let manaImage = makeImage("mana1");
let bonesImage = makeImage("bones");

function makeImageFor(obj) {
  let imageName = getProp(obj, "Image");
  return makeImage(imageName);
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
    let darknessAreas = [];
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
        this.objects.push(new DecorativeObject(obj, x, y, bonesImage));
      if (obj.class == "DecorativeObject") {
        let gameObj = new DecorativeObject(obj, x, y, makeImageFor(obj));
        this.objects.push(gameObj);
        let occupiesPlace = 'occupy' in gameObj;
        if (occupiesPlace)
          gameObj.occupy(this.occupied, true);
      }
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
        darknessAreas.push({x: x, y: y, width: width, height: height, radius: radius});
      }
    }
    this.vision = new PlayerVision(darknessAreas, this);
    for (let n = 0; n < objects.length; n++) {
      let obj = objects[n]
      let x = Math.floor((obj.x + 4) / tileSize);
      let y = Math.floor((obj.y + 4) / tileSize);
      let fireEmitter = getProp(obj, "Fire");
      if (fireEmitter != "") {
        let strength = Number(fireEmitter);
        fire.addConstantEmitter(x, y, strength);
        this.vision.addLightSource(x, y, strength);
      }
    }
    this.hints = ["Трава", "Вода", "Утоптанная земля", "Дремучий лес", "Камень", "Горные породы"];
  }

  nextTurn(forced) {
    this.objects.forEach((obj) => {
      if ('nextTurn' in obj) {
        let occupiesPlace = 'occupy' in obj;
        if (occupiesPlace)
          obj.occupy(this.occupied, false);
        obj.nextTurn(forced)
        if (occupiesPlace && !obj.dead)
          obj.occupy(this.occupied, true);
      }
    });
    this.removeDeadObjects();
    this.vision.recalculateLocalVisibility();
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

  isOccluded(x, y) {
    let tile = this.terrain[x][y];
    return tile == TERRAIN_STONE_WALL;
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
    if (player.stats.mana == 0)
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

class DecorativeObject {
  constructor(obj, x, y, image) {
    this.inventoryItem = getProp(obj, "InventoryItem");
    this.foundMessage = getProp(obj, "Message");
    this.hint = obj.name;
    this.x = x;
    this.y = y;
    this.image = image;
    if (getProp(obj, "Blocker") != "") {
      this.occupy = (occupied, on) => {
        occupied[this.x][this.y] = on? this : null;
      }
    }
  }
  onContact(player) {
    if (this.foundMessage) {
      dialogUI.addMessage(this.foundMessage, speaker1);
      this.foundMessage = null;
    }
    if (this.inventoryItem) {
      if (player.takeItem(this.inventoryItem)) {
        this.inventoryItem = null;
        this.dead = true;
      }
    }    
  }
  draw(ctx, x, y) {
    if (this.image.complete)
      ctx.drawImage(this.image, x, y);
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
    if ('damageBonus' in attacker)
      damage += attacker.damageBonus();
    target.applyDamage(damage);
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

function dist2(x1, y1, x2, y2) {
  let dx = x1 - x2;
  let dy = y1 - y2;
  return dx*dx + dy*dy;
}

class Mob {
  constructor(obj, x, y) {
    this.meObj = obj;
    this.hint = obj.name;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;

    this.rules = getProp(obj, "Rules");
    if (this.rules) {
      let stats = rpg[this.rules];
      if (stats) {
        this.hp = stats.hp;
        this.stats = stats;
        this.roamRadius = stats.roamRadius;
        this.aggroRadius = stats.aggroRadius;
        this.startingX = x;
        this.startingY = y;
      }
    }

    this.img = makeImageFor(obj);
  }

  draw(ctx, x, y) {
    let moveTime = animations.globalTimer - this.moveTime;
    let rate = moveTime / 1.0;
    if (rate < 1) {
      x += (this.prevX - this.x) * tileSize * (1 - rate);
      y += (this.prevY - this.y) * tileSize * (1 - rate);
    }
    if (!this.dead && this.img && this.img.complete)
      ctx.drawImage(this.img, x, y);
    if (this.stats && this.hp < this.stats.hp)
      drawHPbar(ctx, this.hp, this.stats.hp, x, y)
  }

  occupy(occupied, on) {
    occupied[this.x][this.y] = on? this : null;
  }

  applyDamage(dmg) {
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
      world.objects.push(new DecorativeObject({name: "Останки"}, this.x, this.y, bonesImage))
  }

  isEnemy() {
    return this.stats && this.stats.enemy;
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
          let attacked = attackIfNear(this, player);
          if (attacked)
            canMove = false;
        }
      }
    }
    if (canMove) {
      this.prevX = this.x;
      this.prevY = this.y;
      this.moveTime = animations.globalTimer;
      this.move(forced);
    }
  }

  checkAggro() {
    if (!this.aggred) {
      this.aggred = dist2(this.x, this.y, player.x, player.y) <= this.aggroRadius * this.aggroRadius;
      if (this.aggred && 'aggroMessages' in this.stats && 'speaker' in this.stats) {
        let msg = randomNoRepeatFrom(this.stats.aggroMessages);
        let speaker = {
          color: this.stats.speaker.color,
          bgColor: this.stats.speaker.bgColor,
          font: this.stats.speaker.font,
          portrait: makeImage(randomNoRepeatFrom(this.stats.speaker.portraits))    
        };
        if (msg && speaker.portrait)
          dialogUI.addMessage(msg, speaker);
      }
    }
  }

  moveRandomlyInsideRoamingArea() {
    let nextx = this.x, nexty = this.y;
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
    if (world.isPassable(nextx, nexty) && insideRoaming) {
      this.x = nextx;
      this.y = nexty;
    }
  }

  moveTowardsPlayer() {
    let dx = Math.abs(this.x - player.x);
    let dy = Math.abs(this.y - player.y);
    let nextx = this.x, nexty = this.y;
    if (player.x < this.x)
      nextx -= 1;
    else if (player.x > this.x)
      nextx += 1;
    if (player.y < this.y)
        nexty -= 1;
    else if (player.y > this.y)
        nexty += 1;
    if (dx > dy) {
      if (world.isPassable(nextx, this.y))
        this.x = nextx;
      else if (world.isPassable(this.x, nexty))
        this.y = nexty;
    } else {
      if (world.isPassable(this.x, nexty))
        this.y = nexty;
      else if (world.isPassable(nextx, this.y))
        this.x = nextx;
    }
  }

  move(forced) {
    if (forced && !this.aggred)
      return;
    if (this.rules == "goblin") {
      if (world.isPassable(this.x, this.y)) {
        if (this.aggred)
          this.moveTowardsPlayer();
        else
          this.moveRandomlyInsideRoamingArea();
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
    if (Math.random() < 0.8)
      world.nextTurn(true)
    return true;
  }

  tryCast(targetX, targetY) {
    if (this.stats.mana < 50)
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
    if (this.sword && this.sword.img)
      ctx.drawImage(this.sword.img, x, y);
    if (this.shield && this.shield.img)
      ctx.drawImage(this.shield.img, x, y);
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

  takeItem(itemName) {
    let itemRpg = rpg[itemName];
    if (!itemRpg) {
      dialogUI.addMessage("Unknown item " + itemName, errorSpeaker);
      return false;
    }
    let currentSlot = this[itemRpg.type];
    if (this.shouldEquip(currentSlot, itemRpg)) {
      itemRpg.img = makeImage(itemRpg.equip_img);
      this[itemRpg.type] = itemRpg;
      if (itemRpg.message)
        dialogUI.addMessage(itemRpg.message, speaker1);
      return true;
    } else {
      if (itemRpg.reject)
        dialogUI.addMessage(itemRpg.reject, speaker1);
      return false;
    }
  }

  shouldEquip(current, next) {
    if (!current)
      return true;
    return next.quality > current.quality;
  }

  applyDamage(dmg) {
    if (this.shield)
      dmg -= this.shield.quality;
    if (dmg <= 0)
      return;
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

  damageBonus() {
    if (this.sword)
      return this.sword.quality;
    return 0;
  }
};
