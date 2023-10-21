class DungeonScript extends AllScripts {
    constructor(world) {
        super();
    }

    setupRecalculatedData(world) {
    }

    nextTurn(forced) {
        this._executeTriggers()
    }

    onItemUse(item) {
        return false;
    }
};
