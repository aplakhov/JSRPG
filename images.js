function makeImage(imageName) {
    if (!imageName)
        return null;
    if (!imageName.endsWith(".png"))
        imageName += ".png";
    let image = new Image();
    image.src = "Assets/" + imageName;
    return image;
}

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
}
images = new ImageCache();