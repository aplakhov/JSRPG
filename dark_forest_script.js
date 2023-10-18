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

    nextTurn(forced) {
        this._executeTriggers()
        if (this.wolfCubsHealed) {
            const wolfCubs = world.scriptObjects.wolfCubs;
            wolfCubs.image = "wolf_cubs_healed";
            if (dist2(player.x, player.y, wolfCubs.x, wolfCubs.y) <= 1)
                ui.dialogUI.addMessage("Ну как вы тут, мои хорошие? Ути-пути.", playerSpeaker, player);
        }
    }

    checkCanCast(targetX, targetY, spell) {
        const wolfCubs = world.scriptObjects.wolfCubs;
        console.log("wolf cubs", wolfCubs.x, wolfCubs.y);
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
                // TODO: player refuses to do that
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
