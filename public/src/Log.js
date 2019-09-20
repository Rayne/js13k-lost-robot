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

    render(context) {
        context.fillStyle = 'black';
        context.font = '22px monospace';

        for (let i = 0; i < this._log.length; ++i) {
            context.clearRect(0, (i) * 16, 500, 16);
            context.fillText(JSON.stringify(this._log[i]), 6, (i + 1) * 16);
        }

        this._log = [];
    }
}