function _mopGhostSpeaker() {
    return {
        color: creatures.black_ghost.speaker.color,
        bgColor: creatures.black_ghost.speaker.bgColor,
        font: creatures.black_ghost.speaker.font,
        portrait: images.prepare("Portraits/black_ghost2")
    }
};

class PalaceMapScript extends AllScripts {
    constructor(world) {
        super();
        this.triggers.push(() => {
            let mopGhost = world.scriptObjects.mopGhost;
            let mopGhostSpeaker = _mopGhostSpeaker();
            if (dist2obj(player, mopGhost) == 1) {
                const newImg = images.prepare("Animations/black_ghost_without_mop");
                this._startSequence();
                this._say("Здравствуйте, бабушка", playerSpeaker, player);
                this._do(() => { player.frameX = 1 });
                this._say("...и кто это тут у нас такой живой...", mopGhostSpeaker, mopGhost);
                this._say("Меня зовут Билл. Вы не видели тут профессора в серой шляпе?", playerSpeaker, player);
                this._say("...вообще ничего из-за этой пыли не вижу...", mopGhostSpeaker, mopGhost);
                this._say("Не так уж тут и пыльно", playerSpeaker, player);
                this._say("...грязно... даже призраки заводятся...", mopGhostSpeaker, mopGhost);
                this._say("Вы же понимаете, что вы тоже?.. Впрочем, неважно", playerSpeaker, player);
                this._say("...эх, что за жизнь... никакого отдыха...", mopGhostSpeaker, mopGhost);
                this._say("Хотите, помогу?", playerSpeaker, player);
                this._say("...ооо.... от такого не отказываются...", mopGhostSpeaker, mopGhost);
                this._do(() => {
                    mopGhost.image = newImg;
                    mopGhost.hint = "Призрак без швабры";
                    player.takeItem("mop"); 
                })
                world.script._finishSequence();
                return true;
            }
        });
        this.triggers.push(() => {
            let well = world.scriptObjects.finalWell;
            if (dist2obj(player, well) == 1) {
                this.playDiscoverScript();
                return true;
            }
        });
        this.mechanicArmX = -3;
        this.mechanicArmY = 1;
    }

    setupRecalculatedData(world) {
        let wheel = world.scriptObjects.wheel;
        world.animations.add(new MechanicArm(), wheel);
    }

    nextTurn(forced) {
        this._executeTriggers()
        let mopGhost = world.scriptObjects.mopGhost;
        if (dist2obj(player, mopGhost) <= 16) {
            if (Math.random() < 0.1) {
                const mopGhostSpeech = [
                    "...и ходют, и ходют...",
                    "...и топчут, и топчут...",
                    "...десять тысяч лет как следует не убирали...",
                    "...вот от пыли и заводятся тут всякие...",
                    "...при царе такой грязюки-то не было...",
                    "...все мусорят, только я убирай...",
                    "...эктоплазму сухой шваброй не отмыть...",
                ];
                ui.dialogUI.addMessage(randomFrom(mopGhostSpeech), _mopGhostSpeaker(), mopGhost);
            }
        }
        this._checkPuzzle1();
        this._checkPuzzle2();
    }

    onItemUse(item) {
        if (item == "mop" && _hasWaterNearby()) {
            player.loseItem("mop");
            player.takeItem("wet_mop");
            ui.dialogUI.addMessage("Теперь уборка пойдёт на славу", playerSpeaker, player);
            return true;
        }
        return false;
    }

    _isGhost(t) {
        return t && t.stats && (t.stats == creatures.ghost || t.stats == creatures.black_ghost) && !t.dead;
    }

    _ghostNearby(targetX, targetY) {
        let t = world.pathfinding.isOccupied(targetX, targetY);
        if (this._isGhost(t))
            return t;
        t = world.pathfinding.isOccupied(targetX + 1, targetY);
        if (this._isGhost(t))
            return t;
        t = world.pathfinding.isOccupied(targetX, targetY + 1);
        if (this._isGhost(t))
            return t;
        t = world.pathfinding.isOccupied(targetX - 1, targetY);
        if (this._isGhost(t))
            return t;
        t = world.pathfinding.isOccupied(targetX, targetY - 1);
        if (this._isGhost(t))
            return t;
        return null;            
    }

