const mechSpeaker = {
    color: "rgb(64, 37, 28)",
    bgColor: "rgb(200, 120, 80)",
    font: '18px sans-serif'
};
const stoneMageSpeaker = {
    color: "rgb(0, 0, 0)",
    bgColor: "rgb(163, 176, 178)",
    font: '18px sans-serif',
    portrait: images.prepare("Dialogs/stone_mage")
};

class DungeonScript extends AllScripts {
    constructor(world) {
        super();
        this.triggers.push(() => {
            const entryTablet = world.scriptObjects.entryTablet;
            if (player.x == entryTablet.x && player.y == entryTablet.y) {
                setTimeout(() => {
                    ui.dialogUI.addMessage("А, ну да. Я же не умею говорить по-гномьи.", playerSpeaker, player);
                }, 3000);
                return true;
            }
        });
        this.triggers.push(() => {
            const terrain = world.terrain[player.x][player.y];
            if (terrain == TERRAIN_GRASS) {
                ui.dialogUI.addMessage("Трава? В таком месте? Что-то мне не по себе.", playerSpeaker, player);
                return true;
            }
        });

        this._setupRails(world);
        this.vagonImg = images.prepare("Animations/player_vagon");
        this.fullVagonImg = images.prepare("Animations/very_full_vagon");
    }

    _setupRails(world) {
        for (let x = 0; x < world.width; x++) {
            for (let y = 0; y < world.height; y++) {
                if (world.terrain[x][y] == TERRAIN_PAVEMENT) {
                    const leftToo = x > 0 && world.terrain[x-1][y] == TERRAIN_PAVEMENT;
                    const rightToo = x+1 < world.width && world.terrain[x+1][y] == TERRAIN_PAVEMENT;
                    const upToo = y > 0 && world.terrain[x][y-1] == TERRAIN_PAVEMENT;
                    const downToo = y+1 < world.height && world.terrain[x][y+1] == TERRAIN_PAVEMENT;
                    let o = {
                        "class": "DecorativeObject",
                        "name": "Рельсы",
                    };
                    if (leftToo && upToo)
                        o["Image"] = "Rails/ul";
                    else if (rightToo && upToo)
                        o["Image"] = "Rails/ur";
                    else if (leftToo && downToo)
                        o["Image"] = "Rails/dl";
                    else if (rightToo && downToo)
                        o["Image"] = "Rails/dr";
                    else if (upToo || downToo)
                        o["Image"] = "Rails/v";
                    else
                        o["Image"] = "Rails/h";
                    world.addNewObject(o, x, y);
                }
            }
        }
        for (let x = 0; x < world.width; x++)
            for (let y = 0; y < world.height; y++)
                if (world.terrain[x][y] == TERRAIN_PAVEMENT)
                    world.terrain[x][y] = TERRAIN_SAND;
    }

    setupRecalculatedData(world) {
        world.fire.emitters.push((fire, pixelOffset) => {
            if (world.script.domnaWorking) {
                addSmokeParticle(world.scriptObjects.domna, 48, 20, 10, fire, pixelOffset);
                addSmokeParticle(world.scriptObjects.gear, 28, 41, 8, fire, pixelOffset);
            }
            return false;
        });

        const gear = world.scriptObjects.gear;
        gear.gearRotation = new SmoothlyChangingNumber(0);
        gear.spring = new SmoothlyChangingNumber(55);
    }

    _drawGear(ctx, pixelOffset) {
        const gear = world.scriptObjects.gear;
        const rotating = images.prepare("Dungeon/gear_rotating");
        const springShadow = images.prepare("Dungeon/gear_spring_shadow");
        const spring = images.prepare("Dungeon/gear_spring");
        const stationary = images.prepare("Dungeon/gear_stationary");
        const x = gear.x * tileSize - pixelOffset.x, y = gear.y * tileSize - pixelOffset.y;
        images.draw(ctx, springShadow, x + 105, y, gear.spring.get(), 96);
        images.draw(ctx, spring, x + 105, y, gear.spring.get(), 96);
        let partX = x;
        if (world.script.domnaWorking)
            partX += Math.random() * 2 - 1;
        images.drawRotated(ctx, rotating, gear.gearRotation.get(), partX + 46, y + 44);
        images.draw(ctx, stationary, x, y);
    }

