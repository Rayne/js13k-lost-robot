import {GameState} from "./GameState.js";

export class GameStateMachine {
    constructor() {
        /**
         * @type {GameState[]}
         */
        this.stateStack = [];
    }

    /**
     * @private
     */
    _validate() {
        if (this.stateStack.length === 0) {
            throw 'No state defined!';
        }
    }

    /**
     * Updates the top most state.
     */
    update(dt) {
        this._validate();

        this.stateStack[this.stateStack.length - 1].update(dt);
    }

    /**
     * Render the top most state
     * and if the rendered state is an overlay,
     * then render states below
     * (recursion continues for other overlays, too).
     */
    render() {
        this._validate();

        let firstVisibleState = this.stateStack.length - 1;

        for (let i = firstVisibleState; i >= 0; --i) {
            firstVisibleState = i;

            if (!this.stateStack[i].isOverlay) {
                break;
            }
        }

        for (let i = firstVisibleState; i < this.stateStack.length; ++i) {
            this.stateStack[i].render();
        }
    }

    /**
     * Pauses the current state and pushes the next state on top of the stack.
     * Afterwards the new state will be entered by calling {GameState.onEnter}.
     *
     * @param {GameState} state
     */
    pushState(state) {
        if (this.stateStack.length > 0) {
            let oldState = this.stateStack[this.stateStack.length-1];
            oldState.onPause();
        }

        this.stateStack.push(state);
        state.onEnter();
    }

    /**
     * @returns {GameState}
     */
    popState() {
        this._validate();

        let oldState = this.stateStack.pop();
        oldState.onExit();

        if (this.stateStack.length > 0) {
            let newState = this.stateStack[this.stateStack.length - 1];
            newState.onResume();
        }

        return oldState;
    }

    /**
     * @param {GameState} state Replaces the current state with the provided one.
     */
    replaceState(state) {
        this.popState();
        this.pushState(state);
    }
}