    onFinishSpell(targetX, targetY, spell) {
        if (spell == "healing") {
            let t = this._ghostNearby(targetX, targetY);
            if (t) {
                t.stun(300);
                if (t.stats == creatures.black_ghost) {
                    const messages = [
                        "Стоп. Почему я злюсь и куда я бегу? Надо бы это обдумать.",
                        "Я же умерла. Почему бы не постоять спокойно?",
                        "Всё это какой-то бред. Мне нужно отдохнуть.",
                        "Кажется, я больна. Здоровые мёртвые не бродят, а лежат себе."
                    ]
                    t.say(randomFrom(messages));
                } else {
                    const messages = [
                        "Достойному мужу не подобает бегать и суетиться. Особенно если он мёртв.",
                        "Припоминаю, что я умер. Обдумаю это.",
                        "Не для того я умер, чтобы работать охранником.",
                        "Боюсь, я болен. Возможно, у меня привидянка."
                    ]
                    t.say(randomFrom(messages));
                }
                return true;
            }
        }
        return false;
    }

    checkCanCast(targetX, targetY, spell) {
        if (spell == "stone" && this._isInsideTeleportZone(targetX, targetY)) {
            this._puzzle1throwStone(targetX, targetY);
            return false;
        }
        return true;
    }

    _isInsideTeleportZone(x, y) {
        let puzzle1 = world.scriptObjects.puzzle1;
        return x >= puzzle1.x && x < puzzle1.x + 15 && y >= puzzle1.y && y < puzzle1.y + 15        
    }

    _getTeleportCellIdx(x, y, nextX, nextY) {
        let puzzle1 = world.scriptObjects.puzzle1;
        const currentCellX = Math.floor((x - puzzle1.x) / 3); 
        const currentCellY = Math.floor((y - puzzle1.y) / 3); 
        const nextCellX = Math.floor((nextX - puzzle1.x) / 3);
        const nextCellY = Math.floor((nextY - puzzle1.y) / 3);
        if (currentCellX == nextCellX && currentCellY == nextCellY)
            return -1;
        if (currentCellX < 0 || currentCellX >= 5)
            return -1;
        if (currentCellY < 0 || currentCellY >= 5)
            return -1;
        let direction;
        if (nextCellX > currentCellX)
            direction = 0;
        else if (nextCellY > currentCellY)
            direction = 1;
        else if (nextCellX < currentCellX)
            direction = 2;
        else if (nextCellY < currentCellY)
            direction = 3;
        const currentCellId = currentCellX + currentCellY * 5;
        return this.puzzle1data[currentCellId][direction];
    }
    
    _checkPuzzle1() {
        if (this._isInsideTeleportZone(player.x, player.y)) {
            let puzzle1 = world.scriptObjects.puzzle1;
            if (!this.puzzle1data)
                this.puzzle1data = [[2, 24, -1, -1], [15, 2, 19, -1], [5, 10, 16, -1], [0, 5, 0, -1], [-1, 6, 9, -1], [10, 2, -1, 6], [15, 3, 21, 18], [17, 3, 4, 22], [2, 15, 1, 24], [-1, 19, 11, 23], [14, 15, -1, 7], [4, 8, 1, 1], [11, 17, 7, 8], [8, 22, 14, 6], [-1, 23, 2, 21], [21, 0, -1, 24], [1, 19, 7, 19], [6, 0, 21, 3], [1, 7, 13, 24], [-1, 3, 0, 18], [23, -1, -1, 22], [3, -1, 4, 19], [3, -1, 10, 4], [9, -1, 22, 11], [-1, -1, 9, 2]];
            if (this.previouslyInPuzzle) {
                const teleportToCell = this._getTeleportCellIdx(
                    this.previouslyInPuzzle.x, this.previouslyInPuzzle.y, player.x, player.y
                );
                if (teleportToCell >= 0) {
                    const teleportX = teleportToCell % 5, teleportY = Math.floor(teleportToCell / 5);
                    const oldX = player.x, oldY = player.y;
                    player.teleport(teleportX * 3 + puzzle1.x + 1, teleportY * 3 + puzzle1.y + 1);
                    world.animations.add(new TeleportEffect(oldX, oldY, player.x, player.y), player);
                    world.animations.add(new HealingEffect(), player);
                    ui.dialogUI.addMessage("Ой.", playerSpeaker, player);
                    player.frameX = 0;
                }
            }
            this.previouslyInPuzzle = {x: player.x, y: player.y}
        }
    }

