class MushroomsMapScript extends AllScripts {
    constructor(world) {
        super();
    }

    setupRecalculatedData(world) {
        const baseTile = {x: 0, y: 0} 
        world.animations.add(new VisualDarkness(), baseTile);
    }

    nextTurn(forced) {
        this._executeTriggers();
        if (forced) {
            for (let o of world.objects) {
                if (o.x == player.x && o.y == player.y) {
                    if (o.initialObj.class == "Bones")
                        ui.dialogUI.addMessage("Фууу.... Зачем я наступил в эту гадость?", playerSpeaker, player);
                    else if (o.hint == "Грибы")
                        ui.dialogUI.addMessage("Думаете, съедобные? Сомневаюсь.", playerSpeaker, player);
                }
            }
        }
    }

    onItemUse(item) {
        if (item != "lookingGlass")
            return false;
        let volcano = world.scriptObjects.volcano;
        if (dist2(player.x, player.y, volcano.x, volcano.y) <= 2) {
            const msgs = [
                "Здесь земля и огонь разговаривают.",
                "Если слушать тихо и внимательно, начинаешь их понимать."
            ]
            discoverNewSpell(msgs, "earth_ear");
            if (!playerKnowsSpell("fire"))
                player.stats.spells.push("fire");    
            return true;
        }
        for (let o of world.objects) {
            if (o.hint == "Грибы" && dist2(player.x, player.y, o.x, o.y) <= 1) {
                ui.dialogUI.addMessage("Странные какие-то они. Возьму себе для гербария", playerSpeaker, player);
                player.takeItem("shrooms");
                return true;
            }
        }
        return false;
    }
};
