function addSmokeParticle(baseObject, pixelXobject, pixelYobject, fire, offset) {
    let pixelX = baseObject.toWorldX(pixelXobject, pixelYobject);
    let pixelY = baseObject.toWorldY(pixelXobject, pixelYobject);
    fire.emitParticles(pixelX, pixelY, 10, offset);
}

class IntroMapScript extends AllScripts {
    constructor(world) {
        super();
        this.triggers.push(() => {
            if (player.stats.mana > 0) {
                ui.dialogUI.addMessage("На вкус жидкость тоже синяя. Не знаю, как это работает", playerSpeaker, player);
                return true;
            }
        });
        this.triggers.push(() => {
            if (player.stats.mana == 50) {
                ui.dialogUI.addMessage("Кажется, пора вспоминать, чему меня учили в университете", playerSpeaker, player);  
                ui.dialogUI.addMessage('Доступно заклинание "Создать камень"', systemMessageSpeaker, player);
                ui.dialogUI.addMessage('Кликните мышкой на клетку рядом с собой, чтобы использовать', systemMessageSpeaker, player);
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
        let gate = world.scriptObjects.gate;
        gate.zLayer = 2;
        gate.occupiedTiles = [
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
        ];
        gate.onContact = (player) => {
            player.applyDamage(10000);
        }
        player.takeItem("wooden_stick");
    }
    nextTurn(forced) {
        this._executeTriggers();

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
            ui.dialogUI.addMessage("В̶͉̭̏ͅО̶͍̚͝Р̵̡̭̥̎͒͊", dragon.speaker, dragon, true);
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
                ui.dialogUI.addMessage("Ой-ой", playerSpeaker, player);
            if (timePassed > 5)
                ui.dialogUI.addMessage("Почему он меня до сих пор не съел?", playerSpeaker, player);
            if (timePassed > 8)
                ui.dialogUI.addMessage("Смотрит как-то косо. Он что, меня не видит?", playerSpeaker, player);
            if (timePassed > 12)
                ui.dialogUI.addMessage("Как лягушка - не видит то, что не двигается", playerSpeaker, player);
            if (timePassed > 16)
                ui.dialogUI.addMessage("Но я же не могу стоять тут вечно. Надо как-то его отвлечь...", playerSpeaker, player);
        }

        let lever = world.scriptObjects.lever;
        let gate = world.scriptObjects.gate;
        if (player.x == lever.x && player.y == lever.y) {
            gate.pixelY.set(gate.y * tileSize + 128, 1);
            ui.dialogUI.addMessage("Ага, вот как эти ворота открываются", playerSpeaker, player);
            this.gateOpen = true;
            if (!this.gateOpenTimes)
                this.gateOpenTimes = 0;
        } else if (!lever.alwaysOn) {
            gate.pixelY.set(gate.y * tileSize, 0.15);
            if (this.gateOpen) {
                this.gateOpen = false;
                this.gateOpenTimes++;
                if (this.gateOpenTimes == 1)
                    ui.dialogUI.addMessage("Так, стоп", playerSpeaker, player);
                else if (this.gateOpenTimes == 2)
                    ui.dialogUI.addMessage("Их вообще можно открыть, если у тебя нет помощника?", playerSpeaker, player);
                else if (this.gateOpenTimes == 3)
                    ui.dialogUI.addMessage("А если пробежать очень-ОЧЕНЬ БЫСТРО?", playerSpeaker, player);
                else if (this.gateOpenTimes == 4)
                    ui.dialogUI.addMessage("Подпереть бы чем-нибудь этот рычаг", playerSpeaker, player);
                else
                    ui.dialogUI.addMessage("Может, найдется что-нибудь тяжелое?", playerSpeaker, player);
            }
        }
        if (player.x > gate.x && player.inventory.indexOf(rpg.treasureChest) >= 0)
            this.playFinalScript();
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
            ui.dialogUI.addMessage("БАТУ ДАТАНГ!", playerSpeaker, player);
            ui.dialogUI.addMessage("Я вообще-то больше люблю вызывать огонь. Но после экзамена всё, кроме БАТУ ДАТАНГ, сразу забыл",
                playerSpeaker, player);
        }
        let affectedObject = world.pathfinding.isOccupied(targetX, targetY);
        let dragon = world.scriptObjects.dragon;
        if (affectedObject == dragon) {
            if (!dragon.tickled)
                dragon.tickled = 1;
            else
                dragon.tickled += 1;
            if (dragon.tickled == 1)
                ui.dialogUI.addMessage("ХИ-Х̵̟̗̜͆̌͋И̴̡͓͍̍̄͝", dragon.speaker, dragon, true);
            else if (dragon.tickled == 2)
                ui.dialogUI.addMessage("ХИ-ХИ-Х̵̟̗̜͆̌͋И̴̡͓͍̍̄͝", dragon.speaker, dragon, true);
            else
                ui.dialogUI.addMessage("У̶͖̀͋͊̆̕А̶̰̎̒͂͆Х̵̨̣͒̑̓Х̶̻͖͎͈̔̾̀А̷̝͙͠ХА-ХИ-Х̵̟̗̜͆̌͋И̴̡͓͍̍̄͝", dragon.speaker, dragon, true);
            dragon.laughing = true;
            dragon.laughingUntil = animations.globalTimer + 1 * dragon.tickled;
        }
        let lever = world.scriptObjects.lever;
        if (targetX == lever.x && targetY == lever.y)
            ui.dialogUI.addMessage("Теперь рычаг стоит на красивом каменном полу. Это не совсем то, чего я добивался.", playerSpeaker, player);            
    }
    onItemUse(item) {
        let lever = world.scriptObjects.lever;
        if (player.x == lever.x && player.y == lever.y && !lever.alwaysOn) {
            if (item == rpg.kettlebell || item == player.shield) {
                let msg = item == rpg.kettlebell? "О, а это хорошая идея" :
                    "Щит, конечно, жаль использовать в качестве подпорки, но очень уж хочется посмотреть, что там за воротами"; 
                ui.dialogUI.addMessage(msg, playerSpeaker, player);
                player.loseItem(item);
                lever.image = makeImage("lever_on");
                lever.hint = "Подпёртый рычаг";
                lever.alwaysOn = true;
            } else {
                ui.dialogUI.addMessage("Этим подпереть рычаг не получится.", playerSpeaker, player);
            }
            return true;
        }
        return false;
    }
    playFinalScript() {
        let scriptPlace = world.scriptObjects.lastScriptPlace;
        animations.add(new FadeToBlack(4, "После утомительной дороги с тяжелым сундуком..."), player);
        this.noControl = true;
        this.stopGameplayTime = true;
        ui.state = 2;

        setTimeout(() => {
          player.x = scriptPlace.x + 7;
          player.y = scriptPlace.y;
          world.vision.recalculateLocalVisibility();
        }, 1500);

        let kirael = this._addMob(scriptPlace.x - 2, scriptPlace.y - 2, "Кираэль", "kirael");
        let thug1 = this._addMob(scriptPlace.x - 3, scriptPlace.y, "Первый громила", "thug");
        let thug2 = this._addMob(scriptPlace.x, scriptPlace.y - 3, "Второй громила", "thug");
        kirael.speaker = {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(178, 164, 165)",
            font: '18px sans-serif',
            portrait: makeImage("portrait2")
        };
        thug1.speaker = {
            color: "rgb(252, 221, 118)",
            bgColor: "rgb(0, 0, 0)",
            font: '18px sans-serif',
            portrait: makeImage("Thug_portrait")
        };
        thug2.speaker = {
            color: "rgb(252, 221, 118)",
            bgColor: "rgb(0, 0, 0)",
            font: '18px sans-serif',
            portrait: makeImage("Thug2_portrait")
        };

        setTimeout(() => {
            player.loseItem(rpg.treasureChest);
            this._startSequence();
            for (let n = 0; n < 7; n++)
                this._movePlayer(-1, 0);
            this._pause(0.5);
            this._say("О, привет, Кираэль. Что ты здесь делаешь?", playerSpeaker, player);
            this._say("И что это рядом с тобой за громилы?", playerSpeaker, player);
            this._say("Привет, неудачник. Отдавай сундук", kirael.speaker, kirael);
            this._say("А не то", kirael.speaker, kirael);
            this._say("Это нечестно! Я его с таким трудом украл!", playerSpeaker, player);
            this._say("Пришлось разгадывать головоломки и драться!", playerSpeaker, player);
            this._say("Ага, ты еще выдумай, что победил дракона", kirael.speaker, kirael);
            this._say("Вообще-то победил", playerSpeaker, player);
            this._say("Что ж тогда никто, кроме тебя, никаких драконов там не видел?", kirael.speaker, kirael);
            this._say("Во-первых, никто, кроме меня, и сокровище не нашел. Во-вторых, дракон замаскировался", playerSpeaker, player);
            this._say("ДРАКОН ЗАМАСКИРОВАЛСЯ?", kirael.speaker, kirael);
            this._say("Ха-ха-ха", thug1.speaker, thug1);
            this._say("У-хо-хо", thug2.speaker, thug2);
            this._say("Ты такой же болтун, как и всегда, Боб", kirael.speaker, kirael);
            this._say("Как-как его зовут?!", thug1.speaker, thug1);
            this._say("Представляешь, Горзаниал, его зовут Боб", kirael.speaker, kirael);
            this._say("Хе, ну и имечко, скажи, Дзиродиал?", thug1.speaker, thug1);
            this._say('Согласен, Горзаниал. Кому придет в голову назвать сына "Боб"?', thug2.speaker, thug2);
            this._say("В общем, так. Отдавай сокровище или ребята из тебя решето сделают. Считаю до пяти", kirael.speaker, kirael);
            this._say("Четыре", kirael.speaker, kirael);
            this._moveMob(thug1, 1, 0);
            this._moveMob(thug2, 0, 1);
            this._moveMob(thug1, 1, 0);
            this._moveMob(thug2, 0, 1);
            this._say("Вот блин", playerSpeaker, player);
            this._fade("Конец первой главы", 10000);
            this._finishSequence();
        }, 4000);
    }
};
