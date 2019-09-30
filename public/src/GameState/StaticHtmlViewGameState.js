import {GameState} from "./GameState.js";
import {MenuStateMachine} from "../Menu/MenuStateMachine.js";

export class StaticHtmlViewGameState extends GameState {
    /**
     * @param {GameStateMachine} gameStateMachine
     * @param {CanvasRenderingContext2D} context
     * @param htmlNode
     */
    constructor(gameStateMachine, context, htmlNode) {
        super(gameStateMachine);

        this.context = context;
        this.html = htmlNode;

        this.menuStateMachine = null;
    }

    onEnter() {
        this.onResume();
    }

    onResume() {
        this.context.canvas.style.display = 'none';
        this.html.style.display = 'block';

        this.menuStateMachine = new MenuStateMachine({
                back: {
                    node: this.html.querySelector('.back-button'),
                    action: () => this.gameStateMachine.popState(),
                }
            }, 'back'
        );
    }

    onPause() {
        this.onExit()
    }

    onExit() {
        this.menuStateMachine.resetState();
        this.menuStateMachine.unregisterListeners();

        this.context.canvas.style.display = 'block';
        this.html.style.display = 'none';

        // Workaround: When leaving this state,
        //             the canvas will have a width and height of zero.
        //             The problem occurs with Chromium and Firefox.
        //             Hiding the `<canvas>` with `display:none` seems to be responsible
        //             for this unexpected change.
        //             Therefore we are now resetting the canvas width and height.
        this.context.canvas.width = this.context.canvas.getBoundingClientRect().width;
        this.context.canvas.height = this.context.canvas.getBoundingClientRect().height;
    }

    update(dt) {
        // No operations.
    }

    render() {
        // The canvas is not visible.
    }
}

export class ObjectivesGameState extends StaticHtmlViewGameState {
    constructor(gameStateMachine, context) {
        super(
            gameStateMachine,
            context,
            document.getElementById('scene--objectives').parentElement
        );
    }
}

export class ControlsGameState extends StaticHtmlViewGameState {
    constructor(gameStateMachine, context) {
        super(
            gameStateMachine,
            context,
            document.getElementById('scene--controls').parentElement
        );
    }
}

export class CreditsGameState extends StaticHtmlViewGameState {
    constructor(gameStateMachine, context) {
        super(
            gameStateMachine,
            context,
            document.getElementById('scene--credits').parentElement
        );
    }
}
