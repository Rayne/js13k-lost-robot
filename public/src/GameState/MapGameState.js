/**
 * The following code has to be refactored.
 */

import * as kontra from '../../../node_modules/kontra/kontra.mjs';

import {APP_CONFIG, RENDER_MODE_CUSTOM_RATIO, RENDER_MODE_SENSOR_RANGE} from "../config.js";
import {Map} from "../Map.js";
import * as Input from "../Input/Input.js";
import {MultiTouchInput} from "../Input/MultiTouchInput.js";
import {TouchToKeyboard} from "../Input/TouchToKeyboard.js";
import {createRobot} from "../Level/robot.js";
import {Log} from "../Log.js";
import {maps} from "../maps.js";
import {AM as AM} from "../math.js";
import {format_time, format_points, pad_left} from "../utils.js"

import {GameState} from "./GameState.js";
import {PauseMenuGameState} from "./PauseMenuGameState.js";
import {ShakeViewportEffect} from "../Effect/ShakeViewportEffect.js";

let updateCounter = 1;
let skipUpdates = 0;

export const EVENT_LEVEL_RESTART = 'level.restart';
export const EVENT_QUIT = 'level.quit';

export class MapGameState extends GameState {
    /**
     * @param {GameStateMachine} gameStateMachine
     * @param {CanvasRenderingContext2D} context
     */
    constructor(gameStateMachine, context) {
        super(gameStateMachine);

        this.EVENT_RESTART_LEVEL = () => {
            let newState = new MapGameState(gameStateMachine, context);
            newState.setLevel(this.levelId);

            this.gameStateMachine.popState();
            this.gameStateMachine.pushState(newState);
        };

        this.EVENT_QUIT = () => {
            this.gameStateMachine.popState();
        };

        this.shakeViewportEffect = new ShakeViewportEffect();

        this.context = context;
        this.levelId = 1;

        this.multiTouchInput = new MultiTouchInput(context.canvas);

        this.transparency = 0;
        this.touchToKeyboard = null;

        this.rememberedPoints = [];
        this.rememberedPointsPos = 0;
        this.rememberLimit = 512;
        this.rememberEveryFrame = 60;
        this.rememberInFrames = 0;
        this.pointLossCountdown = 0;
        this.map = new Map();
        this.robot = null;
        this.goal = null;

        this.userInput = new Input.UserInput();
    }

    setLevel(levelId) {
        this.levelId = levelId;
    }

    onEnter() {
        super.onEnter();

        kontra.on(EVENT_LEVEL_RESTART, this.EVENT_RESTART_LEVEL);
        kontra.on(EVENT_QUIT, this.EVENT_QUIT);

        let mapGameState = this;

        for (let i = 1; i <= maps.length; ++i) {
            if (!APP_CONFIG.mapStates[i]) {
                APP_CONFIG.mapStates[i] = {
                    time: 0,
                    points: 0,
                }
            }
        }

        let levelId = this.levelId;
        this.map.unSerialize(maps[levelId - 1], levelId);
        this.transparency = 0;

        this.robot = createRobot();

        this.robot.disabled = false;
        this.robot.polygon.pos.x = this.map.start.x;
        this.robot.polygon.pos.y = this.map.start.y;
        this.robot.polygon.setAngle(this.map.startAngle);

        this.rememberedPoints = [];
        this.rememberedPointsPos = 0;

        this.goal = kontra.Sprite({
            _c: 0,
            color: 'cyan',
            anchor: {x: 0.5, y: 0.5},
            x: this.map.goal.x - 32,
            y: this.map.goal.y - 32,
            width: 64,
            height: 64,
            update() {
                if (mapGameState.robot.disabled) {
                    // Do nothing if robot is disabled,
                    // e.g. don't trigger a goal event.
                    return;
                }

                let colors = [
                    '#93a8f9',
                    '#8ff7f9',
                    '#66f9d6',
                    '#6df9c3',
                    '#78f996',
                    '#aaf97f',
                    '#e5f97e',
                    '#f9de7e',
                    '#f9b280',
                    '#f97671',
                    '#f971a0',
                    '#f976d6',
                    '#de8ef9',
                ];
                this.color = colors[(++this._c / 10 | 0) % colors.length];
                this.rotation += 0.05;

                let robotPos = mapGameState.robot.polygon.pos;

                if (((this.x - robotPos.x) ** 2 + (this.y - robotPos.y) ** 2) < (64 ** 2)) {
                    mapGameState.robot.disabled = true;
                    mapGameState.map.timerEnabled = false;

                    // Horrible goal sound.
                    {
                        for (let i = 0; i < 15; ++i) {
                            setTimeout(x => zzfx(.7, .1, 527, .5, .15, 10.5, 0, 0, .51 + i / 50) /* ZzFX 31991 */, i * 150);
                        }
                    }

                    let mapState = APP_CONFIG.mapStates[mapGameState.map.id];
                    let points = mapGameState.map.points;
                    let time = mapGameState.map.time * 1000;

                    if (mapState.points < points) {
                        mapState.points = points;
                    }

                    let mapTime = mapState.time;

                    if (time < mapTime || mapTime === 0) {
                        mapState.time = time;
                    }

                    setTimeout(() => mapGameState.gameStateMachine.popState(), 3000);
                }
            }
        });
    }