    _puzzle1throwStone(targetX, targetY) {
        const origin = {x: player.pixelX.get() + 16, y: player.pixelY.get() + 16};
        const direction = {x: targetX*tileSize + 16 - origin.x, y: targetY*tileSize + 16 - origin.y};
        world.animations.add(new NonEuclideanStone(origin, direction), player);
        setTimeout(() => {
            ui.dialogUI.addMessage("Интересно тут себя камни ведут.", playerSpeaker, player);
        }, 1000);
    }

    _checkPuzzle2() {
        this._checkLever(world.scriptObjects.lever_left, -1, 0);
        this._checkLever(world.scriptObjects.lever_right, 1, 0);
        this._checkLever(world.scriptObjects.lever_up, 0, -1);
        this._checkLever(world.scriptObjects.lever_down, 0, 1);
    }

    _checkLever(lever, dx, dy) {
        if (player.x == lever.x && player.y == lever.y) {
            lever.image = images.prepare("lever_on");
            const nextX = this.mechanicArmX + dx;
            const nextY = this.mechanicArmY + dy;
            const wheel = world.scriptObjects.wheel;
            const well = world.scriptObjects.finalWell;
            const atTarget = wheel.x + nextX == well.x && wheel.y + nextY == well.y;
            if (atTarget || world.pathfinding.isPassable(wheel.x + nextX, wheel.y + nextY, null)) {
                this.mechanicArmX = nextX;
                this.mechanicArmY = nextY;
                if (atTarget && !this.mainQuestDone) {
                    this.mainQuestDone = true;
                    this.playFinalScript();
                }
            }
        } else {
            lever.image = images.prepare("lever_off");
        }
    }

    playDiscoverScript() {
        let well = world.scriptObjects.finalWell;
        let fireMageSpeaker = {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(251, 174, 104)",
            font: '18px sans-serif',
            portrait: null
        };
        this._startSequence();
        this._say("У-у-у.", playerSpeaker, player);
        this._say("У-у-у-у-у...", fireMageSpeaker, well);
        this._say("Аууу!", playerSpeaker, player);
        this._say("Аууу-аууу...", fireMageSpeaker, well);
        this._say("Эгегей!", playerSpeaker, player);
        this._say("Да здесь я, здесь!", fireMageSpeaker, well);
        this._say("Стоп. В колодце что, кто-то сидит?", playerSpeaker, player);
        this._say("А вы как думаете? Помогите мне выбраться!", fireMageSpeaker, well);
        this._say("Блистательный и восхитительный магистр, это ведь вы?", playerSpeaker, player);
        this._say("Ну а кто ещё? Доставайте меня уже!", fireMageSpeaker, well);
        this._say("...А как?", playerSpeaker, player);
        this._say("Киньте верёвку!", fireMageSpeaker, well);
        this._say("...У меня верёвки нет.", playerSpeaker, player);
        this._say("Значит, придумайте что-нибудь! Действуйте!", fireMageSpeaker, well);
        this._finishSequence();
    }