    _useGear() {
        const gear = world.scriptObjects.gear;
        gear.gearRotation.set(-3 * Math.PI, 3);
        gear.spring.set(30, 3);
        gear.occupiedTiles[1] = [1,1,1,1,0]; 
    }

    _releaseGear() {
        const gear = world.scriptObjects.gear;
        gear.gearRotation.set(0, 0.1);
        gear.spring.set(55, 0.1);
        gear.occupiedTiles[1] = [1,1,1,1,1];
        if (player.y == gear.y + 1 && player.x == gear.x + 4) {
            if (this.playerInVagon) 
                this._playSpringJump();
            else
                player.applyDamage(10000, gear);
        }
    }

    _drawSpiderAbyss(ctx, pixelOffset) {
        const spiderAbyss = world.scriptObjects.spiderAbyss;
        const spiderInAbyss = world.scriptObjects.spiderInAbyss;
        const darkSpider = images.prepare("Dungeon/dark_spider");
        // collect all web points
        if (!this.abyssWebPoints || this.abyssWebPoints.length == 0) {
            this.abyssWebPoints = [];
            const p = world.pathfinding;
            for (let tx = spiderInAbyss.x - 5; tx <= spiderInAbyss.x + 5; tx++) {
                for (let ty = spiderInAbyss.y - 5; ty <= spiderInAbyss.y + 5; ty++) {
                    if (p.isOccupied(tx, ty) == spiderAbyss)
                        continue;
                    const way1 = (p.isOccupied(tx-1, ty) == spiderAbyss && p.isOccupied(tx, ty+1) == spiderAbyss)
                    const way2 = (p.isOccupied(tx+1, ty) == spiderAbyss && p.isOccupied(tx, ty-1) == spiderAbyss)
                    if (way1 || way2)
                        this.abyssWebPoints.push([tx, ty])
                }
            }
        }
        // determine spider position
        const startX = spiderInAbyss.x * tileSize + halfTileSize;
        const startY = spiderInAbyss.y * tileSize + halfTileSize;
        if (!this.abyssSpiderX) {
            this.abyssSpiderX = startX;
            this.abyssSpiderY = startY;
            this.abyssSpiderMovement = 0;
        }
        if (Math.random() < 0.01)
            this.abyssSpiderMovement = Math.floor(Math.random() * 3 - 1)
        if (Math.random() < 0.2) {
            this.abyssSpiderX += this.abyssSpiderMovement;
            this.abyssSpiderY += this.abyssSpiderMovement;
        }
        if (this.abyssSpiderX > startX + 32)
            this.abyssSpiderX = startX + 32;
        if (this.abyssSpiderY > startY + 32)
            this.abyssSpiderY = startY + 32;
        if (this.abyssSpiderX < startX - 32)
            this.abyssSpiderX = startX - 32;
        if (this.abyssSpiderY < startY - 32)
            this.abyssSpiderY = startY - 32;
        // draw all web threads
        ctx.strokeStyle = "rgba(192,192,192,0.4)";
        ctx.lineWidth = 1;
        for (const web of this.abyssWebPoints) {
            ctx.beginPath();
            const fromX = web[0] * tileSize + halfTileSize - pixelOffset.x;
            const fromY = web[1] * tileSize + halfTileSize - pixelOffset.y;
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(this.abyssSpiderX - pixelOffset.x, this.abyssSpiderY - pixelOffset.y);
            ctx.stroke();            
        }
        // draw darkness above them
        images.draw(ctx, darkSpider, this.abyssSpiderX - pixelOffset.x - 64, this.abyssSpiderY - pixelOffset.y - 64);
    }

