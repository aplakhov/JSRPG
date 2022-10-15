"use strict";

const charCanvas = document.getElementById("charCanvas");
const charCtx = charCanvas.getContext("2d");

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
  if (dx <= 2 && dx >= -2 && dy <= 2 && dy >= -2) { // add test Bullet animation
    const duration = 0.3
    const direction = { x: dx * tileSize, y: dy * tileSize }
    animations.add(new Bullet(direction, duration), player);
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
  if (event.key == "f")
    animations.add(new FadeToBlack(4, "Meanwhile..."), player);
});
