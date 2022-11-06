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
                dialogUI.addMessage("На вкус жидкость тоже синяя. Не знаю, как это работает", speaker1, player);
                return true;
            }
        });
        this.triggers.push(() => {
            if (player.stats.mana == 50) {
                dialogUI.addMessage("Кажется, пора вспоминать, чему меня учили в университете", speaker1, player);  
                dialogUI.addMessage('Доступно заклинание "Создать камень"', systemMessageSpeaker, player);
                dialogUI.addMessage('Кликните мышкой на клетку рядом с собой, чтобы использовать', systemMessageSpeaker, player);
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
        dragon.hint = "Что-то непонятное";
        fire.emitters.push((particles, offset) => {
            if (dragon.awake) {
                addSmokeParticle(dragon, 6*tileSize - 4, tileSize - 4, particles, offset);
                addSmokeParticle(dragon, 6*tileSize - 4, - tileSize + 4, particles, offset);
            }
        });
        dragon.zLayer = 2;
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
            dragon.onContact = (player) => {
                player.applyDamage(10000);
            }
            const dragonSpeaker = {
                color: "rgb(252, 221, 118)",
                bgColor: "rgb(0, 0, 0)",
                font: '24px sans-serif',
                portrait: makeImage("dragon_portrait")
              };
            dialogUI.addMessage("В̶͉̭̏ͅО̶͍̚͝Р̵̡̭̥̎͒͊", dragonSpeaker, dragon);
            setTimeout(() => {
                dialogUI.addMessage("Ой-ой", speaker1, player);
            }, 1000);
        }
        if (dragon.awake) {
            let rotation = Math.atan2(player.y - dragon.y + 0.5, player.x - dragon.x + 0.5);
            rotation *= 180 / Math.PI;
            dragon.rotation.set(rotation, 0.5);
        }
    }
    onPlayerDeath() {
        let dragon = world.scriptObjects.dragon;
        let respawnX = 0, respawnY = 0;
        let deathMessage1 = randomFrom(player.stats.deathMessages);
        let deathMessage2 = "";
        if (dragon.awake) {
            dragon.awake = false;
            setTimeout(() => {dragon.image = dragon.sleepingImage}, 3000);
            dragon.rotation.set(0, 3);
            dragon.x -= 2;
            dragon.pixelX.set(dragon.x * tileSize, 3);
            respawnX = 20, respawnY = 98;
            let deathMessage = randomFrom(
                [
                    ["Вот что случилось бы, если бы я", "не придумал, как обмануть этого дракона!"],
                    ["Именно так дракон поступал с теми,", "кто не сумел заговорить ему зубы"],
                    ["Я не хотел стать ещё одним скелетом,", "поэтому применил хитрость..."]
                ]
            );
            deathMessage1 = deathMessage[0];
            deathMessage2 = deathMessage[1];
        } else if (!world.vision.everythingVisible()) {
            respawnX = 59, respawnY = 67;
        }
        animations.add(new FadeToBlack(3, deathMessage1, deathMessage2), player);
        setTimeout(() => {
          player.x = respawnX;
          player.y = respawnY;
          player.hp = 1;
          player.mana = 1;
        }, 1000);
    }
    onCast() {
        if (!this.castTriggerDone) {
            this.castTriggerDone = true;
            dialogUI.addMessage("БАТУ ДАТАНГ!", speaker1, player);
            dialogUI.addMessage("Я вообще-то больше люблю вызывать огонь. Но после экзамена всё, кроме БАТУ ДАТАНГ, сразу забыл",
                speaker1, player);
        }
    }
};
