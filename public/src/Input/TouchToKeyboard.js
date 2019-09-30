import {Sprite} from "../../../node_modules/kontra/kontra.mjs";
import {Log} from "../Log.js";

let arrowRightPolygon = [
    [3, 0],
    [-1, 3],
    [-1, 1],
    [-3, 1],
    [-3, -1],
    [-1, -1],
    [-1, -3],
];

let arrowLeftPolygon = arrowRightPolygon.map(xy => {
    return [xy[0] * -1, xy[1]];
});

let arrowDownPolygon = arrowRightPolygon.map(xy => {
    return [xy[1], xy[0]];
});

let arrowUpPolygon = arrowDownPolygon.map(xy => {
    return [xy[0] * -1, xy[1] * -1];
});

let arrowPolygons = {
    up: arrowUpPolygon,
    down: arrowDownPolygon,
    left: arrowLeftPolygon,
    right: arrowRightPolygon,
};

export class TouchToKeyboard {
    constructor() {
        this.controlSprites = [];
        this.touchSprites = [];

        this._createControlSprites();
    }

    /**
     * @param {MultiTouchInput} multiTouchInput
     */
    update(multiTouchInput) {
        this.controlSprites.forEach(sprite => {
            sprite.isTouched = false;
            sprite.update();
        });

        // Hide all touch sprites.
        this.touchSprites.forEach(sprite => sprite.ttl = 0);

        // Enable and update active touch sprites.
        multiTouchInput.getTouches().forEach(touch => {
            let sprite = this._getOrCreateTouchSprite(touch.identifier);

            sprite.x = touch.clientX;
            sprite.y = touch.clientY;
            sprite.ttl = 1;
        });

        document.APP_CONFIG.touch2keys = {};
        let touch2keys = document.APP_CONFIG.touch2keys;

        this.touchSprites.forEach(sprite => {
            if (sprite.ttl > 0) {
                for (let i = 0; i < this.controlSprites.length; ++i) {
                    let controlSprite = this.controlSprites[i];

                    if (controlSprite.collidesWith(sprite)) {
                        controlSprite.isTouched = true;
                        touch2keys[controlSprite.simulatedKey] = true;
                    }
                }
            }
        });

        Log.instance().log("TouchToKeys=" + JSON.stringify(document.APP_CONFIG.touch2keys));
    }

    render() {
        this.controlSprites.forEach(sprite => sprite.render());
        this.touchSprites.forEach(sprite => sprite.render());
    }

    /**
     * @param {number} id
     * @returns {Sprite}
     * @private
     */
    _getOrCreateTouchSprite(id) {
        let sprite = this.touchSprites[id];

        if (sprite) {
            return sprite;
        }

        return this._createTouchSprite(id);
    }

    /**
     * @param {number} id
     * @returns {Sprite}
     * @private
     */
    _createTouchSprite(id) {
        let sprite = Sprite({
            anchor: {x: 0.5, y: 0.5},
            color: 'red',
            x: 0,
            y: 0,
            width: 16,
            height: 16,
            ttl: 0,
            id: id,
            render() {
                // Show active touches on the canvas..
                if (this.ttl > 0) {
                    this.draw();
                }
            }
        });

        this.touchSprites.push(sprite);
        return sprite;
    }