    _playSpringJump() {
        this._startSequence();
        const playerStartX = player.x;
        const playerStartPix = player.pixelX.get();
        const positions = [8, 16, 24, 32, 33];
        const timeToGo = [0.3, 0.4, 0.5, 0.6, 0.1];
        for (let n = 0; n < positions.length; n++) {
            this._do(() => { 
                player.pixelX.set(playerStartPix + tileSize * positions[n], timeToGo[n]);
                player.x = playerStartX + positions[n];
                world.vision.recalculateLocalVisibility();
            });
            this._wait(timeToGo[n]);
        }
        this._do(() => { 
            this.playerInVagon = false;
            const o = {
                "class": "BigScaryObject",
                "name": "Летающая вагонетка",
                "Image": "Rails/vagon",
                "ScriptName": "flyingVagon"
            };
            let vagon = world.addNewObject(o, player.x + 1, player.y);
            vagon.pixelX = new SmoothlyChangingNumber(player.x * tileSize + 16);
            vagon.pixelX.set(vagon.x * tileSize + 16, 0.4);
            vagon.pixelY = new SmoothlyChangingNumber(player.y * tileSize + 16);
            vagon.rotation.set(90, 0.2);
            vagon.zeroX = 16; vagon.zeroY = 16;
        });
        this._finishSequence();
    }

    tryMovePlayer(dx, dy, newx, newy) {
        const pushingVagon = world.scriptObjects.pushingVagon;
        const domna = world.scriptObjects.domna;
        if (pushingVagon && pushingVagon.x == newx && pushingVagon.y == newy) {
            if (dy == 0 && pushingVagon.x + dx <= domna.x + 33) {
                pushingVagon.x += dx;
                pushingVagon.pixelX.set(pushingVagon.x * tileSize, 0.3);
                if (pushingVagon.x == domna.x + 2) {
                    pushingVagon.zLayer = 0;
                    this.domnaLoaded = true;
                    this._startSequence();
                    this._say("Грррррр.", mechSpeaker, domna);
                    this._say("Урррррр-грр.", mechSpeaker, domna);
                    this._say("Кажется, этой штуке понравилось.", playerSpeaker, player);
                    this._say("Но работать она от этого не стала. Нужно ещё что-то.", playerSpeaker, player);
                    this._finishSequence();
                }
            } else {
                return false;
            }
        }
        const abyss1 = world.scriptObjects.abyss1;
        if (newx >= abyss1.x && newx < abyss1.x + 2 && newy >= abyss1.y && newy <= abyss1.y + 3) {
            if (!this.playerInVagon) {
                ui.dialogUI.addMessage("Ну нет. Пешком по рельсам над пропастью я точно не пойду.", playerSpeaker, player);
                return false;
            }
            if (newy != abyss1.y + 1)
                return false;
            ui.dialogUI.addMessage("Во. Другое дело.", playerSpeaker, player);
        }
        for (const webPt of this.abyssWebPoints) {
            if (webPt[0] == newx && webPt[1] == newy) {
                ui.dialogUI.addMessage("Серьёзно? Нет, в такую очевидную ловушку я попадать не собираюсь.", playerSpeaker, player);
                return false;
            }
        }
        if (this.mageTeleported) {
            const stoneMage = world.scriptObjects.stoneMage;
            if (newx == stoneMage.x && newy == stoneMage.y) {
                player.teleport(stoneMage.x, stoneMage.y);
                stoneMage.image = "Animations/very_full_vagon";
                return true;
            } else {
                stoneMage.image = "Animations/stone_mage_vagon";
            }
        }
        return true;
    }

