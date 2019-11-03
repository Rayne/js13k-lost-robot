import {GameState} from "./GameState.js";
import {MenuStateMachine} from "../Menu/MenuStateMachine.js";
import {APP_CONFIG} from "../config.js";
import {maps} from "../maps.js";
import {format_time} from "../utils.js";
import {MapGameState} from "./MapGameState.js";

export class LevelMenuGameState extends GameState {
    /**
     * @param {GameStateMachine} gameStateMachine
     * @param {CanvasRenderingContext2D} context
     */
    constructor(gameStateMachine, context) {
        super(gameStateMachine);

        this.context = context;
        this.html = document.getElementById('scene--level-menu').parentElement;

        this.menuStateMachine = null;
    }

    onEnter() {
        this.onResume();
    }

    onResume() {
        this.context.canvas.style.display = 'none';
        this.html.style.display = 'block';

        let states = {};

        let $levelZone = document.getElementById('level-select');
        $levelZone.innerHTML = '';

        let template = document.getElementById('level-select-template').innerHTML;

        for (let i = 1; i <= maps.length; ++i) {
            if (!APP_CONFIG.mapStates[i]) {
                APP_CONFIG.mapStates[i] = {
                    time: 0,
                    points: 0,
                }
            }

            let mapState = APP_CONFIG.mapStates[i];

            $levelZone.innerHTML += template
                .replace('{{ level.points }}', mapState.points)
                .replace('{{ level.time }}', format_time(mapState.time))
                .replace('{{ level.name }}', 'Scenario ' + i)
                .replace('{{ level.id }}', i)
        }

        let levelCounter = 0;
        let levelLimit = maps.length;

        states['back'] = {
            node: this.html.querySelector('.back-button'),
            down: 'level-1',
            action: () => {
                this.gameStateMachine.popState();
            },
        };

        document.querySelectorAll('#level-select .level-button').forEach(e => {
            levelCounter++;

            let levelId = e.getAttribute('data-level-id');

            e.setAttribute('data-action', 'level-' + levelCounter);

            let up = 'level-' + (levelCounter > 2 ? levelCounter - 2 : levelCounter);
            let down = 'level-' + (levelCounter <= levelLimit - 2 ? levelCounter + 2 : levelCounter);
            let left = 'level-' + (levelCounter > 1 && levelCounter % 2 === 0 ? levelCounter - 1 : levelCounter);
            let right = 'level-' + (levelCounter % 2 === 1 && levelCounter < levelLimit ? levelCounter + 1 : levelCounter);

            if (levelCounter < 3) {
                up = 'back';
            }

            states['level-' + levelCounter] = {
                node: e,
                action: () => {
                    let state = new MapGameState(this.gameStateMachine, this.context);
                    state.setLevel(levelId);

                    this.gameStateMachine.pushState(state);
                },
                up: up,
                down: down,
                left: left,
                right: right,
            };
        });

        this.menuStateMachine = new MenuStateMachine(states, 'level-1');
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
