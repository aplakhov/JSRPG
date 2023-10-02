quests.intro_1 = {
    map: "intro_map",
    text: "Перебраться через речку под названием Мокрая",
    isDone: () => { return player.y >= world.scriptObjects.riverBankCrossed.y }
}

quests.intro_2 = {
    map: "intro_map",
    text:"Дойти до горы под названием Высокая", 
    isDone: () => { return !world.vision.everythingVisible() }
}

quests.intro_3 = {
    map: "intro_map",
    text:"Найти вход в пещеру под названием Тёмная", 
    isDone: () => { return !world.vision.everythingVisible() }
}

quests.intro_4 = {
    map: "intro_map",
    text:"Добыть сокровища подземных королей", 
    isDone: () => { return player.inventory.indexOf("treasureChest") >= 0 }
}

quests.intro_5 = { 
    map: "intro_map",
    text: "Вернуться в город и кутить"
}

class IntroMapScript extends AllScripts {
    constructor(world) {
        super();
        this.triggers.push(() => {
            if (player.stats.mana > 0) {
                ui.dialogUI.addMessage("На вкус жидкость тоже синяя. Не знаю, как это работает", playerSpeaker, player);
                world.animations.add(new SystemMessage(2, "Важная синяя бутылка: 1 из 5"), player);
                return true;
            }
        });
        this.triggers.push(() => {
            if (player.stats.mana == 20) {
                world.animations.add(new SystemMessage(2, "Важная синяя бутылка: 2 из 5"), player);
                return true;
            }
        });
        this.triggers.push(() => {
            if (player.stats.mana == 30) {
                world.animations.add(new SystemMessage(2, "Важная синяя бутылка: 3 из 5"), player);
                return true;
            }
        });
        this.triggers.push(() => {
            if (player.stats.mana == 40) {
                world.animations.add(new SystemMessage(2, "Важная синяя бутылка: 4 из 5"), player);
                return true;
            }
        });
        this.triggers.push(() => {
            if (player.stats.mana == 50) {
                const msgs = [
                    "Кажется, пора вспоминать, чему меня учили в университете",
                    "Мммм... Вот к прошлому экзамену выучил, как создавать камни",
                    "Не знаю, правда, зачем мне это сейчас"
                ]
                discoverNewSpell(msgs, "stone")
                setTimeout(() => {
                    ui.dialogUI.addMessage('Кликните мышкой на клетку рядом с собой, чтобы использовать', systemMessageSpeaker, player);
                    player.selectedSpell = 0
                }, 10000);
                return true;
            }
        });
        let dragon = world.scriptObjects.dragon;
        dragon.sleepingImage = dragon.image;
        dragon.awakeImage = images.prepare("dragon");
        dragon.occupiedTiles = [
            [1, 1, 0, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 0, 1, 1, 0, 0, 0, 0],
        ];
        dragon.hint = "Что-то непонятное";
        dragon.zLayer = 2;
        dragon.speaker = {
            color: "rgb(252, 221, 118)",
            bgColor: "rgb(0, 0, 0)",
            font: '24px sans-serif',
            portrait: images.prepare("Portraits/dragon")
        };
        dragon.initialX = dragon.x;
        dragon.onContact = (player) => {
            player.applyDamage(10000, dragon);
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
            player.applyDamage(10000, gate);
        }
        player.takeItem("wooden_stick");
        if ('treasure' in world.scriptObjects) {
            this.treasureX = world.scriptObjects.treasure.x;
            this.treasureY = world.scriptObjects.treasure.y;
        }
    }

