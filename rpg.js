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
        },
        earth_ear: {
            cost: 50,
            duration: 60,
            tooltip: "Слушать дрожь земли"
        }
    },
    wooden_stick: {
        type: "sword",
        quality: 0,
        name: "Дубинка",
        equipImg: "Equip/stick",
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
        equipImg: "Equip/sword",
        inventoryImg: "Inventory/short_sword",
        use_message: [
            "*изображает турнирного бойца*",
            "*размахивает направо и налево*",
            "*делает крутой выпад*"
        ]
    },
    scimitar: {
        type: "sword",
        quality: 3,
        name: "Древний ятаган",
        message: "Древний, но очень острый!",
        reject: "У меня уже есть оружие не хуже",
        equipImg: "Equip/scimitar",
        inventoryImg: "Inventory/scimitar",
        mapImg: "scimitar",
        use_message: [
            "Ууууу! Я прииизрак!",
            "Тысячи лет я.... как там было дальше?",
            "Кроваво-призрачный огонь на лезвии. Красота!"
        ]
    },
    scimitar2: {
        type: "sword",
        quality: 3,
        name: "Сабля разбойника",
        message: "Тяжёлая.",
        reject: "У меня уже есть оружие не хуже",
        equipImg: "Equip/scimitar2",
        inventoryImg: "Inventory/scimitar2",
        mapImg: "scimitar2",
        use_message: [
            "Тысяча чертей!",
            "Каналья!"
        ]
    },
    wooden_shield: {
        type: "shield",
        quality: 1,
        name: "Деревянный щит",
        message: "Этот щит мне идёт",
        reject: "У меня уже есть щит не хуже",
        equipImg: "Equip/shield",
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
        equipImg: "Equip/metal_shield",
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
    mop: {
        type: "sword",
        quality: 0,
        name: "Швабра с сухой тряпкой",
        equipImg: "Equip/mop",
        inventoryImg: "Inventory/dry_mop",
        use_message: [
            "Тряпку бы намочить где-нибудь",
            "Говорила мне мама, учись хорошо, а то станешь уборщиком",
            "Смысл возить сухой тряпкой? Только пыль подымать"
        ]
    },
    wet_mop: {
        type: "sword",
        quality: 0,
        name: "Швабра с мокрой тряпкой",
        equipImg: "Equip/mop",
        inventoryImg: "Inventory/mop",
        use_message: [
            "И вот тут протрём...",
            "Не о карьере уборщика я мечтал",
            "А это что, паутина? Кыш отсюда!",
            "Что это тут за грязное пятно?",
            "Хммм, я точно должен тут всё убирать?"
        ]
    },
    sausage: {
        name: "Колбаса",
        inventoryImg: "Inventory/sausage",
        use_message: [
            "Хорошо, ещё маленький кусочек.",
            "Она вообще когда-нибудь закончится?",
            "Нет, правда, я не голоден.",
            "Серьёзно, я не хочу есть."
        ]        
    },    
}
