class EdgeScript extends AllScripts {
    constructor(world) {
        super();
    }

    setupRecalculatedData(world) {
        const baseTile = {x: 0, y: 0} 
        world.animations.add(new StarryNight(200, 100), baseTile, true);
    }

    nextTurn(forced) {
        this._executeTriggers()
    }

    onItemUse(item) {
        return false;
    }
};

class StarryNight {
    constructor(speed, numBigStars) {
        this.speed = speed;
        this.sky = images.prepare("West/sky");
        this.star = images.prepare("West/star");
        this.stars = [];
        for (let n = 0; n < numBigStars; n++) {
            this.stars.push({
                x: Math.random() * viewInPixels,
                y: Math.random() * viewInPixels,
                size: Math.random() * Math.random()
            })
        }
    }
    draw(ctx, _, time) {
        let largestDisplacement = time * this.speed;
        let lowestDisplacement = largestDisplacement / 20;
        // draw sky:
        const skyX = (lowestDisplacement % 384) - 384;
        images.draw(ctx, this.sky, skyX, 0);
        images.draw(ctx, this.sky, skyX, 384);
        images.draw(ctx, this.sky, skyX + 384, 0);
        images.draw(ctx, this.sky, skyX + 384, 384);
        images.draw(ctx, this.sky, skyX + 768, 0);
        images.draw(ctx, this.sky, skyX + 768, 384);
        // draw stars:
        for (let star of this.stars) {
            const displacement = star.size * (largestDisplacement - lowestDisplacement) + lowestDisplacement;
            const starX = (star.x + displacement) % 868 - 100;
            const starPixelSize = 50 * star.size + 10;
            images.draw(ctx, this.star, starX, star.y, starPixelSize, starPixelSize);
        }
        return false;
    }
}