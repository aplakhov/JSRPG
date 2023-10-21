class DungeonScript extends AllScripts {
    constructor(world) {
        super();
    }

    setupRecalculatedData(world) {
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

    nextTurn(forced) {
        this._executeTriggers()
    }

    onItemUse(item) {
        return false;
    }
};
