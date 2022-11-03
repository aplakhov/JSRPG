rpg = {
    player_start: {
        hp: 100,
        mana: 0,
        attackMin: 4,
        attackMax: 8,
        attackRadius: 1,
        deathMessages: [
            "На самом деле, конечно, всё было не совсем так...",
            "И тут я такой из последних сил...",
            "Вот так я и умер. Хотя подождите..."
        ]
    },
    goblin: {
        hp: 30,
        attackMin: 2,
        attackMax: 8,
        attackRadius: 1,
        roamRadius: 8,
        aggroRadius: 5,
        enemy: true,
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(179, 188, 157)",
            font: '18px sans-serif',
            portraits: [
                "goblin_portrait",
                "goblin_portrait2",                           
                "goblin_portrait4",
                "goblin_portrait5",                           
            ]                           
        },
        aggroMessages: [
            "Сегодня едим мясо! Молодое мясо!",
            "Ты вкусный?",
            "Ты с какого района?",
            "Деньги есть? А если найду?",
            "Иди сюда, слыш",
            "Есть чё?",
            "А ну сюда иди!"
        ]
    },
    short_sword: {
        type: "sword",
        quality: 2,
        name: "Короткий меч",
        message: "Меч это гораздо лучше, чем палка!",
        reject: "У меня уже есть оружие не хуже",
        equip_img: "sword_equip"
    },
    wooden_shield: {
        type: "shield",
        quality: 1,
        name: "Деревянный щит",
        message: "Этот щит мне идёт",
        reject: "У меня уже есть щит не хуже",
        equip_img: "shield"
    },
    great_shield: {
        type: "shield",
        quality: 2,
        name: "Большой щит",
        message: 'В таверне "О щит" такой же висел вместо вывески',
        reject: "У меня уже есть щит не хуже",
        equip_img: "metal_shield"
    },
}
