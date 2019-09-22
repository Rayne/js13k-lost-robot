let instance = null;

export class Log {
    constructor() {
        this._log = [];
    }

    /**
     * @returns {Log} Global singleton style instance.
     */
    static instance() {
        if (!instance) {
            instance = new Log();
        }

        return instance;
    }

    log(message) {
        this._log.push(message);
    }

    reset() {
        this._log = [];
    }

    render(context) {
        context.font = '22px monospace';

        let colors = [
            'red',
            'green',
            'blue'
        ];

        let height = 32;

        for (let i = 0; i < this._log.length; ++i) {
            let text = JSON.stringify(this._log[i]);
            let textMeasurement = context.measureText(text);

            context.fillStyle = colors[i % colors.length];

            context.beginPath();
            context.rect(0, (i) * height, textMeasurement.width + 12, height);
            context.fill();

            context.fillStyle = 'white';

            context.beginPath();
            context.fillText(text, 6, (i + 1) * height - 8);
        }

        this.reset();
    }
}