    setupRecalculatedData(world) {
        let dragon = world.scriptObjects.dragon;
        world.fire.emitters.push((fire, pixelOffset) => {
            if (dragon.awake) {
                addSmokeParticle(dragon, 6*tileSize - 4, tileSize - 4, 10, fire, pixelOffset);
                addSmokeParticle(dragon, 6*tileSize - 4, - tileSize + 4, 10, fire, pixelOffset);
            }
            return false;
        });
        world.fire.emitters.push((fire, pixelOffset) => {
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
                player.applyDamage(2, "magic");
            }
        });        
    }

    nextTurn(forced) {
        this._executeTriggers();

        let dragon = world.scriptObjects.dragon;

        if (dragon.awake && !dragon.laughing && forced && player.x < 18)
            dragon.aggro = true;

        let playerOnTreasure = player.hp > 0
            && player.x == this.treasureX 
            && player.y == this.treasureY;
        if (!dragon.awake && playerOnTreasure) {
            dragon.awake = true;
            dragon.hint = "Дракон";
            dragon.x = dragon.initialX + 2;
            dragon.pixelX.set(dragon.x * tileSize, 1);
            ui.dialogUI.addMessage("В̶͉̭̏ͅО̶͍̚͝Р̵̡̭̥̎͒͊", dragon.speaker, dragon, true);
            this.timeAtTreasure = globalTimer;
        }
        if (dragon.awake && !dragon.laughing) {
            let rotation = Math.atan2(player.y - dragon.y + 0.5, player.x - dragon.x + 0.5);
            rotation *= 180 / Math.PI;
            dragon.rotation.set(rotation, 0.5);
        }
        if (dragon.awake && playerOnTreasure) {
            player.frameX = 0; // look at dragon
            let timePassed = globalTimer - this.timeAtTreasure;
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
        if (player.x > gate.x && player.inventory.indexOf("treasureChest") >= 0)
            this.playFinalScript();
    }
    onDraw() {
        let dragon = world.scriptObjects.dragon;
        if (dragon.laughing && dragon.laughingUntil < globalTimer)
            dragon.laughing = false;
        dragon.image = dragon.awake && !dragon.laughing? dragon.awakeImage : dragon.sleepingImage;
        if (dragon.awake && dragon.laughing && Math.random() > 0.75) {
            let d = 8 * Math.random() - 4;
            dragon.pixelX.set(dragon.x * tileSize + d, 0.2);
            dragon.pixelY.set(dragon.y * tileSize - d, 0.2);
        }
    }

    playerDeathMessage() {
        let dragon = world.scriptObjects.dragon;
        if (dragon.awake) {
            let deathMessage = randomFrom(
                [
                    ["Вот что случилось бы, если бы я", "не придумал, как обмануть этого дракона!"],
                    ["Именно так дракон поступал с теми,", "кто привлек к себе его внимание"],
                    ["Я не хотел стать ещё одним скелетом,", "поэтому применил хитрость..."],
                    ["Главное не суетиться,", "а остановиться и подумать"],
                    ["Дракон выглядел очень страшно, но у него", "оказалось много общего с лягушкой..."]
                ]
            );
            return deathMessage[0], deathMessage[1];
        }
        return null, null;
    }

    onFinishSpell(targetX, targetY, spell) {
        if (!this.castTriggerDone) {
            this.castTriggerDone = true;
            ui.dialogUI.addMessage("БАТУ ДАТАНГ!", playerSpeaker, player);
            ui.dialogUI.addMessage("Я вообще-то больше люблю вызывать огонь. Но после экзамена всё, кроме БАТУ ДАТАНГ, сразу забыл",
                playerSpeaker, player);
        }
        let affectedObject = world.pathfinding.isOccupied(targetX, targetY);
        let dragon = world.scriptObjects.dragon;
        if (affectedObject == dragon && spell == "stone") {
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
            dragon.laughingUntil = globalTimer + 1 * dragon.tickled;
        }
        let lever = world.scriptObjects.lever;
        if (targetX == lever.x && targetY == lever.y && spell == "stone")
            ui.dialogUI.addMessage("Теперь рычаг стоит на красивом каменном полу. Это не совсем то, чего я добивался.", playerSpeaker, player); 
        return false;           
    }
    onItemUse(item) {
        let lever = world.scriptObjects.lever;
        if (player.x == lever.x && player.y == lever.y && !lever.alwaysOn) {
            if (item == "kettlebell") {
                ui.dialogUI.addMessage("О, а это хорошая идея", playerSpeaker, player);
                player.loseItem(item);
                lever.image = images.prepare("lever_on_blocked");
                lever.hint = "Подпёртый рычаг";
                lever.alwaysOn = true;
            } else if (item == player.shield) {
                ui.dialogUI.addMessage("Щит, может быть, и подошел бы в качестве подпорки...", playerSpeaker, player);
                ui.dialogUI.addMessage("Но не хочется его тут оставлять. Он, между прочим, денег стоит.", playerSpeaker, player);
            } else {
                ui.dialogUI.addMessage("Этим подпереть рычаг не получится.", playerSpeaker, player);
            }
            return true;
        }
        return false;
    }
    playFinalScript() {
        this._startSequence();
        this._fade("После утомительной дороги с тяжелым сундуком...", 4);

        this._wait(1.5);
        let scriptPlace = world.scriptObjects.lastScriptPlace;
        this._teleportPlayer(scriptPlace.x + 7, scriptPlace.y);

        let kirael = this._addMob(scriptPlace.x - 2, scriptPlace.y - 2, "Кираэль", "kirael");
        let thug1 = this._addMob(scriptPlace.x - 3, scriptPlace.y, "Первый громила", "thug_anim", "goblin");
        let thug2 = this._addMob(scriptPlace.x, scriptPlace.y - 3, "Второй громила", "thug_anim", "goblin");

        this._wait(2.5)
        this._do(() => {
            player.loseItem("treasureChest");
        });
        for (let n = 0; n < 7; n++)
            this._movePlayer(-1, 0);
        this._wait(0.5);
        this._say("О, привет, Кираэль. Что ты здесь делаешь?", playerSpeaker, player);
        this._say("И что это рядом с тобой за громилы?", playerSpeaker, player);
        this._say("Привет, неудачник. Отдавай сундук", kiraelSpeaker, kirael);
        this._say("А не то", kiraelSpeaker, kirael);
        this._say("Это нечестно! Я его с таким трудом украл!", playerSpeaker, player);
        this._say("Пришлось разгадывать головоломки и драться!", playerSpeaker, player);
        this._say("Ага, ты еще выдумай, что победил дракона", kiraelSpeaker, kirael);
        this._say("Вообще-то победил", playerSpeaker, player);
        this._say("Что ж тогда никто, кроме тебя, никаких драконов там не видел?", kiraelSpeaker, kirael);
        this._say("Во-первых, никто, кроме меня, и сокровище не нашел. Во-вторых, дракон замаскировался", playerSpeaker, player);
        this._say("ДРАКОН ЗАМАСКИРОВАЛСЯ?", kiraelSpeaker, kirael);
        this._say("Ха-ха-ха", thug1speaker, thug1);
        this._say("У-хо-хо", thug2speaker, thug2);
        this._say("Ты такой же болтун, как и всегда, Билл", kiraelSpeaker, kirael);
        this._say("Как-как его зовут?!", thug1speaker, thug1);
        this._say("Представляешь, Горзаниал, его зовут Билл", kiraelSpeaker, kirael);
        this._say("Хе, ну и имечко, скажи, Дзиродиал?", thug1speaker, thug1);
        this._say('Согласен, Горзаниал. Кому придет в голову назвать сына "Билл"?', thug2speaker, thug2);
        this._say("В общем, так. Отдавай сокровище или ребята из тебя решето сделают. Считаю до пяти", kiraelSpeaker, kirael);
        this._say("Четыре", kiraelSpeaker, kirael);
        this._moveMob(thug1, 1, 0);
        this._moveMob(thug2, 0, 1);
        this._moveMob(thug1, 1, 0);
        this._moveMob(thug2, 0, 1);
        this._say("Вот блин", playerSpeaker, player);
        this._fade("Конец первой главы", 5);
        this._wait(4);
        this._changeMap("town_map");
        this._say("Наконец-то я дома", playerSpeaker, player);
        this._finishSequence();
    }
};
