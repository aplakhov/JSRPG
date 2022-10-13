"use strict"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let coinImage = new Image(); coinImage.src = "coin.png";
let manaImage = new Image(); manaImage.src = "mana.png";

function drawWorld(ctx, offset, world) {
    const fillStyles = [["rgb(93, 161, 48)", "rgb(93, 166, 48)"], ["rgb(0, 200, 200)","rgb(0, 195, 205)"]];
    for (let dx = 0; dx < viewInTiles; dx++) {
        for (let dy = 0; dy < viewInTiles; dy++) {
        let tile = world.terrain[offset.x+dx][offset.y+dy];
        ctx.fillStyle = fillStyles[tile][(offset.x+dx+offset.y+dy)%2];
        ctx.fillRect(dx*tileSize, dy*tileSize, tileSize, tileSize)
        }
    }
    world.objects.forEach((obj, index, array) => drawObj(ctx, offset, obj))
};

function drawObj(ctx, offset, obj) {
    let img = obj.img()
    let x = obj.x
    let y = obj.y
    if (!img.complete)
        return;
    if (x < offset.x || x >= offset.x + viewInTiles || y < offset.y || y >= offset.y + viewInTiles)
        return;
    ctx.drawImage(img, (x-offset.x)*tileSize, (y-offset.y)*tileSize);
}

function drawPlayer(ctx, offset, player) {
    let x = (player.x - offset.x);
    let y = (player.y - offset.y);
    ctx.fillStyle = "rgb(80, 80, 80)";
    ctx.fillRect(x*tileSize + 8, y*tileSize + 8, 16, 16);
}

setInterval( () => {
    const offset = canvasOffsetInTiles();
    drawWorld(ctx, offset, world);
    drawPlayer(ctx, offset, player);
    redrawInventory(charCtx);
  },
  20
);
