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
            console.log(key);
            // UP
            if (this.states[this.activeState].up && (key === 38 || key === 87)) {
                this.previouslyActiveState = this.activeState;
                this.activeState = this.states[this.activeState].up;

                this._updateGui();
            }

            // DOWN
            else if (this.states[this.activeState].down && (key === 40 || key === 83)) {
                this.previouslyActiveState = this.activeState;
                this.activeState = this.states[this.activeState].down;

                this._updateGui();
            }

            // LEFT
            else if (this.states[this.activeState].left && (key === 37 || key === 65)) {
                this.previouslyActiveState = this.activeState;
                this.activeState = this.states[this.activeState].left;

                this._updateGui();
            }

            // RIGHT
            else if (this.states[this.activeState].right && (key === 39 || key === 68)) {
                this.previouslyActiveState = this.activeState;
                this.activeState = this.states[this.activeState].right;

                this._updateGui();
            }

            // ACTION
            else if (key === 13 || key === 32) {
                this.states[this.activeState].action();
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

                this.states[this.activeState].action();
            }
        };

        this._updateGui();
        this.registerListeners();
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
