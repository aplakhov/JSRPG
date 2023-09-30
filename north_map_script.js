characters.northern_woman = {
    text: "Бедная женщина", 
    addText: "Как они тут вообще живут?", 
    portrait: "Dialogs/northern_woman"
};

const northernWomanSpeaker = {
    color: "rgb(20, 15, 3)",
    bgColor: "rgb(138, 129, 124)",
    font: '18px sans-serif',
    portrait: "Dialogs/northern_woman"
}

quests.nothern_main = {
    map: "north_map",
    text: "Починить манапровод",
    place: "house",
    character: "northern_woman",
    introDialog: [
        ["", "Заглушка", []], // 0
    ],
}

function _isNearBrokenPipe() {
    const brokenPipe = world.scriptObjects.brokenPipe;
    const dx = player.x - brokenPipe.x;
    const dy = player.y - brokenPipe.y;
    return (dx >= -2 && dx < 7 && dy >= -2 && dy < 7);
}

class NorthMapScript extends AllScripts {
    constructor(world) {
        super();
        this.triggers.push(() => {
            const tile = world.terrain[player.x][player.y];
            if (tile == TERRAIN_SAND) {
                ui.dialogUI.addMessage("Интересно, что это за белая холодная штука? Никогда такого не видел", playerSpeaker, player);
                return true;
            }
        });

        let house = world.scriptObjects.house;
        house.inside = {
            art: "Places/northern_house",
            header: 'Домик из брёвен',
            description: 
                'Заглушка.',
        }

        this._setupPipe(world);
    }