    onExit() {
        super.onExit();

        kontra.off(EVENT_LEVEL_RESTART, this.EVENT_RESTART_LEVEL);
        kontra.off(EVENT_QUIT, this.EVENT_QUIT);
    }

    update(dt) {
        // Synchronize touch input.
        {
            if (this.touchToKeyboard === null && APP_CONFIG.touch_control_enabled) {
                this.touchToKeyboard = new TouchToKeyboard();
            }

            if (this.touchToKeyboard !== null) {
                this.touchToKeyboard.update(this.multiTouchInput);
            }
        }

        this.userInput.update();

        if (this.map.timerEnabled) {
            this.map.time += dt;
        }

        if (this.userInput.state[Input.PAUSE]) {
            this.gameStateMachine.pushState(new PauseMenuGameState(this.gameStateMachine));
            return;
        }

        if (skipUpdates > 0) {
            --skipUpdates;
            return;
        }

        this.shakeViewportEffect.update(dt);

        APP_CONFIG.DEBUG.quadtree.rects = [];
        APP_CONFIG.DEBUG.quadtree.segments = [];

        Log.instance().reset();

        updateCounter += 1;
        this.pointLossCountdown -= 1 / 60;

        this.map.doors.forEach(door => door.update());

        // Update robot position and collision handling.
        {
            let robot = this.robot;

            let oldPos = robot.polygon.pos.clone();
            let oldAngle = robot.polygon.angle;

            robot.update(dt, this.userInput.state);

            let obstacles = this.map.obstacles.obstacles.slice().concat(this.map.doors);

            for (let i = 0; i < obstacles.length; ++i) {
                let collides = SAT.testPolygonPolygon(robot.polygon, obstacles[i].polygon);

                if (collides) {
                    if (this.pointLossCountdown <= 0) {
                        this.pointLossCountdown = .5;
                        this.map.points -= 10;
                        zzfx(1, .2, 278, .3, .14, .6, 4.5, 3, .12); // ZzFX 31881

                        this.shakeViewportEffect.setTtl(0.1);
                    }

                    robot.onCollision();

                    // Reset position.
                    robot.polygon.pos.copy(oldPos);
                    robot.polygon.setAngle(oldAngle);

                    break;
                }
            }

            if (!robot.isColliding && robot.isMoving) {
                robot.addMovingEffects();
            }
        }

        if (this.rememberInFrames <= 0) {
            this.rememberInFrames = this.rememberEveryFrame;
        } else {
            this.rememberInFrames--;
        }

        // Collect collectibles.
        {
            let robotPos = this.robot.polygon.pos;

            this.map.collectibles.forEach(collectible => {
                // Ignore collected collectibles.
                // Collectibles were previously removed
                // but now we want to keep them for rendering a collectible shell
                // which can be used for orientation when visiting old map regions.
                if (collectible.isCollectible) {
                    if (((collectible.x - robotPos.x) ** 2 + (collectible.y - robotPos.y) ** 2) < (40 ** 2)) {
                        collectible.trigger();
                        return;
                    }

                    collectible.update();
                }
            });
        }

        // Sense obstacles with sensors.
        {
            this.robot.sensors.forEach(sensor => {
                sensor.update(this.robot);

                let lineSegments = [];

                // Collect segments.
                {
                    let xMin = Math.min(sensor._end.x, sensor._begin.x);
                    let xMax = Math.max(sensor._end.x, sensor._begin.x);
                    let yMin = Math.min(sensor._end.y, sensor._begin.y);
                    let yMax = Math.max(sensor._end.y, sensor._begin.y);

                    let sensorBoundingBox = {
                        x: xMin,
                        y: yMin,
                        width: xMax - xMin,
                        height: yMax - yMin,
                    };

                    APP_CONFIG.DEBUG.quadtree.rects.push(sensorBoundingBox);

                    let quadGet = this.map.obstacles.quadtree.get(sensorBoundingBox);

                    // Get obstacles in sensor range.
                    lineSegments = quadGet.map(item => item.segment);
                    APP_CONFIG.DEBUG.quadtree.segments.push(lineSegments);

                    // Add all closed doors.
                    this.map.doors.forEach(door => {
                        if (!door.isOpen) {
                            door.lineSegments.forEach(lineSegment => lineSegments.push(lineSegment))
                        }
                    });
                }

                let intersectionPoint = sensor.sense(lineSegments);

                if (intersectionPoint) {
                    // Apply distance depending noise.
                    // TODO Export this as module.
                    if (APP_CONFIG.DEBUG.add_noise_to_sensors) {
                        let distance = sensor.distance;
                        let noise = distance <= 100 ? 0 : Math.min(Math.log10(distance / (distance < 200 ? 25 : 0.0001)), 20);
                        intersectionPoint.moveXY((Math.random() - 0.5) * noise, (Math.random() - 0.5) * noise);
                    }

                    if (this.rememberInFrames === 0) {
                        this.rememberedPointsPos = (this.rememberedPointsPos + 1) % this.rememberLimit;
                        this.rememberedPoints[this.rememberedPointsPos] = intersectionPoint;
                    }
                }
            });
        }

        this.goal.update();

        if (this.robot.disabled) {
            this.transparency += 1 / (60 * 2); // Needs two seconds at 60 UPS.
        }

        this.multiTouchInput.tick();
    }

