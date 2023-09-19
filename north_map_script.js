characters.northern_woman = {
    text: "Бедная женщина", 
    addText: "Как они тут вообще живут?", 
    portrait: "Dialogs/northern_woman"
};

quests.nothern_main = {
    map: "north_map",
    text: "Починить манапровод",
    place: "house",
    character: "northern_woman",
    introDialog: [
        ["", "Заглушка", []], // 0
    ],
}

class NorthMapScript extends AllScripts {
    constructor(world) {
        super();

        let house = world.scriptObjects.house;
        house.inside = {
            art: "Places/northern_house",
            header: 'Домик из брёвен',
            description: 
                'Заглушка.',
        }

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
        const brokenPipeContent = ['lulux', 'ululu', 'luuux', 'uxuxu', 'llull'];
        const brokenPipe = {x: 12, y: 32} //world.scriptObjects.brokenPipe;
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                const pipeType = brokenPipeContent[y][x];
                let img;
                if (pipeType == 'l')
                    img = randomFrom(["Pipe/pipe-v", "Pipe/pipe-h"]);
                else if (pipeType == 'u')
                    img = randomFrom(["Pipe/pipe-ul", "Pipe/pipe-ur", "Pipe/pipe-dl", "Pipe/pipe-dr"]);
                else
                    img = "Pipe/pipe-x";
                let o = {
                    "class": "DecorativeObject",
                    "zLayer": 1,
                    "name": "Разрушенный манапровод",
                    "Image": img 
                };
                let added = world.addNewObject(o, x + brokenPipe.x, y + brokenPipe.y)
                if (pipeType != 'x')
                    added.onContact = () => { _rotatePipe(added); } 
            }
        }
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

function _rotatePipe(pipe) {
    const nextRotation = {
        "Pipe/pipe-v": "Pipe/pipe-h",
        "Pipe/pipe-h": "Pipe/pipe-v",
        "Pipe/pipe-ul": "Pipe/pipe-ur",
        "Pipe/pipe-ur": "Pipe/pipe-dr",
        "Pipe/pipe-dr": "Pipe/pipe-dl",
        "Pipe/pipe-dl": "Pipe/pipe-ul",
    };
    pipe.image = nextRotation[pipe.image];
}