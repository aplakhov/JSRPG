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
        ],
        spells: []
    },
    spells: {
        stone: {
            cost: 10,
            radius: 6,
            tooltip: "Создать камень"
        },
        water: {
            cost: 50,
            radius: 6,
            tooltip: "Создать воду"
        },
        fire: {
            cost: 10,
            radius: 6,
            tooltip: "Зажечь огонь"
        },
        lightning: {
            cost: 30,
            radius: 6,
            tooltip: "Вызвать молнию"
        },
        healing: {
            cost: 25,
            radius: 6,
            tooltip: "Исцелить"
        },
        meteor_shower: {
            cost: 60,
            radius: 24,
            tooltip: "Вызвать звездопад"
        }
    },
    goblin: {
        hp: 30,
        attackMin: 2,
        attackMax: 8,
        attackRadius: 1,
        roamRadius: 8,
        aggroRadius: 5,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(179, 188, 157)",
            font: '18px sans-serif',
            portraits: [
                "Portraits/goblin",
                "Portraits/goblin2",                           
                "Portraits/goblin4",
                "Portraits/goblin5",                           
            ]                           
        },
        aggroMessages: [
            "Сегодня едим мясо!",
            "Ты вкусный?",
            "Ты с какого района?",
            "Деньги есть? А если найду?",
            "Иди сюда, слыш",
            "Есть чё?",
            "А ну сюда иди!"
        ]
    },
    scorpio: {
        hp: 30,
        attackMin: 4,
        attackMax: 10,
        attackRadius: 1,
        roamRadius: 5,
        aggroRadius: 5,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(241, 159, 89)",
            font: '18px sans-serif',
            portraits: ["Portraits/scorpio", "Portraits/scorpio", "Portraits/scorpio"]
        },
        aggroMessages: [
            "Щёлк, щёлк! Щёлк.",
            "Скриииии!",
            "Кчак-кчак-кчак. Щёлк."
        ]
    },
    scorpio2: {
        hp: 40,
        attackMin: 6,
        attackMax: 14,
        attackRadius: 1,
        roamRadius: 5,
        aggroRadius: 5,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(241, 159, 89)",
            font: '18px sans-serif',
            portraits: ["Portraits/scorpio", "Portraits/scorpio", "Portraits/scorpio"]
        },
        aggroMessages: [
            "Щёлк, щёлк! Щёлк.",
            "Скриииии!",
            "Кчак-кчак-кчак. Щёлк."
        ]
    },
    scorpio3: {
        hp: 60,
        attackMin: 8,
        attackMax: 18,
        attackRadius: 1,
        roamRadius: 5,
        aggroRadius: 5,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(255, 89, 89)",
            font: '18px sans-serif',
            portraits: ["Portraits/scorpio", "Portraits/scorpio", "Portraits/scorpio"]
        },
        aggroMessages: [
            "ЩЁЛК. ЩЁЛК.",
            "СКРИИИИ.",
            "КЧАК-КЧАК."
        ]
    },        
    slug: {
        hp: 30,
        attackMin: 4,
        attackMax: 10,
        attackRadius: 1,
        roamRadius: 8,
        aggroRadius: 5,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(241, 159, 89)",
            font: '18px sans-serif',
            portraits: ["Portraits/slug", "Portraits/slug", "Portraits/slug"]
        },
        aggroMessages: [
            "Флииип",
            "Ульч-ульч",
            "Глыг-глыг-глыг"
        ]
    },
    wooden_stick: {
        type: "sword",
        quality: 0,
        name: "Дубинка",
        equipImg: "stick_equip",
        inventoryImg: "Inventory/wooden_stick",
        use_message: [
            "*размахивает дубинкой*",
            "*размахивает дубинкой*",
            "Все с дороги, я знаю бодзюцу!"
        ]
    },
    short_sword: {
        type: "sword",
        quality: 2,
        name: "Короткий меч",
        message: "Меч это гораздо лучше, чем палка!",
        reject: "У меня уже есть оружие не хуже",
        equipImg: "sword_equip",
        inventoryImg: "Inventory/short_sword",
        use_message: [
            "*изображает турнирного бойца*",
            "*размахивает направо и налево*",
            "*делает крутой выпад*"
        ]
    },
    wooden_shield: {
        type: "shield",
        quality: 1,
        name: "Деревянный щит",
        message: "Этот щит мне идёт",
        reject: "У меня уже есть щит не хуже",
        equipImg: "shield",
        inventoryImg: "Inventory/wooden_shield",
        use_message: [
            "И как его тут использовать?", 
            "Если бы шел дождь, я бы его использовал вместо зонтика. Но дождя нет",
            "Он деревянный. Его можно, например, поджечь. Но я не хочу",
            "Когда надо, он как-то сам собой используется"
        ]
    },
    great_shield: {
        type: "shield",
        quality: 2,
        name: "Большой щит",
        message: 'В таверне "О щит" такой же висел вместо вывески',
        reject: "У меня уже есть щит не хуже",
        equipImg: "metal_shield",
        inventoryImg: "Inventory/metal_shield",
        use_message: [
            "Когда надо, он как-то сам собой используется",
            "Вот выйду на пенсию, куплю себе таверну и обязательно тоже использую для вывески",
            "*любуется крутым щитом*"
        ]
    },
    kettlebell: {
        name: "Гиря",
        message: "Давно мечтал заняться спортом. Прихвачу эту гирю с собой!",
        inventoryImg: "Inventory/kettlebell",
        use_message: [
            "Займусь спортом чуть позже",
            "Ммммм... не сейчас",
            "Тяжелая. Зачем вообще я таскаю эту штуку?"
        ]
    },
    treasureChest: {
        name: "Сокровища",
        inventoryImg: "Inventory/chest",
        use_message: [
            "*любуется сокровищами*",
            "*жадно рассматривает сокровища*",
            "Вот вернусь в город, и так их использую!",
            "Ура, теперь всю жизнь можно не работать"
        ]        
    },
    lookingGlass: {
        name: "Магическая лупа",
        inventoryImg: "Inventory/lookingglass",
        use_message: [
            "Тут ничего интересного",
            "Опять ботать?",
            "Не-а"
        ]
    },
    scuba: {
        name: "Плавательная маска",
        inventoryImg: "Inventory/scuba",
        use_message: [
            "Не люблю плавать, но она мне идёт",
            "Решено. Если не получится стать магом, пойду в подводный спецназ",
            "Интересно, русалки будут принимать за своего?"
        ]
    },
}
