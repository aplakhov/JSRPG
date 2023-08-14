quests.desert_goal_1 = {
    map: "desert_test_map",
    text: "Не помереть от жажды (ВАЖНОЕ)"
}

quests.desert_goal_2 = {
    map: "desert_test_map",
    text: "Найти заброшенный дворец Озимандии"
}

class DesertMapScript extends AllScripts {
    constructor(world) {
        super();
        this.triggers.push(() => {
            if (world.terrain[player.x][player.y] == TERRAIN_WATER) {
                ui.dialogUI.addMessage("Помогите, тону!", playerSpeaker, player);
                setTimeout(() => {
                    ui.dialogUI.addMessage("Глупо было бы утонуть в созданной мною же воде", playerSpeaker, player);
                }, 2000);
                setTimeout(() => {
                    ui.dialogUI.addMessage("Профессор бы этого точно не одобрил", playerSpeaker, player);
                }, 2500);
                return true;
            }
        });
        this._makeDeadTreesAround(world.trees, world.scriptObjects.emptyWell1);
        this._makeDeadTreesAround(world.trees, world.scriptObjects.emptyWell2);
        this._makeDeadTreesAround(world.trees, world.scriptObjects.emptyWell3);
    }

    _makeDeadTreesAround(trees, well) {
        console.log("Making trees burn around", well.x, well.y, well.w, well.h);
        for (let tree of trees)
            if (tree.x >= well.x - 2 && tree.y >= well.y - 2 && tree.x < well.x + well.w + 2 && tree.y < well.y + well.h + 2) {
                tree.burning = 500;
                console.log("Found a tree to burn!");
            }
    }

    nextTurn(forced) {
        this._executeTriggers();

        let hasWaterNearby = false;
        if (player.x > 0 && world.terrain[player.x - 1][player.y] == TERRAIN_WATER)
            hasWaterNearby = true;
        else if (player.y > 0 && world.terrain[player.x][player.y - 1] == TERRAIN_WATER)
            hasWaterNearby = true;
        else if (player.x + 1 < world.width && world.terrain[player.x + 1][player.y] == TERRAIN_WATER)
            hasWaterNearby = true;
        else if (player.y + 1 < world.height && world.terrain[player.x][player.y + 1] == TERRAIN_WATER)
            hasWaterNearby = true;
        if (!hasWaterNearby) {
            if (!this.remindedAboutWater && player.hp < player.stats.hp * 0.7) {
                this.remindedAboutWater = true;
                ui.dialogUI.addMessage("Силы быстро убывают. Водички бы...", playerSpeaker, player);
            }
            player.applyNonPhysicalDamage(1);
        } else {
            if (!this.drinkedWater) {
                this.drinkedWater = true;
                ui.dialogUI.addMessage("Водаааа!!!", playerSpeaker, player);
            }
            player.applyHealing(2);
        }

        let mirage = world.scriptObjects.mirage;
        if (!this.mirageDone && player.x >= mirage.x && player.y >= mirage.y && player.x < mirage.x + mirage.w && player.y < mirage.y + mirage.h) {
            this.mirageDone = true;
            for (let mx = mirage.x; mx < mirage.x + mirage.w; ++mx) {
                for (let my = mirage.y; my < mirage.y + mirage.h; ++my) {
                    if (world.terrain[mx][my] == TERRAIN_WATER)
                        world.terrain[mx][my] = TERRAIN_GRASS;
                }
            }
            for (let tree of world.trees)
                if (tree.x >= mirage.x && tree.y >= mirage.y && tree.x < mirage.x + mirage.w && tree.y < mirage.y + mirage.h)
                    tree.burning = 500;
        }
    }

    _tryFillWell(x, y, well) {
        if (x >= well.x && y >= well.y && x < well.x + well.w && y < well.y + well.h) {
            for (let wx = well.x; wx < well.x + well.w; ++wx) {
                for (let wy = well.y; wy < well.y + well.h; ++wy) {
                    world.terrain[wx][wy] = TERRAIN_WATER;
                }
            }
            return true;
        }
        return false;
    }

    onFinishSpell(targetX, targetY, spell) {
        if (spell == "water") {
            let spellComplete = 
                this._tryFillWell(targetX, targetY, world.scriptObjects.emptyWell1) ||
                this._tryFillWell(targetX, targetY, world.scriptObjects.emptyWell2) ||
                this._tryFillWell(targetX, targetY, world.scriptObjects.emptyWell3);
            if (targetX == player.x && targetY == player.y) {
                player.applyHealing(40);
                spellComplete = true;
                ui.dialogUI.addMessage("Ну вот, я весь вымок.", playerSpeaker, player);
                ui.dialogUI.addMessage("Хорошо-то как.", playerSpeaker, player);
            }
            if (!spellComplete) {
                world.animations.add(new SystemMessage(1.5, "Вода мгновенно уходит в песок"), player);
            }
            return true;
        }
        return false;
    }

    onItemUse(item) {
        return false;
    }
};
