import {GameState} from "./GameState.js";
import {MainMenuGameState} from "./MainMenuGameState.js";

export class IntroGameState extends GameState {
    /**
     * @param {GameStateMachine} gameStateMachine
     * @param {CanvasRenderingContext2D} context
     */
    constructor(gameStateMachine, context) {
        super(gameStateMachine);

        this.canvas = context.canvas;
        this.context = context;

        this.listener = () => {
            // if (this.canvas.requestFullscreen) {
            //     // FIXME Requesting full screen has a bug on Chromium:
            //     //       Buttons are not clickable.
            //     //       Workaround: Press ESC to leave the fullscreen.
            //     //       Then all buttons are clickable.
            //     //       This isn't an issue in Firefox.
            //     this.canvas.requestFullscreen();
            // }

            let state = new MainMenuGameState(this.gameStateMachine, this.context);
            this.gameStateMachine.pushState(state);
        };
    }

    _registerEvents() {
        window.addEventListener('mouseup', this.listener);
        window.addEventListener('touchend', this.listener);
        window.addEventListener('keyup', this.listener);
    }

    _unregisterEvents() {
        window.removeEventListener('mouseup', this.listener);
        window.removeEventListener('touchend', this.listener);
        window.removeEventListener('keyup', this.listener);
    }

    onEnter() {
        this.reset();
        this._registerEvents();
    }

    onExit() {
        this._unregisterEvents();
    }

    onPause() {
        this._unregisterEvents();
    }

    onResume() {
        this.reset();
        this._registerEvents();
    }

    update(dt) {
        this.time += dt;
        this._updateColor();
    }

    reset() {
        this.time = 0;
        this._updateColor();
    }

    /**
     * @private
     */
    _updateColor() {
        // Start with faded out (white) color at timestamp 0
        // (e.g. `Math.PI/2` as starting point).
        let fadingEffect = Math.sin(Math.PI / 2 + 4 * this.time) * 255;
        let value = Math.round(Math.floor(fadingEffect));
        this.textColor = 'rgb(' + value + ',' + value + ',' + value + ')';
    }

    render() {
        let context = this.context;
        let width = context.canvas.width;
        let height = context.canvas.height;

        context.fillStyle = '#fff';
        context.fillRect(0, 0, width, height);

        context.font = '2rem monospace';
        context.fillStyle = this.textColor;

        let message = 'Press [SPACE] or touch here';
        let textWidth = context.measureText(message).width;
        context.fillText(message, width / 2 - textWidth / 2, height / 2);

        context.font = '1rem monospace';
        context.fillStyle = 'cyan';

        message = 'Device Pixel Ratio = ' + window.devicePixelRatio;
        textWidth = context.measureText(message).width;
        context.fillText(message, width / 2 - textWidth / 2, height * (3 / 4));
    }
}
