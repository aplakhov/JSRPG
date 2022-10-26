rpg = {
    player_start: {
        hp: 100,
        mana: 0,
        attackMin: 4,
        attackMax: 8,
        attackRadius: 1
    },
    goblin: {
        hp: 30,
        attackMin: 2,
        attackMax: 8,
        attackRadius: 1,
        roamRadius: 8,
        aggroRadius: 5,
        enemy: true
    },
    short_sword: {
        type: "sword",
        quality: 2,
        name: "Короткий меч",
        message: "Гораздо лучше, чем палка!",
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
