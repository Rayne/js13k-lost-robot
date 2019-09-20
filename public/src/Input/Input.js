import {keyPressed} from "../../../node_modules/kontra/kontra.mjs";

export const EASY_UP = 'up';
export const EASY_DOWN = 'down';
export const EASY_LEFT = 'left';
export const EASY_RIGHT = 'right';

export const WHEEL_LEFT_MINUS = 'wheel_left_minus';
export const WHEEL_LEFT_PLUS = 'wheel_left_plus';
export const WHEEL_RIGHT_MINUS = 'wheel_right_minus';
export const WHEEL_RIGHT_PLUS = 'wheel_right_plus';

export const TURBO = 'turbo';
export const CAMERA = 'camera';
export const PAUSE = 'pause';

/**
 * TODO Map XBOX analog sticks to wheels (one wheel per stick).
 */
export class UserInput {
    constructor() {
        this.state = {};
    }

    update() {
        this.state[WHEEL_LEFT_PLUS] = keyPressed('w') || document.APP.touch2keys['w'];
        this.state[WHEEL_LEFT_MINUS] = keyPressed('s') || document.APP.touch2keys['s'];
        this.state[WHEEL_RIGHT_PLUS] = keyPressed('i') || document.APP.touch2keys['i'];
        this.state[WHEEL_RIGHT_MINUS] = keyPressed('k') || document.APP.touch2keys['k'];

        this.state[EASY_UP] = keyPressed('up') || document.APP.touch2keys['up'];
        this.state[EASY_DOWN] = keyPressed('down') || document.APP.touch2keys['down'];
        this.state[EASY_LEFT] = keyPressed('left') || document.APP.touch2keys['left'];
        this.state[EASY_RIGHT] = keyPressed('right') || document.APP.touch2keys['right'];

        this.state[CAMERA] = keyPressed('c');
        this.state[PAUSE] = keyPressed('esc');
        this.state[TURBO] = keyPressed('t') || keyPressed('space');
    }
}
