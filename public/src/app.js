import {
    Sprite,
    init as kontra_init,
    initKeys as kontra_initKeys,
    getCanvas as kontra_getCanvas,
    getContext as kontra_getContext,
    GameLoop as kontra_GameLoop,
} from '../../node_modules/kontra/kontra.mjs';
import {createRobot} from "./robot.js";
import {SlidingMean} from "./SlidingMean.js";
import {AM as AM} from "./math.js";
import {maps} from "./maps.js";
import {Map} from "./Map.js"
import {format_time, format_points, pad_left} from "./utils.js"
import {MultiTouchInput} from "./Input/MultiTouchInput.js";
import {UserInput} from "./Input/Input.js";
import {TouchToKeyboard} from "./Input/TouchToKeyboard.js";
import {Log} from "./Log.js";

let showLevelSelectScreen = null;

let APP = {
    DEBUG: {
        render_log: false,
        render_groundtruth: false,
        render_quadtree_all: false,
        render_quadtree_boxes: false,
        render_quadtree_cells: false,
        render_quadtree_queries: false,
        render_quadtree_segments: false,
        add_noise_to_sensors: true,
        frames: {
            slidingMean: new SlidingMean(60, 60),
            tickEnd: Date.now() - 60,
            tickBegin: Date.now(),
        },
        quadtree: {
            rects: [],
            segments: [],
        }
    },
    resize_canvas: true,
    mapStates: {},
    relative_camera_enabled: true,
    showLevelSelect() {
        showLevelSelectScreen();
    },
    touch2keys: {},
};

// Register global variable.
document.APP = APP;

