import * as kontra from "../../node_modules/kontra/kontra.mjs";
import {GameStateMachine} from "./GameState/GameStateMachine.js";
import * as MenuStateMachine from "./Menu/MenuStateMachine.js";
import {IntroGameState} from "./GameState/IntroGameState.js";
import {APP_CONFIG} from "./config.js";

document.addEventListener('DOMContentLoaded', function () {
    /**
     * Preconfigure the 2D context as opaque.
     */
    let $canvas = document.getElementsByTagName('canvas')[0];
    $canvas.getContext("2d", {alpha: false});

    kontra.init($canvas);
    kontra.initKeys();

    let context = kontra.getContext();
    let resize = () => {
        let canvas = context.canvas;
        let boundingClientRect = canvas.getBoundingClientRect();
        canvas.width = boundingClientRect.width;
        canvas.height = boundingClientRect.height;
    };

    window.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('resize', resize);
    window.addEventListener('fullscreenchange', resize);

    resize();

    // Enable touch controls on first touch input.
    {
        let listenForFirstTouchEvent = () => {
            APP_CONFIG.touch_control_enabled = true;
            window.removeEventListener('touchstart', listenForFirstTouchEvent);
        };

        window.addEventListener('touchstart', listenForFirstTouchEvent);
    }

    let gameStateMachine = new GameStateMachine();
    gameStateMachine.pushState(new IntroGameState(gameStateMachine, context));

    // Allow to close menus by pressing `ESC`.
    // kontra.on(MenuStateMachine.EVENT_BACK, () => gameStateMachine.popState());

    kontra.on(MenuStateMachine.EVENT_CURSOR_MOVE, e => {
        if (e.success && e.from !== e.to) {
            zzfx(.5,0,4,.3,.29,.1,.5,90.4,.06); // ZzFX 51333
        }
    });

    kontra.on(MenuStateMachine.EVENT_ACTION, e => {
        if (e.success) {
            zzfx(.5,.1,100,.4,.09,0,.2,92.4,.04); // ZzFX 51333
        }
    });

    let loop = kontra.GameLoop({
        fps: 60,
        clearCanvas: false,
        update: (dt) => gameStateMachine.update(dt),
        render: () => gameStateMachine.render(),
    });

    loop.start();
});
