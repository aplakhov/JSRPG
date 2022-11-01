function executeTriggers(triggers) {
    for (let n = 0; n < triggers.length; n++) {
        let t = triggers[n];
        if (!t)
            continue;
        let happened = t();
        if (happened)
            triggers[n] = null;
    }
}

class IntroMapScript {
    constructor(world) {
        this.triggers = [];
        this.triggers.push(() => {
            if (player.stats.mana > 0) {
                dialogUI.addMessage("На вкус жидкость тоже синяя. Не знаю, как это работает", speaker1);
                return true;
            }
        });
        this.triggers.push(() => {
            if (player.stats.mana == 50) {
                dialogUI.addMessage("Кажется, пора вспоминать, чему меня учили в университете", speaker1);  
                dialogUI.addMessage('Доступно заклинание "Создать камень"', systemMessageSpeaker);
                dialogUI.addMessage('Кликните мышкой на клетку рядом с собой, чтобы использовать', systemMessageSpeaker);
                return true;
            }                      
        });
    }
    nextTurn(forced) {
        executeTriggers(this.triggers);

        let dragon = world.scriptObjects.dragon;
        if (!dragon.awake && player.x == 8 && player.y > 90) {
            dragon.awake = true;
            dragon.x += 2;
            dragon.pixelX.set(dragon.pixelX.get() + 64, 1);
        }
        if (dragon.awake) {
            let rotation = Math.atan2(player.y - dragon.y + 0.5, player.x - dragon.x + 0.5);
            rotation *= 180 / Math.PI;
            dragon.rotation.set(rotation, 1);
        }
    }
};