    _setupPipe(world) {
        let setupNeeded = false;
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
                    setupNeeded = true;
                }
            }
        }
        if (!setupNeeded)
            return;
        for (let x = 0; x < world.width; x++)
            for (let y = 0; y < world.height; y++)
                if (world.terrain[x][y] == TERRAIN_STONE_WALL)
                    world.terrain[x][y] = TERRAIN_GRASS;
        const brokenPipeContent = ['lulux', 'ululu', 'luuux', 'uxuxu', 'llull'];
        const brokenPipe = world.scriptObjects.brokenPipe;
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
                world.addNewObject(o, x + brokenPipe.x, y + brokenPipe.y)
            }
        }
    }

    _isPipePuzzleComplete() {
        let pipes = [
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
        ];
        const brokenPipe = world.scriptObjects.brokenPipe;
        for (let o of world.objects) {
            if (o.initialObj && o.initialObj.name == "Разрушенный манапровод") {
                const x = o.x - brokenPipe.x, y = o.y - brokenPipe.y;
                pipes[x][y] = o.image;
            }
        }
        if (pipes[0][0] != "Pipe/pipe-h" || pipes[4][4] != "Pipe/pipe-h")
            return false;
        let queue = [[1,1]];
        let hasGas = [
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        for (let n = 0; n < queue.length; n++) {
            const x = queue[n][0], y = queue[n][1];
            const p = pipes[x][y];
            if (x > 0 && _hasConnection(p, 'l') && _hasConnection(pipes[x-1][y], 'r') && !hasGas[x-1][y]) {
                hasGas[x-1][y] = 1;
                queue.push([x-1,y]);
            }
            if (x < 4 && _hasConnection(p, 'r') && _hasConnection(pipes[x+1][y], 'l') && !hasGas[x+1][y]) {
                hasGas[x+1][y] = 1;
                queue.push([x+1,y]);
            }
            if (y > 0 && _hasConnection(p, 'u') && _hasConnection(pipes[x][y-1], 'd') && !hasGas[x][y-1]) {
                hasGas[x][y-1] = 1;
                queue.push([x,y-1]);
            }
            if (y < 4 && _hasConnection(p, 'd') && _hasConnection(pipes[x][y+1], 'u') && !hasGas[x][y+1]) {
                hasGas[x][y+1] = 1;
                queue.push([x,y+1]);
            }
        }
        return hasGas[4][4];
    }

    setupRecalculatedData(world) {
        for (let o of world.objects) {
            if (o.initialObj && o.initialObj.name == "Разрушенный манапровод") {
                o.onContact = () => { 
                    _rotatePipe(o);
                    ui.dialogUI.addMessage("Тяжёлые. Только с разбега можно ворочать.", playerSpeaker, player);
                }
            }
        }
    }

    randomizePuzzle(world) {
        for (let o of world.objects) {
            if (o.initialObj && o.initialObj.name == "Разрушенный манапровод") {
                const times = Math.random() * 4;
                for (let n = 0; n < times; n++)
                    _rotatePipe(o); 
            }
        }
    }

    playBreakPuzzleAgainScript() {
        const bunker = world.scriptObjects.bunker;
        const house = world.scriptObjects.house;
        const brokenPipe = world.scriptObjects.brokenPipe;
        const voice1 = {x: bunker.x+1, y: bunker.y};
        const voice2 = {x: bunker.x, y: bunker.y+1};
        const voice3 = {x: bunker.x+2, y: bunker.y+3};
        this._startSequence();
        this._fade("", 2);
        this._wait(1);
        this._do(() => { world.script.viewPoint = bunker; });
        this._wait(1);
        this._say("Опять давление в манапроводе падает? Сколько можно!", kiraelSpeaker, voice1);
        this._say("Кто-то до сих пор им пользуется! Разберитесь с этим, наконец!", kiraelSpeaker, voice1);
        this._say("Для ритуала мне нужна вся мощность!", kiraelSpeaker, voice1);
        this._say("Босс, мы уже сломали все ветки манапровода, кроме нашей.", thug1speaker, voice2);
        this._say("Прям совсем сломали. Всё как ты говорил.", thug2speaker, voice3);
        this._say("Мне не нужны оправдания! Мне нужна мана!", kiraelSpeaker, voice1);
        this._say("Или мне сказать Мануэлю, что тёмный ритуал не будет завершён?", kiraelSpeaker, voice1);
        this._say("Потому что кое-кто не может даже отобрать ману у одинокой женщины?", kiraelSpeaker, voice1);
        this._say("Всё будет тип-топ, босс!", thug1speaker, voice2);
        this._say("Да, босс! Так точно, босс!", thug2speaker, voice3);
        this._say("Вы всё ещё здесь? Марш разбираться!", kiraelSpeaker, voice1);
        this._say("Я имел в виду, на разборку!", kiraelSpeaker, voice1);
        this._say("В смысле, трубу разбирать!", kiraelSpeaker, voice1);
        this._fade("Тем временем...", 4);
        this._wait(1);
        this._teleportPlayer(house.x + 3, house.y + 3);
        this._do(() => { world.script.viewPoint = null; player.frameX = 3; });
        this._wait(3);
        for (let n = 0; n < 5; n++) {
            this._do(() => {
                world.animations.add(new HealingEffect(), {x: house.x + 0.5, y: house.y});
            });
            if (n < 4)
                this._wait(1);
        }
        this._say("Ваш манапровод готов!", playerSpeaker, player);
        this._say("Тыдыщ", thug1speaker, brokenPipe);
        this._say("Спасибо тебе большое, сердешный! Только вот...", northernWomanSpeaker, house);
        this._say("Только вот что?", playerSpeaker, player);
        this._say("Опять не фурычит что-то...", northernWomanSpeaker, house);
        this._do(() => { world.script.randomizePuzzle(world) });
        this._finishSequence();
    }

    playBreakPuzzleAgainScriptShort() {
        const house = world.scriptObjects.house;
        const brokenPipe = world.scriptObjects.brokenPipe;
        this._startSequence();
        this._fade("Починил вроде как", 3);
        this._wait(1);
        this._teleportPlayer(house.x + 3, house.y + 3);
        this._do(() => { player.frameX = 3; });
        this._wait(2);
        for (let n = 0; n < 5; n++) {
            this._do(() => {
                world.animations.add(new HealingEffect(), {x: house.x + 0.5, y: house.y});
            });
            if (n < 4)
                this._wait(1);
        }
        this._say("Теперь точно всё!", playerSpeaker, player);
        this._say("Бэмц", thug2speaker, brokenPipe);
        this._say("Хотя...", playerSpeaker, player);
        this._say("Хрясь", thug1speaker, brokenPipe);
        this._say("Хммм...", playerSpeaker, player);
        this._do(() => { world.script.randomizePuzzle(world) });
        this._finishSequence();
    }

    nextTurn(forced) {
        this._executeTriggers()
        if (_isNearBrokenPipe()) {
            if (this._isPipePuzzleComplete()) {
                if (!this.numTimesPuzzleSolved) {
                    this.playBreakPuzzleAgainScript();
                    this.numTimesPuzzleSolved = 1;
                } else {
                    this.playBreakPuzzleAgainScriptShort();
                    this.numTimesPuzzleSolved++;
                }
            } else {
                if (!this.numTimesPuzzleSolved)
                    ui.dialogUI.addMessage("Ого, как тут всё переломано", playerSpeaker, player);
                else if (this.numTimesPuzzleSolved == 1)
                    ui.dialogUI.addMessage("Что за вандализм? Я же только что всё починил!", playerSpeaker, player);
                else
                    ui.dialogUI.addMessage("Ух, поймаю того, кто за этим стоит, уж я ему покажу!", playerSpeaker, player);
            }
        }
    }

    onItemUse(item) {
        return false;
    }

    onFinishSpell(targetX, targetY, spell) {
        const funnel = world.scriptObjects.funnel;
        const bunker = world.scriptObjects.bunker;
        if (targetX == funnel.x && targetY == funnel.y) {
            let scriptUtterances = [];
            if (spell == "stone" && !this.castStoneAtFunnel) {
                this.castStoneAtFunnel = true;
                scriptUtterances = ["Ай!", "Что за камни вылетают из манапровода?"];
            } else if (spell == "water" && !this.castWaterAtFunnel) {
                this.castWaterAtFunnel = true;
                scriptUtterances = [
                    "Откуда здесь вода?", 
                    "Я только-только развёл Чёрный Костёр Бездны, теперь всё заново начинать?!"];
            } else if (spell == "fire"  && !this.castFireAtFunnel) {
                this.castFireAtFunnel = true;
                scriptUtterances = ["Ой!", "Палец обжёг. Это вообще манапровод или огнемёт?"];
            }
            if (scriptUtterances.length == 0)
                return true; 
            this._startSequence();
            this._fade("", 2);
            this._wait(1);
            this._do(() => { world.script.viewPoint = bunker; });
            this._wait(1);
            for (let u of scriptUtterances)
                this._say(u, kiraelSpeaker, bunker);
            let numEffects = 0;
            if (this.castStoneAtFunnel)
                numEffects++;
            if (this.castWaterAtFunnel)
                numEffects++;
            if (this.castFireAtFunnel)
                numEffects++;
            if (numEffects > 1) {
                this._say("Что за бардак тут творится?! Совершенно невозможно работать!", kiraelSpeaker, bunker);
                this._say("С меня хватит. Собираемся, парни, проведём тёмный ритуал в другом месте", kiraelSpeaker, bunker);
            }
            this._finishSequence();
            return true;
        }
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
        "Pipe/pipe-x": "Pipe/pipe-x",
    };
    pipe.image = nextRotation[pipe.image];
}

function _hasConnection(type, direction) {
    if (direction == 'l')
        return type == "Pipe/pipe-h" || type == "Pipe/pipe-ul" || type == "Pipe/pipe-dl" || type == "Pipe/pipe-x";
    if (direction == 'r')
        return type == "Pipe/pipe-h" || type == "Pipe/pipe-ur" || type == "Pipe/pipe-dr" || type == "Pipe/pipe-x";
    if (direction == 'u')
        return type == "Pipe/pipe-v" || type == "Pipe/pipe-ul" || type == "Pipe/pipe-ur" || type == "Pipe/pipe-x";
    if (direction == 'd')
        return type == "Pipe/pipe-v" || type == "Pipe/pipe-dl" || type == "Pipe/pipe-dr" || type == "Pipe/pipe-x";
}