    playFinalScript() {
        this._startSequence();
        this._fade("Так, с колодцем вроде бы разобрались...", 4);
        this._wait(2);
        let scriptPlace = world.scriptObjects.finalWell;
        this._teleportPlayer(scriptPlace.x + 4, scriptPlace.y + 1);
        let fireMage = this._addMob(scriptPlace.x, scriptPlace.y + 1, "Профессор магии огня", "fire_mage");
        let fireMageSpeaker = {
            color: "rgb(10, 10, 10)",
            bgColor: "rgb(251, 174, 104)",
            font: '18px sans-serif',
            portrait: images.prepare("Dialogs/fire_mage")
        };
        this._wait(2);
        this._movePlayer(-1, 0);
        this._movePlayer(-1, 0);
        this._wait(1);
        this._say("Здравствуйте. Я тут это. Хотел договориться о пересдаче.", playerSpeaker, player);
        this._say("...", fireMageSpeaker, fireMage);
        this._say("Так, а вы вообще кто?", fireMageSpeaker, fireMage);
        this._say("Я Билл. Я у вас на лекциях за колонной сидел.", playerSpeaker, player);
        this._say("А сюда-то вы как попали? Вас Кираэль прислал?", fireMageSpeaker, fireMage);
        this._say("Кираэль? Опять он?!", playerSpeaker, player);
        this._say("Да, именно он рассказал мне, что деталь Голема спрятана в здешнем святилище.", fireMageSpeaker, fireMage);
        this._say("Деталь Голема?", playerSpeaker, player);
        this._say("Да, только представьте себе: мы с ним добыли деталь того самого Голема!", fireMageSpeaker, fireMage);
        this._say("Вам, как нашему студенту, конечно же, не надо объяснять, что это значит.", fireMageSpeaker, fireMage);
        this._say("Конечно.", playerSpeaker, player);
        this._wait(1);
        this._say("...А покажете мне?", playerSpeaker, player);
        this._say("Деталь была у Кираэля, когда я случайно упал в колодец.", fireMageSpeaker, fireMage);
        this._say("Случайно?", playerSpeaker, player);
        this._say("Абсолютно случайно.", fireMageSpeaker, fireMage);
        this._say("К счастью, эльф не растерялся и сразу побежал за помощью!", fireMageSpeaker, fireMage);
        this._say("Понятно.", playerSpeaker, player);        
        this._wait(2);
        this._say("...", playerSpeaker, player);        
        this._say("...", fireMageSpeaker, fireMage);
        this._say("Так, ладно, раз уж вы меня вытащили.", fireMageSpeaker, fireMage);
        this._say("Давайте зачётку.", fireMageSpeaker, fireMage);
        this._finishQuest("town_intro_fire_magic");
        this._finishQuest("town_find_fire_mage");
        this._fade("Путешествовать с великим магистром оказалось проще...", 5);
        this._wait(3);
        this._moveMob(fireMage, -fireMage.x, -fireMage.y); // hide fire mage to (0,0) in case if player visits this map once more
        this._changeMap("town_map", "desert_test_map");
        this._finishSequence();
    }
};

class MechanicArm {
    constructor() {
        this.img = images.prepare("MapObjects/mech_arm");
        this.wheelImg = images.prepare("MapObjects/wheel");
    }

    draw(ctx, offsetInPixels, _) {
        const wheel = world.scriptObjects.wheel;
        const visible1 = world.vision.isVisibleSafe(wheel.x, wheel.y);
        const visible2 = world.vision.isVisibleSafe(wheel.x + world.script.mechanicArmX, wheel.y + world.script.mechanicArmY);
        if (!visible1 && !visible2)
            return false;
        const well = world.scriptObjects.finalWell;
        const atTarget = well.x == wheel.x + world.script.mechanicArmX && well.y == wheel.y + world.script.mechanicArmY;
        const colorLight = "rgb(189,149,96)";
        const colorMedium = "rgb(140,104,20)";
        const colorDark = "rgb(107,79,16)";
        const x0 = offsetInPixels.x + 16, y0 = offsetInPixels.y + 16;
        const dx = world.script.mechanicArmX * tileSize - 16;
        let dy = world.script.mechanicArmY * tileSize - 16;
        if (atTarget)
            dy -= 8;
        const r = Math.sqrt(dx * dx + dy * dy);
        const unitNormalX = -dy / r, unitNormalY = dx / r;
        ctx.lineWidth = 1;
        // inner - light
        ctx.strokeStyle = colorLight;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + dx, y0 + dy);
        ctx.stroke();
        // inner - darker
        ctx.strokeStyle = colorMedium;
        ctx.beginPath();
        ctx.moveTo(x0 - unitNormalX, y0 - unitNormalY);
        ctx.lineTo(x0 - unitNormalX + dx, y0 - unitNormalY + dy);
        ctx.stroke();
        // outer bounds
        ctx.strokeStyle = colorDark;
        ctx.beginPath();
        ctx.moveTo(x0 - 2*unitNormalX, y0 - 2*unitNormalY);
        ctx.lineTo(x0 - 2*unitNormalX + dx, y0 - 2*unitNormalY + dy);
        ctx.moveTo(x0 + unitNormalX, y0 + unitNormalY);
        ctx.lineTo(x0 + unitNormalX + dx, y0 + unitNormalY + dy);
        ctx.stroke();
        // arm    
        images.draw(ctx, this.img, x0 + dx - 16, y0 + dy - 16);
        // shadow
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.23)";
        ctx.beginPath();
        ctx.moveTo(x0, y0 + 12);
        ctx.lineTo(x0 + dx, y0 + dy + 16);
        ctx.stroke();
        ctx.lineWidth = 1;
        // wheel
        images.draw(ctx, this.wheelImg, offsetInPixels.x - 16, offsetInPixels.y - 16);
        return false;
    }
};

class NonEuclideanStone {
    constructor(origin, direction) {
        this.position = origin;
        this.direction = direction;
        this.prevTime = 0;
    }

