import {emit} from '../../../node_modules/kontra/kontra.mjs';

export const EVENT_ACTION = 'menu.action';
export const EVENT_BACK = 'menu.back';
export const EVENT_CURSOR_MOVE = 'menu.cursor.move';

const DIRECTION_UP = 'up';
const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';
const DIRECTION_DOWN = 'down';

/**
 * This state machine allows to navigate through simple menus with keyboard, mouse and touch controls.
 */
export class MenuStateMachine {
    constructor(states, activeState) {
        this.startState = activeState;
        this.activeState = activeState;
        this.previouslyActiveState = activeState; // {_updateGui} requires a valid previous state.
        this.states = states;

        this._listenerKeydown = e => {
            // TODO Use future proof keys instead of `which`.
            let key = e.which;

            // UP
            if (key === 38 || key === 87) {
                return this.tryToMoveInDirection(DIRECTION_UP);
            }

            // DOWN
            if (key === 40 || key === 83) {
                return this.tryToMoveInDirection(DIRECTION_DOWN);
            }

            // LEFT
            if (key === 37 || key === 65) {
                return this.tryToMoveInDirection(DIRECTION_LEFT);
            }

            // RIGHT
            if (key === 39 || key === 68) {
                return this.tryToMoveInDirection(DIRECTION_RIGHT);
            }

            // ACTION
            if (key === 13 || key === 32) {
                return this.tryToExecuteAction();
            }

            // BACK
            if (key === 27) {
                emit(EVENT_BACK);
            }
        };

        this._listenerClick = e => {
            let target = e.target;
            let action = null;

            while (action === null) {
                action = target.getAttribute('data-action');
                target = target.parentElement;

                // Terminate when trying to leave the `<html>` element.
                if (!target) {
                    return;
                }
            }

            if (this.states[action]) {
                this.previouslyActiveState = this.activeState;
                this.activeState = action;

                this._updateGui();

                return this.tryToExecuteAction();
            }
        };

        this._updateGui();
        this.registerListeners();
    }


    /**
     * Emits an EVENT_CURSOR_MOVE event.
     *
     * @param {string} direction One of 'right', 'up', 'left' or 'down`.
     */
    tryToMoveInDirection(direction) {
        let success = false;

        if (this.states[this.activeState][direction]) {
            success = true;

            this.previouslyActiveState = this.activeState;
            this.activeState = this.states[this.activeState][direction];

            this._updateGui();
        }

        emit(EVENT_CURSOR_MOVE, {
            from: success ? this.previouslyActiveState : this.activeState,
            direction: direction,
            to: this.activeState,
            success: success
        });
    }

    /**
     * Tries to execute the active of the active state.
     * If the state has no action, do nothing.
     *
     * Emits an EVENT_ACTION event.
     */
    tryToExecuteAction() {
        let success = false;

        if (this.states[this.activeState].action) {
            success = true;
            this.states[this.activeState].action();
        }

        emit(EVENT_ACTION, {success: success});
    }

    _updateGui() {
        this.states[this.previouslyActiveState].node.style.background = 'white';
        this.states[this.activeState].node.style.background = 'cyan';

        this.states[this.activeState].node.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    }

    /**
     * Resets the state machine and GUI.
     */
    resetState() {
        this.previouslyActiveState = this.activeState;
        this.activeState = this.startState;
        this._updateGui();
    }

    /**
     * Registers listener to {window}.
     */
    registerListeners() {
        window.addEventListener('keydown', this._listenerKeydown);
        window.addEventListener('click', this._listenerClick);
    }

    /**
     * Removes own listeners from {window}.
     */
    unregisterListeners() {
        window.removeEventListener('keydown', this._listenerKeydown);
        window.removeEventListener('click', this._listenerClick);
    }
}