    render() {
        let context = this.context;
        let width = context.canvas.width;
        let height = context.canvas.height;

        context.fillStyle = '#fff';
        context.fillRect(0, 0, width, height);

        let ratio = 1;

        if (APP_CONFIG.DEBUG.render_mode === RENDER_MODE_SENSOR_RANGE) {
            let targetLength = 1024; // Hardcoded max. sensor distance multiplied by two
            let clientWidth = context.canvas.width;
            let clientHeight = context.canvas.height;

            let clientLength = Math.min(clientWidth, clientHeight);
            ratio = clientLength / targetLength;
        }

        else if (APP_CONFIG.DEBUG.render_mode === RENDER_MODE_CUSTOM_RATIO) {
            ratio = APP_CONFIG.DEBUG.render_mode_ratio;
        }

        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        if (this.shakeViewportEffect.ttl > 0) {
            this.shakeViewportEffect.render(context);
        }

        // Update the viewport.
        {
            let robotX = this.robot.polygon.pos.x;
            let robotY = this.robot.polygon.pos.y;

            let cx = (width / 2) / ratio - robotX;
            let cy = (height / 2) / ratio - robotY;

            let mx = robotX;
            let my = robotY;

            context.fillStyle = '#fff';
            context.fillRect(0, 0, width, height);
            context.translate(cx, cy);

            if (APP_CONFIG.relative_camera_enabled) {
                context.translate(mx, my);
                context.rotate(-this.robot.polygon.angle - AM.deg2rad(90));
                context.translate(-mx, -my);
            }
        }

        // Displays quadtree cells.
        if (APP_CONFIG.DEBUG.render_quadtree_all || APP_CONFIG.DEBUG.render_quadtree_cells || APP_CONFIG.DEBUG.render_quadtree_boxes) {
            context.lineWidth = 1;

            let renderQuadtree = function (node) {
                if (APP_CONFIG.DEBUG.render_quadtree_all || APP_CONFIG.DEBUG.render_quadtree_cells) {
                    context.strokeStyle = '#c0c0c0';
                    context.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
                }

                // Render children.
                //
                // > render the subnodes so long as this node is a branch and has subnodes
                // >
                // > - Kontra documentation
                if (node._b && node._s.length) {
                    for (let i = 0; i < 4; i++) {
                        renderQuadtree(node._s[i]);
                    }
                }

                // Render object bounding boxes.
                if (APP_CONFIG.DEBUG.render_quadtree_all || APP_CONFIG.DEBUG.render_quadtree_boxes) {
                    node._o.forEach(object => {
                        context.strokeStyle = 'rgba(255,0,0,0.5)';
                        context.strokeRect(object.x, object.y, object.width, object.height);
                    })
                }
            };

            renderQuadtree(this.map.obstacles.quadtree);
        }

        // Displays active segments.
        if (APP_CONFIG.DEBUG.render_quadtree_all || APP_CONFIG.DEBUG.render_quadtree_segments) {
            let segmentCounter = 0;
            let segmentCounterMax = 22 * (this.map.obstacles.obstacles.length + this.map.doors.length);

            APP_CONFIG.DEBUG.quadtree.segments.forEach(segments => {
                segments.forEach(segment => {
                    segmentCounter += 1;

                    context.lineWidth = 8;
                    context.strokeStyle = '#ff0000';

                    context.beginPath();
                    context.moveTo(segment[0].x, segment[0].y);
                    context.lineTo(segment[1].x, segment[1].y);
                    context.stroke();
                });
            });

            Log.instance().log('Reduced intersection checks to ' + segmentCounter + ' of ' + segmentCounterMax + '.');
        }

        // Displays active queries.
        if (APP_CONFIG.DEBUG.render_quadtree_all || APP_CONFIG.DEBUG.render_quadtree_queries) {
            APP_CONFIG.DEBUG.quadtree.rects.forEach(rect => {
                context.fillStyle = 'rgba(117,112,204,0.1)';

                context.lineWidth = 1;
                context.strokeStyle = 'rgba(0,0,255,0.5)';

                context.beginPath();
                context.rect(rect.x, rect.y, rect.width, rect.height);
                context.stroke();
            });
        }

        // Render the ground truth.
        if (APP_CONFIG.DEBUG.render_groundtruth) {
            this.map.obstacles.render();
        }

        this.goal.render();

        // Render the remembered points.
        this.rememberedPoints.forEach(vector => {
            context.beginPath();
            context.arc(vector.x, vector.y, 2, 0, 2 * Math.PI, false);
            context.fillStyle = '#a894f3';
            context.fill();
        });

        // Render doors, collectibles, sensors and the robot.
        this.map.doors.forEach(door => door.render());
        this.map.collectibles.forEach(o => o.render());
        this.robot.sensors.forEach(s => s.render(context));
        this.robot.render();

        // Reset the transformation to be able to render the HUD.
        context.setTransform(1, 0, 0, 1, 0, 0);

        context.font = "10px monospace";
        context.fillStyle = "blue";

        {
            let tickEnd = APP_CONFIG.DEBUG.frames.tickBegin;
            let tickBegin = Date.now();

            APP_CONFIG.DEBUG.frames.tickEnd = tickEnd;
            APP_CONFIG.DEBUG.frames.tickBegin = tickBegin;

            let tickDiff = tickBegin - tickEnd;
            let dt = tickDiff / 1000;
            let fps = Math.floor(1000 / tickDiff);

            {
                let offset = 64 + 32;
                let i = 0;
                context.fillText('== AUTOMATIC DIAGNOSIS ==', 8, offset + (++i) * 16);

                ++i;

                context.fillText('FPS=' + pad_left(APP_CONFIG.DEBUG.frames.slidingMean.addValue(fps).getMean() | 0, 2, 0), 8, offset + (++i) * 16);
                context.fillText('UPF=' + pad_left(updateCounter, 2, 0), 8 + 48, offset + i * 16);

                {
                    let x = this.robot.polygon.pos.x.toFixed(2);
                    let y = this.robot.polygon.pos.y.toFixed(2);
                    let a = (this.robot.polygon.angle % (Math.PI * 2)).toFixed(2);
                    context.fillText('POSE=(' + x + ',' + y + ',' + a + ')', 8, offset + (++i) * 16);
                }

                let sensors = this.robot.sensors;
                let sensorCount = sensors.length;

                ++i;

                context.fillText('** SENSORS **', 8, offset + (++i) * 16);

                ++i;

                context.fillText('DISTANCE_LASER = ' + sensorCount, 8, offset + (++i) * 16);
                context.fillText('DISTANCE_SONIC = 0', 8, offset + (++i) * 16);
                context.fillText('STEREO_CAMERA  = 0', 8, offset + (++i) * 16);
                context.fillText('TEMPERATURE    = 0', 8, offset + (++i) * 16);
                context.fillText('IMU            = 1', 8, offset + (++i) * 16);
                context.fillText('GPS            = 1', 8, offset + (++i) * 16);
                context.fillText('WHEEL_ENCODER  = 2', 8, offset + (++i) * 16);

                ++i;

                context.fillText('** MODULES **', 8, offset + (++i) * 16);

                ++i;

                /**
                 * You will now witness that the mapping module is offline.
                 * My friend Jörg said, that if he had written the mapping module, it wouldn't be offline.
                 */
                context.fillText('BEHAVIORS   = OFFLINE [!]', 8, offset + (++i) * 16);
                context.fillText('GRIDMAP     = OFFLINE [!]', 8, offset + (++i) * 16);
                context.fillText('LANDMARKS   = ONLINE', 8, offset + (++i) * 16);
                context.fillText('POSE        = ONLINE', 8, offset + (++i) * 16);
                context.fillText('REMOTE_CTRL = ONLINE', 8, offset + (++i) * 16);
                context.fillText('WEAKMAP     = ONLINE', 8, offset + (++i) * 16);
            }

            updateCounter = 0;
        }

        // Slowly blend out the environment when the goal was reached.
        if (this.robot.disabled) {
            context.rect(0, 0, width, height);
            context.fillStyle = 'rgba(255,255,255,' + this.transparency + ')';
            context.fill();
        }

        // Display timer.
        if (this.map.time) {
            let x = this.robot.disabled ? width / 2 - 64 : 8;
            let y = this.robot.disabled ? height / 2 - 32 : 32;
            let size = this.robot.disabled ? 32 : 24;

            context.fillStyle = "blue";
            context.font = size + "px monospace";

            context.fillText(format_time(this.map.time * 1000), x, y);
            context.fillText(format_points(this.map.points), x, y + 32);
        }

        if (this.touchToKeyboard !== null) {
            this.touchToKeyboard.render();
        }

        if (APP_CONFIG.DEBUG.render_log) {
            Log.instance().render(context);
        }
    }
}
