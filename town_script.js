class TownMapScript extends AllScripts {
    constructor(world) {
        super();
        let tavern = world.scriptObjects.tavern;
        tavern.occupiedTiles = [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ];
        tavern.inside = {
            art: "Places/tavern",
            header: 'Таверна "О щит"',
            description: 
                'Пока вы путешествовали, здесь ничего не поменялось. ' +
                'Внутри только хозяин и несколько гномов, которые проводят в таверне ' + 
                'столько времени, что им проще было бы переселиться сюда насовсем. ' + 
                'Они обсуждают свои дела и игнорируют вас.',
        }
        let tower = world.scriptObjects.tower;
        tower.occupiedTiles = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
        tower.zLayer = 2;
        tower.inside = {
            art: "Places/tower",
            header: 'Башня факультета теоретической магии',
            description: 
                'Пока вы путешествовали, здесь ничего не поменялось. ' +
                'Но пересдачи всё ближе, а у вас совсем не было времени подготовиться. ' + 
                'Может быть, удастся договориться об отсрочке?',
        }
        let house = world.scriptObjects.house;
        house.occupiedTiles = [
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
        ]
        house.inside = {
            art: "Places/house",
            header: 'Небольшой, но очень уютный дом',
            description: 
                'В нём есть кровать. Спать в кровати значительно приятней, чем чёрт-те где, ' + 
                'как это обычно бывает в приключениях',
        }
        let elves = world.scriptObjects.elvenHouse;
        elves.occupiedTiles = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
          ]
        elves.inside = {
            art: "Places/elves",
            header: elves.hint,
            description: 'Эльфы любят жить на деревьях. Хотя на птиц они вроде бы не похожи.',
        }
        let church = world.scriptObjects.church;
        church.occupiedTiles = [
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0],
          ]
        church.zLayer = 2;
        church.inside = {
            art: "Places/church",
            header: church.hint,
            description: 
                'Церковь мировой любви. ' +
                'Никто не знает, что такое "мировая любовь", но главная священница точно всех любит.',
        }
    }

    nextTurn(forced) {
        this._executeTriggers();
        let fountain = world.scriptObjects.fountain;
        if (dist2obj(player, fountain) == 1) {
            if (player.hp < player.stats.hp) {
                world.animations.add(new HealingEffect(), player);
                player.applyHealing(1000);
                let messages = [
                    "Всё-таки классно придумали. Поставить в городе фонтан с живой водой.",
                    "Фонтан, поправляющий здоровье, напротив таверны. Совпадение? Не думаю.",
                    "Что может быть лучше глотка из фонтана с живой водой?",
                    "Вот я и дома. А дома, как говорится, и фонтаны помогают."
                ]
                ui.dialogUI.addMessage(randomFrom(messages), playerSpeaker, player);
            }
        }

    }

    checkCanCast() {
        let messages = [
            "Магию в городе использовать запрещено.",
            "За такое и оштрафовать могут. А у меня и так денег нет.",
            "Колдовать в районе университета можно только на занятиях. Или на экзамене. Или на пересдаче.",
            "В городе использовать опасные заклинания нельзя. В тюрьму посадят. Хотя вообще-то тюрьмы у нас нет."
        ]
        ui.dialogUI.addMessage(randomFrom(messages), playerSpeaker, player);
        return false;
    }

    onItemUse(item) {
        if (item == "lookingGlass" && dist2obj(player, world.scriptObjects.fountain) == 1 && !playerKnowsSpell("healing")) {
            const msgs = [
                "Я пил из этого фонтана сто раз!",
                "Надо бы наконец разобраться, как он работает."
            ]
            discoverNewSpell(msgs, "healing");    
            return true;
        }
        return false;
    }
};
