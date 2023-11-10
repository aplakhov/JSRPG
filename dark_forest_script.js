class DarkForestMapScript extends AllScripts {
    constructor(world) {
        super();
        let dwarf_house = world.scriptObjects.dwarf_house;
        dwarf_house.inside = {
            art: "Places/lone_dwarf_house",
            header: 'Дом гнома глубоко в тёмном лесу',
            description: 
                'Очень странное место. Обычно гномы не живут в лесу, а уж тем более в таком лесу, где и эльфу-то станет не по себе.'
        }
        let wolfMother = world.scriptObjects.mother;
        wolfMother.aggroRadius = 1;
        wolfMother.roamRadius = 0;
    }

    setupRecalculatedData(world) {
        const baseTile = {x: 0, y: 0} 
        world.animations.add(new VisualDarkness(), baseTile);
    }

    inSwamp(x, y, swamp) {
        if (x >= world.width || x < 0 || y >= world.height || y < 0)
            return false;
        return (world.terrain[x][y] == TERRAIN_WATER && swamp.isInsideXY(x,y));
    }

    dieInSwamp() {
        if (this.noControl || player.hp <= 0)
            return; // already died or dying
        this._startSequence();
        this._say("Это совсем не трава!", playerSpeaker, player);
        this._say("Не могу даже шагнуть.", playerSpeaker, player);
        this._say("Кажется, зря я сюда залез...", playerSpeaker, player);
        this._do(() => { player.applyDamage(10000, world.scriptObjects.swamp) });
        this._finishSequence();
    }

    nextTurn(forced) {
        this._executeTriggers();
        if (this.wolfCubsHealed) {
            const wolfCubs = world.scriptObjects.wolfCubs;
            wolfCubs.image = "wolf_cubs_healed";
            if (dist2(player.x, player.y, wolfCubs.x, wolfCubs.y) <= 1)
                ui.dialogUI.addMessage("Ну как вы тут, мои хорошие? Ути-пути.", playerSpeaker, player);
        }
        const swamp = world.scriptObjects.swamp;
        if (this.inSwamp(player.x - 1, player.y, swamp) || this.inSwamp(player.x + 1, player.y, swamp) ||
            this.inSwamp(player.x, player.y - 1, swamp) || this.inSwamp(player.x, player.y + 1, swamp) ||
            this.inSwamp(player.x - 1, player.y - 1, swamp) || this.inSwamp(player.x + 1, player.y - 1, swamp) ||
            this.inSwamp(player.x - 1, player.y + 1, swamp) || this.inSwamp(player.x + 1, player.y + 1, swamp)) {
            this.dieInSwamp();
        }
        if (!this.alreadyShowingPath) {
            for (let obj of world.objects) {
                if (!obj.initialObj || getProp(obj.initialObj, "Rules") != "living_lights")
                    continue;
                if (dist2(player.x, player.y, obj.x, obj.y) <= 1) {
                    this.alreadyShowingPath = true;
                    ui.dialogUI.addMessage("Дратути. Вы же местные? Не подскажете, как перейти через Гиблые болота?", playerSpeaker, player);
                    obj.ai.patrolPath = [[102, 17], [103, 17], [103, 16], [103, 15], [103, 14], [103, 13], 
                    [103, 12], [104, 12], [105, 12], [106, 12], [106, 11], [106, 10], [106, 9], [107, 9], [108, 9], 
                    [109, 9], [110, 9], [110, 8], [111, 8], [112, 8], [113, 8], [114, 8], [114, 9], [114, 10], [114, 11],
                    [114, 12], [113, 12], [113, 13], [113, 14], [113, 15], [113, 16], [114, 16], [115, 16], [116, 16],
                    [117, 16], [117, 15], [117, 14], [117, 13], [117, 12], [117, 12]];
                }
            }
        }
    }

    drawEarthEar(fromX, fromY, toX, toY, pixelOffset) {
        let px = pixelOffset.x, py = pixelOffset.y;
        const swampImg = images.prepare("earth_ear_danger_area");
        const swamp = world.scriptObjects.swamp;
        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                if (this.inSwamp(x, y, swamp))
                    images.draw(ctx, swampImg, 0, 0, 96, 96, x*tileSize-32-px, y*tileSize-32-py, 96, 96);
            }
        }
    }

    checkCanCast(targetX, targetY, spell) {
        const wolfCubs = world.scriptObjects.wolfCubs;
        if (dist2(targetX, targetY, wolfCubs.x, wolfCubs.y) <= 1) {
            if (spell == "healing") {
                this.wolfCubsHealed = true;
                world.animations.add(new HealingEffect(), wolfCubs);                
                wolfCubs.image = "wolf_cubs_healed";
                const mother = world.scriptObjects.mother;
                if (!mother.dead) {
                    ui.dialogUI.addMessage("Уууу уу уУуу уУуу  УУу УУУ УУУ Ууу  УУ уУ Уу", creatures.wolf.speaker, mother);
                    mother.ai.faction = 1;
                    setTimeout(() => {
                        for (let o of world.objects) {
                            if (o.hint == "Волк") {
                                o.ai.faction = 2;
                                ui.dialogUI.addMessage("УУУ УуУ", creatures.wolf.speaker, o);
                            }
                        }
                    }, 3000);
                    setTimeout(() => {
                        ui.dialogUI.addMessage("Чего это они? Так воют, как будто это какой-то код.", playerSpeaker, player);
                    }, 5000);
                }
                return true;
            } else if (spell == "fire" || spell == "lightning") {
                ui.dialogUI.addMessage("Да вы там офигели, что ли?! Это же щенята.", playerSpeaker, player);
                ui.dialogUI.addMessage("Не буду я такое делать.", playerSpeaker, player);
                return false;
            }
        }
        return true;
    }

    onItemUse(item) {
        return false;
    }
};
