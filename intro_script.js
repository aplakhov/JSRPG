function executeTriggers(triggers, done) {
    for (let n = 0; n < triggers.length; n++) {
        if (done[n])
            continue;
        let t = triggers[n];
        let finished = t();
        if (finished)
            done[n] = true;
    }
}

function addSmokeParticle(baseObject, pixelXobject, pixelYobject, fire, offset) {
    let pixelX = baseObject.toWorldX(pixelXobject, pixelYobject);
    let pixelY = baseObject.toWorldY(pixelXobject, pixelYobject);
    fire.emitParticles(pixelX, pixelY, 10, offset);
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
        this.done = [];
        for (let n = 0; n < this.triggers.length; n++)
            this.done.push(false);
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
        fire.emitters.push((fire, offset) => {
            if (dragon.awake) {
                addSmokeParticle(dragon, 6*tileSize - 4, tileSize - 4, fire, offset);
                addSmokeParticle(dragon, 6*tileSize - 4, - tileSize + 4, fire, offset);
            }
            return false;
        });
        fire.emitters.push((fire, offset) => {
            if (dragon.awake && dragon.aggro) {
                for (let n = 0; n < 7; n++) {
                    let mouthX = 6*tileSize;
                    let mouthY = 0.7*tileSize*(Math.random() - 0.5);
                    let mouthPixelX = dragon.toWorldX(mouthX, mouthY);
                    let mouthPixelY = dragon.toWorldY(mouthX, mouthY);
                    let impulseX = 2*(player.x + 0.5 - mouthPixelX/tileSize);
                    let impulseY = 2*(player.y + 0.5 - mouthPixelY/tileSize);                    
                    if (impulseX <= 0.5)
                        continue;
                    mouthPixelX += n*impulseX/7;
                    mouthPixelY += n*impulseY/7;
                    fire.particles.push({
                        x: mouthPixelX, y: mouthPixelY, 
                        impulseX: impulseX + Math.random() - 0.5, 
                        impulseY: impulseY + Math.random() - 0.5, 
                        temperature: 20
                    })
                }
                player.applyDamage(2);
            }
        });
        dragon.zLayer = 2;
        dragon.speaker = {
            color: "rgb(252, 221, 118)",
            bgColor: "rgb(0, 0, 0)",
            font: '24px sans-serif',
            portrait: makeImage("dragon_portrait")
        };
        dragon.initialX = dragon.x;
        dragon.onContact = (player) => {
            player.applyDamage(10000);
        }
    }
    nextTurn(forced) {
        executeTriggers(this.triggers, this.done);

        let dragon = world.scriptObjects.dragon;

        if (dragon.awake && !dragon.laughing && forced && player.x < 18)
            dragon.aggro = true;

        let playerOnTreasure = player.hp > 0
            && player.x == world.scriptObjects.treasure.x 
            && player.y == world.scriptObjects.treasure.y;
        if (!dragon.awake && playerOnTreasure) {
            dragon.awake = true;
            dragon.hint = "Дракон";
            dragon.x = dragon.initialX + 2;
            dragon.pixelX.set(dragon.x * tileSize, 1);
            dialogUI.addMessage("В̶͉̭̏ͅО̶͍̚͝Р̵̡̭̥̎͒͊", dragon.speaker, dragon, true);
            this.timeAtTreasure = animations.globalTimer;
        }
        if (dragon.awake && !dragon.laughing) {
            let rotation = Math.atan2(player.y - dragon.y + 0.5, player.x - dragon.x + 0.5);
            rotation *= 180 / Math.PI;
            dragon.rotation.set(rotation, 0.5);
        }
        if (dragon.awake && playerOnTreasure) {
            let timePassed = animations.globalTimer - this.timeAtTreasure;
            if (timePassed > 1)
                dialogUI.addMessage("Ой-ой", speaker1, player);
            if (timePassed > 5)
                dialogUI.addMessage("Почему он меня до сих пор не съел?", speaker1, player);
            if (timePassed > 8)
                dialogUI.addMessage("Смотрит как-то косо. Он что, меня не видит?", speaker1, player);
            if (timePassed > 12)
                dialogUI.addMessage("Как лягушка - не видит то, что не двигается", speaker1, player);
            if (timePassed > 16)
                dialogUI.addMessage("Но я же не могу стоять тут вечно. Надо как-то его отвлечь...", speaker1, player);
        }
    }
    onDraw() {
        let dragon = world.scriptObjects.dragon;
        if (dragon.laughing && dragon.laughingUntil < animations.globalTimer)
            dragon.laughing = false;
        dragon.image = dragon.awake && !dragon.laughing? dragon.awakeImage : dragon.sleepingImage;
        if (dragon.awake && dragon.laughing && Math.random() > 0.75) {
            let d = 8 * Math.random() - 4;
            dragon.pixelX.set(dragon.x * tileSize + d, 0.2);
            dragon.pixelY.set(dragon.y * tileSize - d, 0.2);
        }
    }
    onPlayerDeath() {
        let dragon = world.scriptObjects.dragon;
        let respawnX = 0, respawnY = 0;
        let deathMessage1 = randomFrom(player.stats.deathMessages);
        let deathMessage2 = "";
        if (dragon.awake) {
            dragon.awake = false;
            dragon.aggro = false;
            dragon.laughing = false;
            dragon.tickled = false;
            dragon.rotation.set(0, 3);
            dragon.x = dragon.initialX;
            dragon.pixelX.set(dragon.x * tileSize, 3);
            respawnX = 20, respawnY = 98;
            let deathMessage = randomFrom(
                [
                    ["Вот что случилось бы, если бы я", "не придумал, как обмануть этого дракона!"],
                    ["Именно так дракон поступал с теми,", "кто привлек к себе его внимание"],
                    ["Я не хотел стать ещё одним скелетом,", "поэтому применил хитрость..."],
                    ["Главное не суетиться,", "а остановиться и подумать"],
                    ["Дракон выглядел очень страшно, но у него", "оказалось много общего с лягушкой..."]
                ]
            );
            deathMessage1 = deathMessage[0];
            deathMessage2 = deathMessage[1];
        } else if (!world.vision.everythingVisible()) {
            respawnX = 59, respawnY = 67;
        }
        animations.add(new FadeToBlack(4, deathMessage1, deathMessage2), player);
        setTimeout(() => {
          player.x = respawnX;
          player.y = respawnY;
          player.hp = 1;
          player.mana = 1;
        }, 1500);
    }
    onCast(targetX, targetY) {
        if (!this.castTriggerDone) {
            this.castTriggerDone = true;
            dialogUI.addMessage("БАТУ ДАТАНГ!", speaker1, player);
            dialogUI.addMessage("Я вообще-то больше люблю вызывать огонь. Но после экзамена всё, кроме БАТУ ДАТАНГ, сразу забыл",
                speaker1, player);
        }
        let affectedObject = world.pathfinding.isOccupied(targetX, targetY);
        let dragon = world.scriptObjects.dragon;
        if (affectedObject == dragon) {
            if (!dragon.tickled)
                dragon.tickled = 1;
            else
                dragon.tickled += 1;
            if (dragon.tickled == 1)
                dialogUI.addMessage("ХИ-Х̵̟̗̜͆̌͋И̴̡͓͍̍̄͝", dragon.speaker, dragon, true);
            else if (dragon.tickled == 2)
                dialogUI.addMessage("ХИ-ХИ-Х̵̟̗̜͆̌͋И̴̡͓͍̍̄͝", dragon.speaker, dragon, true);
            else
                dialogUI.addMessage("У̶͖̀͋͊̆̕А̶̰̎̒͂͆Х̵̨̣͒̑̓Х̶̻͖͎͈̔̾̀А̷̝͙͠ХА-ХИ-Х̵̟̗̜͆̌͋И̴̡͓͍̍̄͝", dragon.speaker, dragon, true);
            dragon.laughing = true;
            dragon.laughingUntil = animations.globalTimer + 1 * dragon.tickled;
        }
    }
};