    _screenX(offsetInPixels) {
        return offsetInPixels.x + this.position.x - this.baseTile.x*tileSize - halfTileSize; 
    }
    
    _screenY(offsetInPixels) {
        return offsetInPixels.y + this.position.y - this.baseTile.y*tileSize - halfTileSize;
    }

    draw(ctx, offsetInPixels, time) {
        if (time > 3)
            return true;
        let puzzle1 = world.scriptObjects.puzzle1;
        const prevX = this.position.x/tileSize, prevY = this.position.y/tileSize;
        this.position.x += 2 * (time - this.prevTime) * this.direction.x;
        this.position.y += 2 * (time - this.prevTime) * this.direction.y;
        const nextX = this.position.x/tileSize, nextY = this.position.y/tileSize;
        this.prevTime = time;
        const teleportToCell = world.script._getTeleportCellIdx(prevX, prevY, nextX, nextY);
        if (teleportToCell >= 0) {
            // teleport
            const teleportX = teleportToCell % 5, teleportY = Math.floor(teleportToCell / 5);
            const pixelX = (teleportX * 3 + puzzle1.x + 1) * tileSize + 16;
            const pixelY = (teleportY * 3 + puzzle1.y + 1) * tileSize + 16;
            ctx.strokeStyle = "rgb(200,255,255)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this._screenX(offsetInPixels), this._screenY(offsetInPixels));
            this.position.x = pixelX;
            this.position.y = pixelY;
            ctx.lineTo(this._screenX(offsetInPixels), this._screenY(offsetInPixels));
            ctx.stroke();
            // find what to do next
            const puzzleHint = [
                ['d', 24], ['r', 15], ['d', 10], ['d', 5], ['l', 9],
                ['r', 10], ['u', 18], ['u', 22], ['u', 24], ['u', 23],
                ['u', 7], ['r', 4], ['l', 7], ['d', 22], ['d', 23],
                ['u', 24], ['l', 7], ['r', 6], ['d', 7], ['u', 18],
                ['u', 22], ['l', 4], ['d', -1], ['l', 22], ['l', 9]
            ];
            const hint = puzzleHint[teleportToCell][0];
            if (hint == 'd') {
                this.direction.x = Math.random() * 4 - 2;
                this.direction.y = tileSize * 4;
            } else if (hint == 'u') {
                this.direction.x = Math.random() * 4 - 2;
                this.direction.y = -tileSize * 4;
            } else if (hint == 'l') {
                this.direction.x = -tileSize * 4;
                this.direction.y = Math.random() * 4 - 2;
            } else if (hint == 'r') {
                this.direction.x = tileSize * 4;
                this.direction.y = Math.random() * 4 - 2;
            }
        }
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(this._screenX(offsetInPixels) - 2, this._screenY(offsetInPixels) - 2, 4, 4);
        return false;
    }
};

class TeleportEffect {
    constructor(fromX, fromY, toX, toY) {
        this.rays = []
        for (let n = 0; n <= 16; n++) {
            let x = 10 * Math.cos(n * Math.PI / 8);
            let y = 10 * Math.sin(n * Math.PI / 8);
            this.rays.push({x, y})
        }
        this.dirX = (fromX - toX) * tileSize;
        this.dirY = (fromY - toY) * tileSize;
    }
    draw(ctx, offsetInPixels, time) {
        const colors = [
            "rgba(255,255,255,0.25)",
            "rgba(200,255,255,0.5)",
            "rgb(100,200,255)",
            "rgb(50,170,255)",
            "rgb(0,148,255)",
            "rgb(0,130,255)",
            "rgb(0,118,255)",
            "rgb(0,98,255)",
            "rgb(0,78,255)",
            "rgb(0,58,255)",
            "rgb(0,38,255)",
        ];
        const rate = (1 - time * 5);
        let temperature = Math.floor(rate * (colors.length - 1));
        if (temperature < 0)
            return true;
        ctx.strokeStyle = colors[temperature];
        const dx = this.dirX * rate;
        const dy = this.dirY * rate;
        for (let r of this.rays) {
            ctx.beginPath();
            ctx.moveTo(r.x + offsetInPixels.x, r.y + offsetInPixels.y);
            ctx.lineTo(r.x + offsetInPixels.x + dx, r.y + offsetInPixels.y + dy);
            ctx.stroke();
        }
        return false;
    }
}