class ImageCache {
    constructor() {
        this.images = {}
    }
    prepare(imageName) {
        if (!imageName)
            return null;
        let qualifiedName = imageName;
        if (!qualifiedName.endsWith(".png"))
            qualifiedName += ".png";
        let image = new Image();
        image.src = "Assets/" + qualifiedName;
        this.images[imageName] = image;
        return imageName;
    }
    getReadyImage(imageName) {
        const res = this.images[imageName];
        if (!res) {
            this.prepare(imageName);
            return null;
        }
        if (res.complete)
            return res;
        return null;
    }
    draw(ctx, imageName, ...restArgs) {
        let res = this.images[imageName];
        if (!res) {
            this.prepare(imageName);
            return;
        }
        if (!res.complete)
            return;
        ctx.drawImage(res, ...restArgs);
    }
    drawRotated(ctx, imageName, rotation, x, y) {
        let res = this.images[imageName];
        if (!res) {
            this.prepare(imageName);
            return;
        }
        if (!res.complete)
            return;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.drawImage(res, -res.width / 2, -res.height / 2);
        ctx.restore();
    }
    drawRotatedPart(ctx, imageName, rotation, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH) {
        let res = this.images[imageName];
        if (!res) {
            this.prepare(imageName);
            return;
        }
        if (!res.complete)
            return;
        ctx.save();
        ctx.translate(dstX, dstY);
        ctx.rotate(rotation);
        ctx.drawImage(res, srcX, srcY, srcW, srcH, -dstW / 2, -dstH / 2, dstW, dstH);
        ctx.restore();
    }
}
images = new ImageCache();