    drawUnderDarkness(ctx, pixelOffset) {
        this._drawGear(ctx, pixelOffset);
        for (let obj of world.objects) {
            if (obj.ai && obj.ai.guardArea) {
                const visible1 = world.vision.isVisibleSafe(obj.x, obj.y);
                const guardZone = world.scriptObjects[obj.ai.guardArea];
                let visible2;
                if (guardZone.touchedByPlayer) {
                    visible2 = world.vision.isVisibleSafe(player.x, player.y);
                } else {
                    visible2 = world.vision.isVisibleSafe(guardZone.x, guardZone.y);
                }
                if (visible1 || visible2) {
                    ctx.strokeStyle = "rgba(192,192,192,0.4)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    const x0 = obj.pixelX.get() + 16 - pixelOffset.x, y0 = obj.pixelY.get() + 16 - pixelOffset.y;
                    ctx.moveTo(x0, y0);
                    if (guardZone.touchedByPlayer) {
                        const x1 = player.pixelX.get() + 16 - pixelOffset.x, y1 = player.pixelY.get() + 16 - pixelOffset.y;
                        ctx.lineTo(x1, y1);
                    } else {
                        const x1 = guardZone.x * tileSize + 16 - pixelOffset.x, y1 = guardZone.y * tileSize + 16 - pixelOffset.y;
                        ctx.lineTo(x1, y1);
                    }
                    ctx.stroke();
                }
            }
        }
        if (this.domnaWorking) {
            for (let mech of [world.scriptObjects.mech1, world.scriptObjects.mech2]) { 
                let dx = Math.random();
                mech.pixelX.set(mech.x * tileSize + dx, 0);
            }
        }
        this._drawSpiderAbyss(ctx, pixelOffset);
    }

    drawPlayer(ctx, frameX, frameY, x, y) {
        if (this.mageTeleported) {
            const stoneMage = world.scriptObjects.stoneMage;
            if (player.x == stoneMage.x && player.y == stoneMage.y)
                return true; // do not draw player
        }
        if (this.finalScriptInAction) {
            const fy = frameY % 2;
            images.draw(ctx, "Animations/very_full_vagon", x, y - 4 + fy);
            return true;
        }
        if (this.playerInVagon) {
            const fx = frameX % 2, fy = frameY % 2;
            images.draw(ctx, this.vagonImg, fx * 32, fy * 32, 32, 32, x, y - 4, 32, 32);
            if (player.hp < player.stats.hp)
                drawHPbar(ctx, player.hp, player.stats.hp, x, y - 6)
                return true;
        }
        return false;
    }

    onDraw() {
        const vagon = world.scriptObjects.vagon;
        if (player.x == vagon.x && player.y == vagon.y && player.pixelX.atTarget() && player.pixelY.atTarget())
            this.playerInVagon = true;
        if (this.playerInVagon)
            vagon.image = "";
        else
            vagon.image = "Rails/vagon";
    }

    nextTurn(forced) {
        if (this.playerInVagon) {
            if (!player.pixelY.atTarget())
                this.playerInVagon = false;
            else {
                const vagon = world.scriptObjects.vagon;
                vagon.x = player.x;
                vagon.y = player.y;
            }
        }
        const gear = world.scriptObjects.gear;
        if (player.x == gear.x && player.y == gear.y + 2 && !this.gearLoaded) {
            if (this.domnaWorking) {
                this.gearLoaded = true;
                this._useGear();
                this.releaseGearAfter = globalTimer + 10;
            } else {
                ui.dialogUI.addMessage("Тут рычаг. Я нажимаю, но ничего не происходит.", playerSpeaker, player);
                ui.dialogUI.addMessage("Наверное, эту штуку надо сначала как-то включить.", playerSpeaker, player);
            }
        }
        this._executeTriggers();
        if (this.gearLoaded && this.releaseGearAfter < globalTimer) {
            this.gearLoaded = false;
            this._releaseGear();
        }
        const sub = world.scriptObjects.submarine;
        const shift = Math.round(Math.random());
        sub.pixelY.set(sub.y * tileSize + shift);
        
        const stoneMage = world.scriptObjects.stoneMage;
        if (dist2obj(stoneMage, player) <= 9)
            this.playFirstPartScript();
    }

