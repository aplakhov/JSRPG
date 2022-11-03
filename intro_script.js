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

function addSmokeParticle(baseObject, pixelXobject, pixelYobject, particles, offset) {
    let pixelX = baseObject.toWorldX(pixelXobject, pixelYobject);
    let pixelY = baseObject.toWorldY(pixelXobject, pixelYobject);
    let x = Math.floor((pixelX + tileSize/2)/tileSize);
    let y = Math.floor((pixelY + tileSize/2)/tileSize);
    if (x < offset.x || y < offset.y || x > offset.x + viewInTiles || y > offset.y + viewInTiles)
        return;
    if (!world.vision.isVisible(x, y))
        return;
    particles.push({x: pixelX, y: pixelY, temperature: 10});
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
        let dragon = world.scriptObjects.dragon;
        dragon.sleepingImage = dragon.image;
        dragon.awakeImage = makeImage("dragon");
        dragon.occupiedTiles = [
            [1, 1, 0, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 0, 1, 1, 0, 0, 0, 0],
        ];
        dragon.hint = "Горные породы";
    }
    nextTurn(forced) {
        executeTriggers(this.triggers);

        let dragon = world.scriptObjects.dragon;
        if (!dragon.awake && player.x == world.scriptObjects.treasure.x && player.y == world.scriptObjects.treasure.y) {
            dragon.awake = true;
            dragon.image = dragon.awakeImage;
            dragon.hint = "Дракон";
            dragon.x += 2;
            dragon.pixelX.set(dragon.pixelX.get() + 64, 1);
            fire.emitters.push((particles, offset) => {
                addSmokeParticle(dragon, 6*tileSize - 4, tileSize - 4, particles, offset);
                addSmokeParticle(dragon, 6*tileSize - 4, - tileSize + 4, particles, offset);
            });
            dragon.onContact = (player) => {
                player.applyDamage(10000);
            }
            const dragonSpeaker = {
                color: "rgb(252, 221, 118)",
                bgColor: "rgb(0, 0, 0)",
                font: '24px sans-serif',
                portrait: makeImage("dragon_portrait")
              };
            dialogUI.addMessage("В̶͉̭̏ͅО̶͍̚͝Р̵̡̭̥̎͒͊", dragonSpeaker);
            setTimeout(() => {
                dialogUI.addMessage("Ой-ой", speaker1);                
            }, 1000);
        }
        if (dragon.awake) {
            let rotation = Math.atan2(player.y - dragon.y + 0.5, player.x - dragon.x + 0.5);
            rotation *= 180 / Math.PI;
            dragon.rotation.set(rotation, 0.5);
        }
    }
    onCast(targetX, targetY, spell) {
        if (!this.castTriggerDone) {
            this.castTriggerDone = true;
            dialogUI.addMessage("БАТУ ДАТАНГ!", speaker1);
            dialogUI.addMessage("Я вообще-то больше люблю вызывать огонь. Но после экзамена всё, кроме БАТУ ДАТАНГ, сразу забыл", speaker1);
        }
    }
    onPlayerDeath() {
        let dragon = world.scriptObjects.dragon;
        if (dragon.awake) {
            dragon.awake = false;
            dragon.image = dragon.sleepingImage;
            dragon.rotation.set(0, 3);
            dragon.x -= 2;
            dragon.pixelX.set(dragon.pixelX.get() - 64, 3);       
        }
    }
};