document.addEventListener('DOMContentLoaded', function () {
    let transparency = 0;

    kontra_init();
    kontra_initKeys();

    let touchToKeyboard = new TouchToKeyboard();

    let rememberedPoints = [];
    let rememberedPointsPos = 0;
    let rememberLimit = 512;
    let rememberEveryFrame = 60;
    let rememberInFrames = 0;

    let pointLossCountdown = 0;

    let map = new Map();

    let robot = createRobot();

    let goal = Sprite({
        _c: 0,
        color: 'cyan',
        anchor: {x: 0.5, y: 0.5},
        x: 0,
        y: 0,
        width: 64,
        height: 64,
        update() {
            if (robot.disabled) {
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

            let robotPos = robot.polygon.pos;

            if (((this.x - robotPos.x) ** 2 + (this.y - robotPos.y) ** 2) < (64 ** 2)) {
                robot.disabled = true;
                map.stopTimer();

                // Horrible goal sound.
                {
                    for (let i = 0; i < 15; ++i) {
                        setTimeout(x => zzfx(.7, .1, 527, .5, .15, 10.5, 0, 0, .51 + i / 50) /* ZzFX 31991 */, i * 150);
                    }
                }

                let mapState = APP.mapStates[map.id];
                let points = map.points;
                let time = map.timerStop - map.timerStart;

                if (mapState.points < points) {
                    mapState.points = points;
                }

                let mapTime = mapState.time;

                if (time < mapTime || mapTime === 0) {
                    mapState.time = time;
                }

                setTimeout(showLevelSelectScreen, 3000);
            }
        }
    });

    let multiTouchInput = new MultiTouchInput(kontra_getCanvas());

// Configure the debug menu and start button.
    {
        let d = document;

        let $groundtruth = d.querySelector('input[name="groundtruth"]');
        let $fixedCamera = d.querySelector('input[name="fixed-camera"]');
        let $noise = d.querySelector('input[name="noise"]');

        let $titleScreen = d.getElementById('title-screen');
        let $startButton = d.getElementById('start');

        let $levelSelection = d.getElementById('level');
        let $levelSelectionMenu = d.getElementById('level-select');

        // Firefox remembers the old button state. Overwrite it.
        $startButton.disabled = true;

        {
            $startButton.innerText = "Start";
            $startButton.disabled = false;

            $startButton.onclick = function () {
                $titleScreen.style.display = 'none';
                showLevelSelectScreen();
            };

            $startButton.focus();
        }

        $groundtruth.onclick = function () {
            APP.DEBUG.render_groundtruth = $groundtruth.checked;
        };

        $fixedCamera.onclick = function () {
            APP.relative_camera_enabled = !$fixedCamera.checked;
        };

        $noise.onclick = function () {
            APP.DEBUG.add_noise_to_sensors = $noise.checked;
        };

        $groundtruth.checked = APP.DEBUG.render_groundtruth;
        $fixedCamera.checked = !APP.relative_camera_enabled;
        $noise.checked = APP.DEBUG.add_noise_to_sensors;

        showLevelSelectScreen = function () {
            robot.disabled = true;
            $titleScreen.style.display = 'none'; // Required for players pressing ESC on the title screen.
            $levelSelection.style.display = 'block';

            let $levelZone = $levelSelectionMenu;
            $levelZone.innerHTML = '';

            let template = '<div><div><button data-id="LEVEL">MAP LEVEL<br>Points: POINTS<br>Time: TIME</button></div></div>';

            for (let i = 1; i <= maps.length; ++i) {
                if (!APP.mapStates[i]) {
                    APP.mapStates[i] = {
                        time: 0,
                        points: 0,
                    }
                }

                let mapState = APP.mapStates[i];

                $levelZone.innerHTML += template
                    .replace('POINTS', mapState.points)
                    .replace('TIME', format_time(mapState.time))
                    .replace(/LEVEL/g, i)
            }

            $levelZone.onclick = e => {
                let levelId = e.target.getAttribute('data-id');
                map.unSerialize(maps[levelId - 1], levelId);
                transparency = 0;
                $levelSelection.style.display = 'none';

                robot.disabled = false;
                robot.polygon.pos.x = map.start.x;
                robot.polygon.pos.y = map.start.y;
                robot.polygon.setAngle(map.startAngle);

                rememberedPoints = [];
                rememberedPointsPos = 0;

                goal.x = map.goal.x - 32;
                goal.y = map.goal.y - 32;

                /*
                goal.x = robot.polygon.pos.x - 132;
                goal.y = robot.polygon.pos.y - 132;
                 */
            };
        };
    }

    let collides = false;
    let updateCounter = 1;
    let skipUpdates = 0;

    let loop = kontra_GameLoop({
        update() {
            if (skipUpdates > 0) {
                --skipUpdates;
                return;
            }

            APP.DEBUG.quadtree.rects = [];
            APP.DEBUG.quadtree.segments = [];

            Log.instance().reset();

            updateCounter += 1;
            pointLossCountdown -= 1 / 60;

            touchToKeyboard.update(multiTouchInput);

            map.doors.forEach(door => door.update());

            // Update robot position and collision handling.
            {
                let oldPos = robot.polygon.pos.clone();
                let oldAngle = robot.polygon.angle;

                let userInput = new UserInput(); // TODO Store in robot or global.
                userInput.update();
                robot.update(userInput.state);

                let obstacles = map.obstacles.obstacles.slice().concat(map.doors);
                let collisionOccured = false;

                for (let i = 0; i < obstacles.length; ++i) {
                    collides = SAT.testPolygonPolygon(robot.polygon, obstacles[i].polygon);

                    if (collides) {
                        if (pointLossCountdown <= 0) {
                            pointLossCountdown = .5;
                            map.points -= 10;
                            zzfx(1, .2, 278, .3, .14, .6, 4.5, 3, .12); // ZzFX 31881
                        }

                        robot.onCollision();

                        // Reset position.
                        robot.polygon.pos.copy(oldPos);
                        robot.polygon.setAngle(oldAngle);

                        robot.isMoving = false;
                        collisionOccured = true;

                        // skipUpdates = 60 * 0.01;
                        break;
                    }
                }

                if (!collisionOccured && robot.isMoving) {
                    robot.addMovingEffects();
                }
            }

            if (rememberInFrames <= 0) {
                rememberInFrames = rememberEveryFrame;
            } else {
                rememberInFrames--;
            }

            // Collect collectibles.
            {
                let robotPos = robot.polygon.pos;

                map.collectibles.forEach(collectible => {
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
                robot.sensors.forEach(sensor => {
                    sensor.update(robot);

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

                        APP.DEBUG.quadtree.rects.push(sensorBoundingBox);

                        let quadGet = map.obstacles.quadtree.get(sensorBoundingBox);

                        // Get obstacles in sensor range.
                        lineSegments = quadGet.map(item => item.segment);
                        APP.DEBUG.quadtree.segments.push(lineSegments);

                        // Add all closed doors.
                        map.doors.forEach(door => {
                            if (!door.isOpen) {
                                door.lineSegments.forEach(lineSegment => lineSegments.push(lineSegment))
                            }
                        });
                    }

                    let intersectionPoint = sensor.sense(lineSegments);

                    if (intersectionPoint) {
                        // Apply distance depending noise.
                        // TODO Export this as module.
                        if (APP.DEBUG.add_noise_to_sensors) {
                            let distance = sensor.distance;
                            let noise = distance <= 100 ? 0 : Math.min(Math.log10(distance / (distance < 200 ? 25 : 0.0001)), 20);
                            intersectionPoint.moveXY((Math.random() - 0.5) * noise, (Math.random() - 0.5) * noise);
                        }

                        if (rememberInFrames === 0) {
                            rememberedPointsPos = (rememberedPointsPos + 1) % rememberLimit;
                            rememberedPoints[rememberedPointsPos] = intersectionPoint;
                        }
                    }
                });
            }

            goal.update();

            if (robot.disabled) {
                transparency += 1 / (60 * 2); // Needs two seconds at 60 UPS.
            }

            multiTouchInput.tick();
        },
        render() {
            let canvas = kontra_getCanvas();
            let context = kontra_getContext();

            // React to resize events once per frame.
            if (APP.resize_canvas) {
                let boundingClientRect = kontra_getCanvas().getBoundingClientRect();
                canvas.width = boundingClientRect.width;
                canvas.height = boundingClientRect.height;

                APP.resize_canvas = false;
            }

            /**
             * All `setTransform()` calls are dedicated to Martin.
             * I don't understand his love with Edge.
             *
             * Experimental API `context.resetTransform()` isn't supported by Edge.
             *
             * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/resetTransform
             */
            context.setTransform(1, 0, 0, 1, 0, 0);

            // Update the viewport.
            {
                let width = canvas.width;
                let height = canvas.height;
                let robotX = robot.polygon.pos.x;
                let robotY = robot.polygon.pos.y;

                let cx = width / 2 - robotX;
                let cy = height / 2 - robotY;

                let mx = robotX;
                let my = robotY;

                context.clearRect(0, 0, width, height);
                context.translate(cx, cy);

                if (APP.relative_camera_enabled) {
                    context.translate(mx, my);
                    context.rotate(-robot.polygon.angle - AM.deg2rad(90));
                    context.translate(-mx, -my);
                }
            }

            // Displays quadtree cells.
            if (APP.DEBUG.render_quadtree_all || APP.DEBUG.render_quadtree_cells || APP.DEBUG.render_quadtree_boxes) {
                context.lineWidth = 1;

                let renderQuadtree = function (node) {
                    if (APP.DEBUG.render_quadtree_all || APP.DEBUG.render_quadtree_cells) {
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
                    if (APP.DEBUG.render_quadtree_all || APP.DEBUG.render_quadtree_boxes) {
                        node._o.forEach(object => {
                            context.strokeStyle = 'rgba(255,0,0,0.5)';
                            context.strokeRect(object.x, object.y, object.width, object.height);
                        })
                    }
                };

                renderQuadtree(map.obstacles.quadtree);
            }

            // Displays active segments.
            if (APP.DEBUG.render_quadtree_all || APP.DEBUG.render_quadtree_segments) {
                let segmentCounter = 0;
                let segmentCounterMax = 22 * (map.obstacles.obstacles.length + map.doors.length);

                APP.DEBUG.quadtree.segments.forEach(segments => {
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
            if (APP.DEBUG.render_quadtree_all || APP.DEBUG.render_quadtree_queries) {
                APP.DEBUG.quadtree.rects.forEach(rect => {
                    context.fillStyle = 'rgba(117,112,204,0.1)';

                    context.lineWidth = 1;
                    context.strokeStyle = 'rgba(0,0,255,0.5)';

                    context.beginPath();
                    context.rect(rect.x, rect.y, rect.width, rect.height);
                    context.stroke();
                });
            }

            // Render the ground truth.
            if (APP.DEBUG.render_groundtruth) {
                map.obstacles.render();
            }

            goal.render();

            // Render the remembered points.
            rememberedPoints.forEach(vector => {
                context.beginPath();
                context.arc(vector.x, vector.y, 2, 0, 2 * Math.PI, false);
                context.fillStyle = '#a894f3';
                context.fill();
            });

            // Render doors, collectibles, sensors and the robot.
            map.doors.forEach(door => door.render());
            map.collectibles.forEach(o => o.render());
            robot.sensors.forEach(s => s.render(context));
            robot.render();

            // Reset the transformation to be able to render the HUD.
            context.setTransform(1, 0, 0, 1, 0, 0);

            context.font = "10px monospace";
            context.fillStyle = "blue";

            {
                let tickEnd = APP.DEBUG.frames.tickBegin;
                let tickBegin = Date.now();

                APP.DEBUG.frames.tickEnd = tickEnd;
                APP.DEBUG.frames.tickBegin = tickBegin;

                let tickDiff = tickBegin - tickEnd;
                let dt = tickDiff / 1000;
                let fps = Math.floor(1000 / tickDiff);

                {
                    let offset = 64 + 32;
                    let i = 0;
                    context.fillText('== AUTOMATIC DIAGNOSIS ==', 8, offset + (++i) * 16);

                    ++i;

                    context.fillText('FPS=' + pad_left(APP.DEBUG.frames.slidingMean.addValue(fps).getMean() | 0, 2, 0), 8, offset + (++i) * 16);
                    context.fillText('UPF=' + pad_left(updateCounter, 2, 0), 8 + 48, offset + i * 16);

                    {
                        let x = robot.polygon.pos.x.toFixed(2);
                        let y = robot.polygon.pos.y.toFixed(2);
                        let a = (robot.polygon.angle % (Math.PI * 2)).toFixed(2);
                        context.fillText('POSE=(' + x + ',' + y + ',' + a + ')', 8, offset + (++i) * 16);
                    }

                    let sensors = robot.sensors;
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
            if (robot.disabled) {
                context.rect(0, 0, canvas.width, canvas.height);
                context.fillStyle = 'rgba(255,255,255,' + transparency + ')';
                context.fill();
            }

            // Display timer.
            if (map.timerStart) {
                let x = robot.disabled ? canvas.width / 2 - 64 : 8;
                let y = robot.disabled ? canvas.height / 2 - 32 : 32;
                let size = robot.disabled ? 32 : 24;

                context.fillStyle = "blue";
                context.font = size + "px monospace";

                let timer = (map.timerStop ? map.timerStop : Date.now()) - map.timerStart;

                context.fillText(format_time(timer), x, y);
                context.fillText(format_points(map.points), x, y + 32);
            }

            touchToKeyboard.render();

            if (APP.DEBUG.render_log) {
                Log.instance().render(context);
            }
        }
    });

    loop.start();

    window.addEventListener('resize', () => APP.resize_canvas = true);
});