    onFinishSpell(targetX, targetY, spell) {
        const targetObj = world.pathfinding.isOccupied(targetX, targetY);
        const domna = world.scriptObjects.domna;
        if (targetObj == domna && spell == "fire") {
            if (this.domnaLoaded) {
                this.domnaWorking = true;
                this._startSequence();
                this._say("Дырдырдыр.", mechSpeaker, domna);
                this._say("Бырбырбыр.", mechSpeaker, domna);
                this._say("О, заработало! Я настоящий механик!", playerSpeaker, player);
                this._say("Интересно, зачем мне это.", playerSpeaker, player);
                this._finishSequence();
            } else {
                ui.dialogUI.addMessage("Хм, ничего не произошло.", playerSpeaker, player);
                ui.dialogUI.addMessage("Наверное, там внутри нечему гореть.", playerSpeaker, player);
            }
            return false;
        }
        const sub = world.scriptObjects.submarine;
        if (targetX >= sub.x && targetY >= sub.y && targetX < sub.x + 4 && targetY < sub.y + 4 && spell == "stone") {
            return true;
        }
        const spiderAbyss = world.scriptObjects.spiderAbyss;
        if (targetObj == spiderAbyss) {
            ui.blockingUI = new InsideHouseUI(ctx, null, "abyss_spider");
            ui.state = 2;
            return true;
        }
        this.checkFinishSpellOnMage(targetObj, spell);
    }

    onItemUse(item) {
        return false;
    }

    playFirstPartScript() {
        const stoneMage = world.scriptObjects.stoneMage;
        if (this.firstPartDone) {
            if (Math.random() < 0.1)
                ui.dialogUI.addMessage("....оммм....", stoneMageSpeaker, stoneMage, true);
            return;
        }
        this.firstPartDone = true;
        this._startSequence();
        this._say("Здравствуйте. Можно, это, вас спасти?", playerSpeaker, player);
        this._say("....оммммм...", stoneMageSpeaker, stoneMage);
        this._wait(3);
        this._say("Нельзя же просто сидеть и медитировать. Тут опасно. Нужно уходить.", playerSpeaker, player);
        this._say("...омммм...", stoneMageSpeaker, stoneMage);
        this._say("Ахтунг! Полундра!! Вира! Майна! Хенде хох!", playerSpeaker, player);
        this._wait(2);
        this._say("Кто здесь?", stoneMageSpeaker, stoneMage);
        this._say("А, это ты, Билл.", stoneMageSpeaker, stoneMage);
        this._say("Опять торопишься куда-то.", stoneMageSpeaker, stoneMage);
        this._say("Пока не запомнишь, что магия не терпит спешки, магом тебе не стать.", stoneMageSpeaker, stoneMage);
        this._say("Кстати, как ты сюда попал? Мы-то с Кираэлем переправлялись по рельсам, но он случайно их взорвал.", stoneMageSpeaker, stoneMage);
        this._say("Дайте угадаю, он тут же побежал за помощью и заодно унёс что-нибудь ценное?", playerSpeaker, player);
        this._say("Да, когда раздался взрыв, Золотой рог был у него. Простое совпадение.", stoneMageSpeaker, stoneMage);
        this._say("Так как ты сюда попал?", stoneMageSpeaker, stoneMage);
        this._say("Я... я перелетел по воздуху.", playerSpeaker, player);
        this._say("А обратно как собираешься?", stoneMageSpeaker, stoneMage);
        this._say("...", playerSpeaker, player);
        this._wait(2);
        this._say("Об этом я ещё не подумал. А у вас нет идей?", playerSpeaker, player);
        this._say("Конечно, есть. Я буду медитировать, и Вселенная рано или поздно поможет.", stoneMageSpeaker, stoneMage);
        this._say("...омммм...", stoneMageSpeaker, stoneMage);
        this._finishSequence();
    }

