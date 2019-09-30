import * as kontra from "../../node_modules/kontra/kontra.mjs";
import {GameStateMachine} from "./GameState/GameStateMachine.js";
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

    let loop = kontra.GameLoop({
        fps: 60,
        clearCanvas: false,
        update: (dt) => gameStateMachine.update(dt),
        render: () => gameStateMachine.render(),
    });

    loop.start();
});
