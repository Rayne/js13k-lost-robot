import {GameState} from "./GameState.js";
import {EVENT_LEVEL_RESTART, EVENT_QUIT} from "./MapGameState.js";
import * as kontra from '../../../node_modules/kontra/kontra.mjs';
import {MenuStateMachine} from "../Menu/MenuStateMachine.js";

export class PauseMenuGameState extends GameState {
    constructor(a) {
        super(a);

        this.isOverlay = true;

        this.html = document.getElementById('scene--pause-menu').parentElement;

        let $resume = this.html.querySelector('div[data-action="resume"]');
        let $restart = this.html.querySelector('div[data-action="restart"]');
        let $quit = this.html.querySelector('div[data-action="quit"]');

        this.menuStateMachine = new MenuStateMachine({
            'resume': {
                node: $resume,
                up: 'resume',
                down: 'restart',
                action: () => this.gameStateMachine.popState(),
            },
            'restart': {
                node: $restart,
                up: 'resume',
                down: 'quit',
                action: () => {
                    this.gameStateMachine.popState();
                    kontra.emit(EVENT_LEVEL_RESTART);
                }
            },
            'quit': {
                node: $quit,
                up: 'restart',
                down: 'quit',
                action: () => {
                    this.gameStateMachine.popState();
                    kontra.emit(EVENT_QUIT);
                }
            },
        }, 'resume');
    }

    onEnter() {
        this.html.style.display = 'block';
    }

    onResume() {
        throw "Not implemented.";
    }

    onPause() {
        throw "Not implemented.";
    }

    onExit() {
        this.html.style.display = 'none';

        this.menuStateMachine.resetState();
        this.menuStateMachine.unregisterListeners();
    }
}
