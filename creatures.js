creatures = {
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
        ],
        normalImage: "Animations/goblin",
        humanoidDrawing: 1,
        bonesImg: "dead_goblin"
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
        ],
        normalImage: "Animations/dust_scorpio",
        numAnimFrames: 2,
        rotatedDrawing: 1,
        bonesImg: "dead_scorpio"
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
        ],
        normalImage: "Animations/black_scorpio",
        numAnimFrames: 2,
        rotatedDrawing: 1,
        bonesImg: "dead_scorpio"
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
        ],
        normalImage: "Animations/scorpion_king",
        numAnimFrames: 2,
        rotatedDrawing: 1,
        bonesImg: "dead_scorpion_king"
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
        ],
        normalImage: "Animations/slug",
        numAnimFrames: 4,
        rotatedDrawing: 1,
        bonesImg: "dead_slug"
    },
    yeti: {
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
            bgColor: "rgb(161, 196, 196)",
            font: '18px sans-serif',
            portraits: ["Portraits/yeti1", "Portraits/yeti2", "Portraits/yeti1", "Portraits/yeti2"]
        },
        aggroMessages: [
            "Гррррр.",
            "Урр-уррр.",
            "Моя твоя кушать.",
            "Твоя вкусный мясо."
        ],
        normalImage: "Animations/yeti",
        humanoidDrawing: 1,
        bonesImg: "dead_yeti",
        hpBarY: -5
    },
    ghost: {
        hp: 60,
        attackMin: 6,
        attackMax: 10,
        attackRadius: 1,
        roamRadius: 5,
        aggroRadius: 5,
        maxChaseRadius: 6,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(161, 196, 196)",
            font: '18px sans-serif',
            portraits: ["Portraits/ghost1", "Portraits/ghost2", "Portraits/ghost1", "Portraits/ghost2"]
        },
        aggroMessages: [
            "...Запах живой плоти...",
            "...Зависть к тем, кто дышит...",
            "...Вечность позади, и столько же осталось...",
            "...Прах к праху..."
        ],
        normalImage: "Animations/ghost",
        humanoidDrawing: 1,
        bonesImg: "dead_ghost",
        hpBarY: -5,
        vulnerable: "wet_mop",
        vulnerabilityMessage: {
            wooden_stick: "Бить призрака палкой бессмысленно",
            short_sword: "Тыкать в привидение мечом бессмысленно",
            mop: "Сухой тряпки призраки тоже не боятся",
            wet_mop: ["Нна!", "Шмяк!", "Получай!", "Плюх!"],
            "": "Этим бить призрака бесполезно"
        }
    },
    black_ghost: {
        hp: 40,
        attackMin: 6,
        attackMax: 14,
        attackRadius: 1,
        roamRadius: 5,
        aggroRadius: 5,
        maxChaseRadius: 6,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(161, 196, 196)",
            font: '18px sans-serif',
            portraits: ["Portraits/black_ghost1", "Portraits/black_ghost2", "Portraits/black_ghost1", "Portraits/black_ghost2"]
        },
        aggroMessages: [
            "...Я так давно не спала...",
            "...Живое станет мёртвым...",
            "...Всё как и тысячу лет назад...",
            "...Пыль, пыль и тлен..."
        ],
        normalImage: "Animations/black_ghost",
        humanoidDrawing: 1,
        bonesImg: "dead_black_ghost",
        hpBarY: -5,
        vulnerable: "wet_mop",
        vulnerabilityMessage: {
            wooden_stick: "Бить призрака палкой бессмысленно",
            short_sword: "Тыкать в привидение мечом бессмысленно",
            mop: "Сухой тряпки призраки тоже не боятся",
            wet_mop: ["Нна!", "Шмяк!", "Получай!", "Плюх!"],
            "": "Этим бить призрака бесполезно"
        }
    },
    wolf: {
        hp: 40,
        attackMin: 6,
        attackMax: 14,
        attackRadius: 1,
        roamRadius: 3,
        aggroRadius: 5,
        enemy: true,
        movement: "land_mob",
        speaker: {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(128, 128, 128)",
            font: '18px sans-serif',
            portraits: ["Portraits/wolf1", "Portraits/wolf2", "Portraits/wolf1", "Portraits/wolf2"]
        },
        aggroMessages: [
            "Уууууу!",
            "Рррр.",
            "*Молча сверкает глазами*"
        ],
        normalImage: "Animations/wolf",
        twoSidedDrawing: 1,
        bonesImg: "dead_wolf",
    },
    pirate: {
        hp: 40,
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
            "Йо-хо-хо!"
        ],
        normalImage: "Animations/pirate",
        humanoidDrawing: 1,
        bonesImg: "dead_pirate",
        hpBarY: -4
    },
    ogre: {
        hp: 100,
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
            "Йо-хо-хо!"
        ],
        normalImage: "Animations/ogre",
        humanoidDrawing: 1,
        bonesImg: "dead_ogre",
        hpBarY: -7
    },
}