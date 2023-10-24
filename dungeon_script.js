class DungeonScript extends AllScripts {
    constructor(world) {
        super();
        this._setupRails(world);
        this.vagonImg = images.prepare("Animations/player_vagon");
    }

    _setupRails(world) {
        for (let x = 0; x < world.width; x++) {
            for (let y = 0; y < world.height; y++) {
                if (world.terrain[x][y] == TERRAIN_PAVEMENT) {
                    const leftToo = x > 0 && world.terrain[x-1][y] == TERRAIN_PAVEMENT;
                    const rightToo = x+1 < world.width && world.terrain[x+1][y] == TERRAIN_PAVEMENT;
                    const upToo = y > 0 && world.terrain[x][y-1] == TERRAIN_PAVEMENT;
                    const downToo = y+1 < world.height && world.terrain[x][y+1] == TERRAIN_PAVEMENT;
                    let o = {
                        "class": "DecorativeObject",
                        "name": "Рельсы",
                    };
                    if (leftToo && upToo)
                        o["Image"] = "Rails/ul";
                    else if (rightToo && upToo)
                        o["Image"] = "Rails/ur";
                    else if (leftToo && downToo)
                        o["Image"] = "Rails/dl";
                    else if (rightToo && downToo)
                        o["Image"] = "Rails/dr";
                    else if (upToo || downToo)
                        o["Image"] = "Rails/v";
                    else
                        o["Image"] = "Rails/h";
                    world.addNewObject(o, x, y);
                }
            }
        }
        for (let x = 0; x < world.width; x++)
            for (let y = 0; y < world.height; y++)
                if (world.terrain[x][y] == TERRAIN_PAVEMENT)
                    world.terrain[x][y] = TERRAIN_SAND;
    }

    setupRecalculatedData(world) {
        let domna = world.scriptObjects.domna;
        world.fire.emitters.push((fire, pixelOffset) => {
            addSmokeParticle(domna, 48, 20, 10, fire, pixelOffset);
            return false;
        });

    }

    drawUnderDarkness(ctx, pixelOffset) {
        for (let obj of world.objects) {
            if (obj.ai && obj.ai.guardArea) {
                const visible1 = world.vision.isVisibleSafe(obj.x, obj.y);
                const guardZone = world.scriptObjects[obj.ai.guardArea];
                let visible2;
                if (guardZone.touchedByPlayer) {
                    visible2 = world.vision.isVisibleSafe(player.x, player.y);
                } else {
                    visible2 = world.vision.isVisibleSafe(guardZone.x, guardZone.y);
                }
                if (visible1 || visible2) {
                    ctx.strokeStyle = "rgba(192,192,192,0.4)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    const x0 = obj.pixelX.get() + 16 - pixelOffset.x, y0 = obj.pixelY.get() + 16 - pixelOffset.y;
                    ctx.moveTo(x0, y0);
                    if (guardZone.touchedByPlayer) {
                        const x1 = player.pixelX.get() + 16 - pixelOffset.x, y1 = player.pixelY.get() + 16 - pixelOffset.y;
                        ctx.lineTo(x1, y1);
                    } else {
                        const x1 = guardZone.x * tileSize + 16 - pixelOffset.x, y1 = guardZone.y * tileSize + 16 - pixelOffset.y;
                        ctx.lineTo(x1, y1);
                    }
                    ctx.stroke();            
                }
            }
        }
    }

    drawPlayer(ctx, frameX, frameY, x, y) {
        if (!this.playerInVagon)
            return false;
        const fx = frameX % 2, fy = frameY % 2;
        images.draw(ctx, this.vagonImg, fx * 32, fy * 32, 32, 32, x, y - 4, 32, 32);
        //if (player.shield && rpg[player.shield].equipImg)
        //    images.draw(ctx, rpg[player.shield].equipImg, 64, 0, 32, 32, x, y - 6, 32, 32);
        if (player.hp < player.stats.hp)
            drawHPbar(ctx, player.hp, player.stats.hp, x, y - 6)
        return true;
    }

    onDraw() {
        const vagon = world.scriptObjects.vagon;
        if (player.x == vagon.x && player.y == vagon.y && player.pixelX.atTarget() && player.pixelY.atTarget())
            this.playerInVagon = true;
        if (this.playerInVagon)
            vagon.image = "";
        else
            vagon.image = "Rails/vagon";
    }

    nextTurn(forced) {
        if (this.playerInVagon) {
            if (!player.pixelY.atTarget())
                this.playerInVagon = false;
            else {
                const vagon = world.scriptObjects.vagon;
                vagon.x = player.x;
                vagon.y = player.y;
            }
        }
        this._executeTriggers()
    }

    onItemUse(item) {
        return false;
    }
};