    _createControlSprites() {
        [
            // {simulatedKey: 'i'},
            // {simulatedKey: 'w'},
            // {simulatedKey: 'k'},
            // {simulatedKey: 's'},
            {simulatedKey: 'left'},
            {simulatedKey: 'right'},
            {simulatedKey: 'up'},
            {simulatedKey: 'down'},
        ].forEach(config => {
            this.controlSprites.push(Sprite({
                text: config.simulatedKey,
                ttl: 300 * 60,
                simulatedKey: config.simulatedKey,
                isTouched: false,
                update() {
                    // Easy input.
                    let canvasHeight = this.context.canvas.height;
                    let canvasWidth = this.context.canvas.width;
                    let reference = Math.min(canvasWidth, canvasHeight);

                    let size32 = (32 / 1920) * canvasWidth;
                    let size256 = (256 / 1920) * canvasWidth;
                    let size320 = (320 / 1920) * canvasWidth;

                    size32 = (32 / 1920) * reference;
                    size256 = (512 / 1920) * reference;
                    size320 = (512 / 1920) * reference;

                    this.width = size320;
                    this.height = size256;

                    if (this.simulatedKey === 'left') {
                        this.x = size32;
                        this.y = canvasHeight - size32 - size256;
                    } else if (this.simulatedKey === 'right') {
                        this.x = this.width + size32 + size32;
                        this.y = canvasHeight - size32 - size256;
                    } else if (this.simulatedKey === 'up') {
                        this.x = canvasWidth - size32 - this.width;
                        this.y = canvasHeight - size32 - size32 - size256 - size256;
                    } else if (this.simulatedKey === 'down') {
                        this.x = canvasWidth - size32 - this.width;
                        this.y = canvasHeight - size32 - size256;
                    }
                },
                render() {
                    if (this.ttl > 0) {
                        let context = this.context;

                        let cx = this.x + this.width / 2;
                        let cy = this.y + this.height / 2;
                        let scale = Math.min(this.width, this.height) / 6;

                        let arrowPolygon = arrowPolygons[this.simulatedKey];

                        context.fillStyle = 'rgba(117,112,204,0.125' + (this.isTouched ? 25 : 125) + ')';

                        context.beginPath();
                        context.moveTo(arrowPolygon[0][0] * scale + cx, arrowPolygon[0][1] * scale + cy);

                        for (let i = 1; i < arrowPolygon.length; ++i) {
                            context.lineTo(arrowPolygon[i][0] * scale + cx, arrowPolygon[i][1] * scale + cy);
                        }

                        context.closePath();
                        context.fill();

                        if (this.isTouched) {
                            context.beginPath();
                            context.rect(this.x, this.y, this.width, this.height);
                            context.fill();
                        }
                    }
                }
            }))
        });

        this.controlSprites.push(Sprite({
            ttl: 300 * 60,
            simulatedKey: 'esc',
            isTouched: false,
            update() {
                let canvasHeight = this.context.canvas.height;
                let canvasWidth = this.context.canvas.width;
                let reference = Math.min(canvasWidth, canvasHeight);

                let size32 = (32 / 1920) * canvasWidth;
                let size256 = (256 / 1920) * canvasWidth;
                let size320 = (320 / 1920) * canvasWidth;

                size32 = (32 / 1920) * reference;
                size256 = (512 / 1920) * reference;
                size320 = (512 / 1920) * reference;

                this.width = size320 / 2;
                this.height = size256 / 2;

                this.x = canvasWidth - this.width - size32 - size320 / 4;
                this.y = size32 + size320 / 4;
            },
            render() {
                if (this.ttl > 0) {
                    let context = this.context;

                    let cx = this.x + this.width / 2;
                    let cy = this.y + this.height / 2;
                    let scale = Math.min(this.width, this.height) / 6;

                    context.fillStyle = 'rgba(117,112,204,0.125' + (this.isTouched ? 25 : 125) + ')';

                    context.beginPath();

                    context.moveTo(-3 * scale + cx, -3 * scale + cy);
                    context.lineTo(-1 * scale + cx, -3 * scale + cy);
                    context.lineTo(-1 * scale + cx, 3 * scale + cy);
                    context.lineTo(-3 * scale + cx, 3 * scale + cy);

                    context.moveTo(1 * scale + cx, 3 * scale + cy);
                    context.lineTo(3 * scale + cx, 3 * scale + cy);
                    context.lineTo(3 * scale + cx, -3 * scale + cy);
                    context.lineTo(1 * scale + cx, -3 * scale + cy);

                    context.fill();

                    if (this.isTouched) {
                        context.beginPath();
                        context.rect(this.x, this.y, this.width, this.height);
                        context.fill();
                    }
                }
            }
        }))
    }
}
