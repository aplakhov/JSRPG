"use strict";

const canvas = document.getElementById("canvas");
const charCanvas = document.getElementById("charCanvas");

const ctx = canvas.getContext("2d");
const charCtx = charCanvas.getContext("2d");

let coinImage = new Image(); coinImage.src = "coin.png";
let manaImage = new Image(); manaImage.src = "mana.png";

const tileSize = 32;
const viewInTiles = 24;
const halfViewInTiles = 12;

function clamp(x, minx, maxx) {
  return x > minx? (x < maxx? x : maxx) : minx;
};

function tileAt(x, y) {
  let r2 = (x - 50) * (x - 50) + (y - 50) * (y - 50);
  return r2 < 2500? 1: 0;
};

function canvasOffsetInTiles() {
  const minx = clamp(player.x - halfViewInTiles, 0, world.width - viewInTiles);
  const miny = clamp(player.y - halfViewInTiles, 0, world.height - viewInTiles);
  return { x : minx, y : miny };
}

function drawObj(ctx, obj) {
  let img = obj.img()
  let x = obj.x
  let y = obj.y
  if (!img.complete)
    return;
  const offset = canvasOffsetInTiles();
  if (x < offset.x || x >= offset.x + viewInTiles || y < offset.y || y >= offset.y + viewInTiles)
    return;
  ctx.drawImage(img, (x-offset.x)*tileSize, (y-offset.y)*tileSize);
};

let tileUnderCursor = { x : 0, y : 0 };

function updateTileUnderCursor(mouseEvent) {
  const rect = mouseEvent.target.getBoundingClientRect();
  const offset = canvasOffsetInTiles();
  const tileX = offset.x + ((mouseEvent.clientX - rect.left) / tileSize) >> 0;
  const tileY = offset.y + ((mouseEvent.clientY - rect.top) / tileSize) >> 0;
  tileUnderCursor = { x : tileX, y : tileY };
};

function redrawInventory(charCtx) {
  charCtx.fillStyle = "rgb(45, 80, 24)";
  charCtx.fillRect(0, 0, 200, 768);
  if (player.maxMana > 0 && manaImage.complete)
    charCtx.drawImage(manaImage, 10, 10);
}

canvas.onmousemove = updateTileUnderCursor;
let player = new Player();
let world = new World();

canvas.onclick = function clickEvent(e) {
  updateTileUnderCursor(e);
  let dx = tileUnderCursor.x - player.x;
  let dy = tileUnderCursor.y - player.y;
  if (dx == 0 && dy == 0)
    return;
  let moveX = Math.abs(dx) >= Math.abs(dy);
  if (moveX) {
    if (!player.tryMove(dx > 0? 1 : -1, 0) && dy != 0)
      player.tryMove(0, dy > 0? 1 : -1);
  } else {
    if (!player.tryMove(0, dy > 0? 1 : -1) && dx != 0)
      player.tryMove(dx > 0? 1 : -1, 0);
  }
}

addEventListener("keyup", function(event) {
  if (event.key == "ArrowLeft")
    player.tryMove(-1,0);
  if (event.key == "ArrowUp")
    player.tryMove(0,-1);
  if (event.key == "ArrowRight")
    player.tryMove(1,0);
  if (event.key == "ArrowDown")
    player.tryMove(0,1);
});

setInterval( () => {
    world.draw(ctx);
    player.draw(ctx);
    redrawInventory(charCtx);
  },
  10
);
