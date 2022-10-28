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

    addConstantEmitter(x, y, size) {
        this.emitters.push((particles, offset) => {
            if (x < offset.x || y < offset.y || x > offset.x + viewInTiles || y > offset.y + viewInTiles)
                return;
            if (!world.vision.isVisible(x, y))
                return;
            for (let n = 0; n < size; n++) {
                let xInside = n + (tileSize-size)/2;
                let yInside = 15;
                particles.push({x: x*tileSize+xInside, y: y*tileSize+yInside, temperature: 20});
            }
        })
    }

    step(offset) {
        let newParticles = []
        for (let n = 0; n < this.emitters.length; n++) {
            let e = this.emitters[n];
            e(this.particles, offset);
        }
        for (let n = 0; n < this.particles.length; n++) {
            let p = this.particles[n];
            // move up and sideways
            if (Math.random() < 0.8)
                p.y -= 1;
            if (Math.random() < 0.3)
                p.x -= 1;
            if (Math.random() < 0.3)
                p.x += 1;
            // lower temperature and delete some
            if (Math.random() < 0.7)
                p.temperature--;
            if (p.temperature > 0)
                newParticles.push(p);
        }
        this.particles = newParticles;
    }

    draw(ctx, offset) {
        let x = offset.x * tileSize;
        let y = offset.y * tileSize;
        let maxx = x + ctx.canvas.width;
        let maxy = y + ctx.canvas.height;
        for (let n = this.particles.length - 1; n >= 0; n--) {
            let p = this.particles[n];
            if (p.x >= x && p.y >= y && p.x < maxx && p.y < maxy) {
                ctx.fillStyle = this.colors[Math.floor(p.temperature/2)];
                ctx.fillRect(p.x - x, p.y - y, 2, 2);
            }
        }
    }
};
let fire = new Fire();
