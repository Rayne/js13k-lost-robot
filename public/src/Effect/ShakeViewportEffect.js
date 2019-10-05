export class ShakeViewportEffect {
    constructor(ttl) {
        this.setTtl(ttl);
    }

    setTtl(ttl) {
        this.ttl = ttl;
    }

    update(dt) {
        if (this.ttl > 0) {
            this.ttl -= dt;
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

        context.transform(1, Math.random() * 0.05, Math.random() * 0.05, 1, 0, 0);
    }
}
