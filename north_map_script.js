class NorthMapScript extends AllScripts {
    constructor(world) {
        super();
        for (let x = 0; x < world.width; x++) {
            for (let y = 0; y < world.height; y++) {
                if (world.terrain[x][y] == TERRAIN_STONE_WALL) {
                    const leftToo = x > 0 && world.terrain[x-1][y] == TERRAIN_STONE_WALL;
                    const rightToo = x+1 < world.width && world.terrain[x+1][y] == TERRAIN_STONE_WALL;
                    const upToo = y > 0 && world.terrain[x][y-1] == TERRAIN_STONE_WALL;
                    const downToo = y+1 < world.height && world.terrain[x][y+1] == TERRAIN_STONE_WALL;
                    let o = {
                        "class": "DecorativeObject",
                        "zLayer": 1,
                        "name": "Манапровод",
                        "Blocker": true 
                    };
                    if (leftToo && rightToo && upToo && downToo)
                        o["Image"] = "Pipe/pipe-x";
                    else if (leftToo && upToo)
                        o["Image"] = "Pipe/pipe-ul";
                    else if (rightToo && upToo)
                        o["Image"] = "Pipe/pipe-ur";
                    else if (leftToo && downToo)
                        o["Image"] = "Pipe/pipe-dl";
                    else if (rightToo && downToo)
                        o["Image"] = "Pipe/pipe-dr";
                    else if (upToo || downToo)
                        o["Image"] = "Pipe/pipe-v";
                    else
                        o["Image"] = "Pipe/pipe-h";
                    world.addNewObject(o, x, y);
                }
            }
        }
        for (let x = 0; x < world.width; x++)
            for (let y = 0; y < world.height; y++)
                if (world.terrain[x][y] == TERRAIN_STONE_WALL)
                    world.terrain[x][y] = TERRAIN_GRASS;
    }

    setupRecalculatedData(world) {
    }

    nextTurn(forced) {
        this._executeTriggers()
    }

    onItemUse(item) {
        return false;
    }

    onFinishSpell(targetX, targetY, spell) {
        return false;
    }

    checkCanCast(targetX, targetY, spell) {
        return true;
    }
};
