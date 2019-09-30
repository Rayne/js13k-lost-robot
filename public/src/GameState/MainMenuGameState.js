import {GameState} from "./GameState.js";
import {MenuStateMachine} from "../Menu/MenuStateMachine.js";
import {LevelMenuGameState} from "./LevelMenuGameState.js";
import {ControlsGameState, CreditsGameState, ObjectivesGameState} from "./StaticHtmlViewGameState.js";

export class MainMenuGameState extends GameState {
    /**
     * @param {GameStateMachine} gameStateMachine
     * @param {CanvasRenderingContext2D} context
     */
    constructor(gameStateMachine, context) {
        super(gameStateMachine);

        this.context = context;
        this.html = document.getElementById('scene--main-menu').parentElement;

        this.menuStateMachine = new MenuStateMachine({
            scenarios: {
                node: document.querySelector('.button[data-action="scenarios"]'),
                action: () => {
                    this.gameStateMachine.pushState(new LevelMenuGameState(this.gameStateMachine, this.context));
                },
                up: 'scenarios',
                down: 'objectives',
            },
            objectives: {
                node: document.querySelector('.button[data-action="objectives"]'),
                action: () => {
                    this.gameStateMachine.pushState(new ObjectivesGameState(this.gameStateMachine, this.context));
                },
                up: 'scenarios',
                down: 'controls',
            },
            controls: {
                node: document.querySelector('.button[data-action="controls"]'),
                action: () => {
                    this.gameStateMachine.pushState(new ControlsGameState(this.gameStateMachine, this.context));
                },
                up: 'objectives',
                down: 'credits',
            },
            credits: {
                node: document.querySelector('.button[data-action="credits"]'),
                action: () => {
                    this.gameStateMachine.pushState(new CreditsGameState(this.gameStateMachine, this.context));
                },
                up: 'controls',
                down: 'credits',
            }
        }, 'scenarios');
    }

    onEnter() {
        this.onResume();
    }

    onResume() {
        this.context.canvas.style.display = 'none';
        this.html.style.display = 'block';

        this.menuStateMachine.registerListeners();
    }

    onPause() {
        this.onExit()
    }

    onExit() {
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
