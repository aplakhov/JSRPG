class Fire {
    constructor() {
        this.emitters = []
        this.particles = []
        this.colors = [
            "rgba(0,0,0,0.25)",
            "rgba(72,45,38,0.5)",
            "rgb(110,86,73)",
            "rgb(148,128,109)",
            "rgb(182,96,72)",
            "rgb(216,64,35)",
            "rgb(228,101,40)",
            "rgb(241,138,45)",
            "rgb(248,187,84)",
            "rgb(254,236,123)",
            "rgb(255,255,255)",
        ]
    }

    emitParticles(pixelX, pixelY, size, pixelOffset) {
        if (pixelX < pixelOffset.x || pixelY < pixelOffset.y || 
            pixelX > pixelOffset.x + viewInPixels || pixelY > pixelOffset.y + viewInPixels)
            return;
        let x = Math.floor(pixelX/tileSize);
        let y = Math.floor(pixelY/tileSize);
        if (!world.vision.isVisible(x, y))
            return;
        let nBigParticles = Math.floor(size/20);
        for (let n = 0; n < nBigParticles; n++) {
            let xInside = n - size/40;
            this.particles.push({x: pixelX+xInside, y: pixelY, temperature: 20});
        }
        size = size % 20;
        if (size)
            this.particles.push({x: pixelX, y: pixelY, temperature: size});
    }

    addConstantEmitter(x, y, size) {
        this.emitters.push((fire, pixelOffset) => {
            fire.emitParticles(x * tileSize + tileSize/2, y * tileSize + 15, size, pixelOffset);
            return false;
        })
    }

    step(pixelOffset) {
        let newParticles = [];
        let newEmitters = [];
        for (let n = 0; n < this.emitters.length; n++) {
            let e = this.emitters[n];
            let emitterEnded = e(this, pixelOffset);
            if (!emitterEnded)
                newEmitters.push(e);
        }
        this.emitters = newEmitters;
        for (let n = 0; n < this.particles.length; n++) {
            let p = this.particles[n];
            // apply motion
            if (p.impulseX) {
                p.x += p.impulseX;
            } else {
                if (Math.random() < 0.3)
                    p.x -= 1;
                if (Math.random() < 0.3)
                    p.x += 1;
            }
            if (p.impulseY)
                p.y += p.impulseY;
            else if (Math.random() < 0.8)
                p.y -= 1;
            // lower temperature and delete some
            if (Math.random() < 0.7)
                p.temperature--;
            if (p.temperature > 0)
                newParticles.push(p);
        }
        this.particles = newParticles;
    }

    draw(ctx, pixelOffset) {
        let maxx = pixelOffset.x + viewInPixels;
        let maxy = pixelOffset.y + viewInPixels;
        for (let n = this.particles.length - 1; n >= 0; n--) {
            let p = this.particles[n];
            if (p.x >= pixelOffset.x && p.y >= pixelOffset.y && p.x < maxx && p.y < maxy) {
                ctx.fillStyle = this.colors[Math.floor(p.temperature/2)];
                ctx.fillRect(p.x - pixelOffset.x, p.y - pixelOffset.y, 2, 2);
            }
        }
    }
};
