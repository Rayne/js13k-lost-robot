export class GameState {
    /**
     * @param {GameStateMachine} gameStateMachine
     */
    constructor(gameStateMachine) {
        /**
         * @type {GameStateMachine}
         */
        this.gameStateMachine = gameStateMachine;

        /**
         * @type {boolean}  Whether the state below this state has to be rendered.
         */
        this.isOverlay = false;

        /**
         * @type {string} Optional state name.
         */
        this.name = "Undefined";
    }

    /**
     * @param {number} dt
     */
    update(dt) {
        // NOOP
    }

    render() {
        // NOOP
    }

    onEnter() {
        // NOOP
    }

    onExit() {
        // NOOP
    }

    onPause() {
        // NOOP
    }

    onResume() {
        // NOOP
    }
}
