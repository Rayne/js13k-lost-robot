export class ShakeViewportEffect {
    constructor(ttl) {
        this.skewHorizontal = 0;
        this.skewVertical = 0;
        this.ttl = ttl;
    }

    setTtl(ttl) {
        this.ttl = ttl;
    }

    update(dt) {
        if (this.ttl > 0) {
            this.ttl -= dt;

            this.skewHorizontal = Math.random() * 0.05;
            this.skewVertical = Math.random() * 0.05;
        }
    }

    /**
     * Applies the effect to the given context.
     *
     * @param {CanvasRenderingContext2D} context
     */
    render(context) {
        if (this.ttl <= 0) {
            return;
        }

        context.transform(1, this.skewVertical, this.skewHorizontal, 1, 0, 0);
    }
}
