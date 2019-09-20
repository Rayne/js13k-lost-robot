export class MultiTouchInput {
    constructor(object = null) {
        /**
         * Contains all active _touches.
         *
         * @type {Array}
         */
        this._touches = [];

        /**
         * States whether a touch is new.
         * The information is important when a touch ID gets recycled
         * as that touch information is no longer related to old information with that ID.
         *
         * @type {Array}
         */
        this._isNew = [];

        this.registerTo(object);
    }

    /**
     * @param {Touch} touch
     * @returns {{identifier: *, clientY: *, clientX: *, pageY: *, pageX: *, screenX: *, screenY: *}}
     * @private
     */
    _buildTouchData(touch) {
        return {
            identifier: touch.identifier,
            clientX: touch.clientX,
            pageX: touch.pageX,
            screenX: touch.screenX,
            clientY: touch.clientY,
            pageY: touch.pageY,
            screenY: touch.screenY,
        };
    };

    _touchstart(event) {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            let touchData = this._buildTouchData(touch);

            this._touches[touchData.identifier] = touchData;
            this._isNew[touchData.identifier] = true;
        }
    }

    _touchmove(event) {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            let touchData = this._buildTouchData(touch);

            this._touches[touchData.identifier] = touchData;
        }
    }

    _touchend(event) {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            let touchData = this._buildTouchData(touch);

            delete this._touches[touchData.identifier];
        }
    }

    _touchcancel(event) {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            let touchData = this._buildTouchData(touch);

            delete this._touches[touchData.identifier];
        }
    }

    /**
     * Sets all new touches as known.
     * This should be called after processing inputs,
     * e.g. at the end of an update method.
     * The method guarantees that a `touchstart` is only interpreted as new once.
     */
    tick() {
        for (let i = 0; i < this._isNew.length; ++i) {
            this._isNew[i] = false;
        }
    }

    registerTo(object) {
        object.addEventListener('touchstart', this._touchstart.bind(this), false);
        object.addEventListener('touchmove', this._touchmove.bind(this), false);
        object.addEventListener('touchend', this._touchend.bind(this), false);
        object.addEventListener('touchcancel', this._touchcancel.bind(this), false);
    }

    unregisterFrom(object) {
        object.addEventListener('touchstart', this._touchstart, false);
        object.addEventListener('touchmove', this._touchmove, false);
        object.addEventListener('touchend', this._touchend, false);
        object.addEventListener('touchcancel', this._touchcancel, false);
    }

    _sync() {
        let keys = Object.keys(this._touches);

        for (let i = 0; i < keys.length; ++i) {
            this._touches[keys[i]].isNew = this._isNew[i];
        }
    }

    getTouches() {
        this._sync();
        return this._touches;
    }
}
