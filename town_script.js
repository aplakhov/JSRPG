class TownMapScript extends AllScripts {
    constructor(world) {
        super();
        let tavern = world.scriptObjects.tavern;
        tavern.occupiedTiles = [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ];
        tavern.coolImage = makeImage("tavern_art");
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
        tower.zLayer = 2
        tower.coolImage = makeImage("tower_art");
        let house = world.scriptObjects.house;
        house.occupiedTiles = [
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
        ]
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
        elves.coolImage = makeImage("elves_art");
        let church = world.scriptObjects.church;
        church.occupiedTiles = [
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0],
          ]
        church.coolImage = makeImage("church_art");
        church.zLayer = 2;
    }

    initGoals(goals) {
        goals.addGoal("1. Познакомиться со всеми жителями города");
    }

    nextTurn(forced) {
        this._executeTriggers();
    }
    onDraw() {
    }
    onPlayerDeath() {
    }
    onCast(targetX, targetY) {
    }
    onItemUse(item) {
        return false;
    }
};
