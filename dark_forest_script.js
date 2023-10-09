class DarkForestMapScript extends AllScripts {
    constructor(world) {
        super();
        let dwarf_house = world.scriptObjects.dwarf_house;
        dwarf_house.inside = {
            art: "Places/lone_dwarf_house",
            header: 'Дом гнома глубоко в тёмном лесу',
            description: 
                'Очень странное место. Обычно гномы не живут в лесу, а уж тем более в таком лесу, где и эльфу-то станет не по себе.'
        }
        let wolfMother = world.scriptObjects.mother;
        wolfMother.aggroRadius = 1;
        wolfMother.roamRadius = 0;
    }

    setupRecalculatedData(world) {
        const baseTile = {x: 0, y: 0} 
        world.animations.add(new VisualDarkness(), baseTile);
    }

    nextTurn(forced) {
        this._executeTriggers()
    }

    onItemUse(item) {
        return false;
    }
};