    checkFinishSpellOnMage(targetObj, spell) {
        const stoneMage = world.scriptObjects.stoneMage;
        if (targetObj == stoneMage && !this.mageTeleported) {
            if (!this.mageTired) {
                this.mageTired = [];
            }
            if (this.mageTired.indexOf(spell) == -1) {
                this.mageTired.push(spell);
                const reactions = {
                    "fire": "Почему-то стало жарко. Но это не повод прерывать медитацию.",
                    "water": "Почему-то стало мокро. Но это не повод прерывать медитацию.",
                    "stone": "Почему-то стало твёрдо сидеть. Но это не повод прерывать медитацию.",
                    "healing": "Я ничем и не болею. И это точно не повод прерывать медитацию.",
                    "lightning": "В воздухе чувствуется некоторое напряжение. Но это не повод прерывать медитацию."
                }
                const staticPlace = { x: stoneMage.x, y: stoneMage.y };
                if (reactions[spell])
                    ui.dialogUI.addMessage(reactions[spell], stoneMageSpeaker, staticPlace);
                if (this.mageTired.length > 2) {
                    this.mageTeleported = true;
                    const newPosition = {x: 68, y: 14};
                    this._startSequence();
                    this._wait(2);
                    this._say("Впрочем, можно найти место и поспокойней.", stoneMageSpeaker, staticPlace);
                    this._do(() => {
                        world.animations.add(new TeleportEffect(stoneMage.x, stoneMage.y, newPosition.x, newPosition.y), stoneMage);
                        stoneMage.x = newPosition.x; stoneMage.y = newPosition.y;
                        stoneMage.image = "Animations/stone_mage_vagon";
                        if (world.scriptObjects.flyingVagon)
                            world.scriptObjects.flyingVagon.dead = true;
                    })
                    this._finishSequence();
                }
            }
        }        
    }

    hasDynamite(x, y) {
        for (let o of world.objects)
            if (o.x == x && o.y == y && o.inventoryItem == "dynamite")
                return true;
        return false;
    }

    checkCanCast(targetX, targetY, spell) {
        if (this.checkFinalKaboom(targetX, targetY, spell))
            return false;
        return true;
    }

    checkFinalKaboom(targetX, targetY, spell) {
        if (spell != "fire" || !this.mageTeleported)
            return false;
        const stoneMage = world.scriptObjects.stoneMage;
        if (targetY != stoneMage.y || (targetX != stoneMage.x + 1 && targetX != stoneMage.x + 2))
            return false;
        if (!this.hasDynamite(targetX, targetY))
            return false;
        if (player.x != stoneMage.x || player.y != stoneMage.y) {
            ui.dialogUI.addMessage("Подождите. Идея понятна, но я сам тогда как переберусь?", playerSpeaker, player, true);
        } else {
            this._startSequence();
            this._say("...оммм... стоп. Что ты задумал?", stoneMageSpeaker, stoneMage);
            this._say("Не волнуйтесь. Это абсолютно безопасно.", playerSpeaker, player);
            this._wait(1);
            this._do(() => {
                castFire(player, targetX, targetY);
            });
            this._wait(0.3);
            const playerStartX = player.x;
            const playerStartPix = player.pixelX.get();
            const positions = [8, 16, 24, 30, 31];
            const timeToGo = [0.3, 0.4, 0.5, 0.6, 0.4];
            for (let n = 0; n < positions.length; n++) {
                this._do(() => {
                    stoneMage.image = "";
                    stoneMage.x = 0;
                    stoneMage.y = 0;
                    this.finalScriptInAction = true;
                    player.pixelX.set(playerStartPix - tileSize * positions[n], timeToGo[n]);
                    player.x = playerStartX - positions[n];
                    world.vision.recalculateLocalVisibility();
                });
                this._wait(timeToGo[n]);
            }
            this._say("Что ж, как я и говорил, если долго медитировать, Вселенная сама решит все проблемы.", stoneMageSpeaker, stoneMage)
            this._say("Эй, это же я вас спас!", playerSpeaker, player);
            this._say("Верно. Ты тоже часть Вселенной.", stoneMageSpeaker, stoneMage);
            this._say("Тогда поставьте Вселенной экзамен автоматом?", playerSpeaker, player);
            this._finishQuest("town_intro_stone_magic");
            this._finishQuest("town_find_stone_mage");
            this._fade("На обратном пути Вселенная ещё не раз нам помогала...", 5);
            this._wait(3);
            this._changeMap("town_map", "dark_forest_map");
            this._do(() => { this.finalScriptInAction = false });
            this._finishSequence();
        }
        return true;
    }
};
