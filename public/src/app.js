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
import {Map} from "./Map.js"
import {format_time, format_points, pad_left} from "./utils.js"
import {MultiTouchInput} from "./Input/MultiTouchInput.js";
import {UserInput} from "./Input/Input.js";
import {TouchToKeyboard} from "./Input/TouchToKeyboard.js";
import {Log} from "./Log.js";

/**
 * Mapping pipeline:
 *
 * 1. Build a map in Inkscape (or another SVG program). Tag polygons as collectibles, obstacles or doors
 *
 * 2. Convert the SVG file to a map file with `/bin/svg2map`
 *
 * 3. Copy the result into the `maps` list below
 */
let maps = [
    '{"start":[258,-549],"goal":[2006,-157],"doors":[[398,-348,460,-413,"#2aff80",true],[1463,291,1481,174,"#55ddff",true],[644,-102,707,-166,"#2aff80",false]],"obstacles":[[76,-868,76,-348,398,-348,644,-102,607,-65,874,455,1451,363,1463,291,1874,291,1874,340,2176,192,1986,43,2176,-104,2176,-252,1874,-252,1874,174,1481,174,1542,-215,1020,-479,707,-166,460,-413,460,-868,76,-868],[762,-258,1051,111,1213,95,1250,-129,1117,-206]],"collectibles":[[258,-686,"#2aff80"],[1102,-27,"#55ddff"],[470,-335,"#e9afaf"],[653,-156,"#e9afaf"],[1545,238,"#e9afaf"],[1931,40,"#e9afaf"],[562,-247,"#2aff80"],[2074,185,"#e9afaf"]]}',

    '{"start":[605,-2405],"goal":[1122,-2440],"doors":[[438,-1674,438,-1795,"#55ddff",true],[930,-2154,930,-2275,"#55ddff",true],[930,-1674,930,-1795,"#55ddff",false],[-290,-644,-291,-940,"#2aff80",false],[1110,-1231,1045,-1104,"#2aff80",true],[561,-2560,807,-2560,"#2aff80",true],[338,-1161,186,-1176,"#2aff80",true],[628,-1213,633,-1354,"#2aff80",false]],"obstacles":[[930,-2154,1248,-2154,1348,-2079,1377,-1953,1322,-1847,1189,-1795,930,-1795,930,-2154],[502,-1365,342,-1338,235,-1268,186,-1176,186,-940,-291,-940,-291,-1268,-143,-1523,117,-1674,438,-1674,684,-1422,930,-1674,1189,-1674,1189,-1674,1322,-1604,1377,-1511,1388,-1396,1294,-1267,1110,-1231,894,-1333,502,-1365],[561,-2560,438,-2560,438,-1795,77,-1795,-235,-1615,-416,-1302,-416,-940,-416,-645,311,-645,311,-1058,338,-1161,416,-1218,844,-1204,1045,-1104,1248,-1056,1424,-1066,1557,-1125,1694,-1386,1750,-1735,1740,-2111,1794,-2294,1917,-2427,1945,-2542,1841,-2671,1661,-2725,1534,-2685,1468,-2546,1415,-2404,1341,-2313,1248,-2275],[1248,-2275,930,-2275,930,-2560,807,-2560,807,-2637,995,-2637,995,-2341,1285,-2341,1285,-2720,1137,-2873,586,-2873,438,-2755,438,-2637,558,-2637,561,-2560],[1565,-2459,1650,-2476,1697,-2406,1656,-2298,1571,-2254,1512,-2300,1565,-2459]],"collectibles":[[1711,-2578,"#55ddff"],[863,-1253,"#2aff80"],[991,-1732,"#a0892c"],[1107,-1730,"#a0892c"],[991,-2210,"#a0892c"],[1145,-2210,"#a0892c"],[351,-1732,"#a0892c"],[120,-1732,"#a0892c"],[612,-1880,"#a0892c"],[487,-1749,"#a0892c"],[663,-1965,"#a0892c"],[562,-1808,"#a0892c"],[248,-980,"#2aff80"],[429,-1281,"#2aff80"],[714,-2045,"#a0892c"],[782,-2128,"#a0892c"],[860,-2183,"#a0892c"],[1734,-2308,"#a0892c"],[1493,-2433,"#a0892c"],[1342,-1165,"#a0892c"],[-356,-947,"#a0892c"],[-184,-1571,"#a0892c"],[-351,-1287,"#a0892c"],[748,-2511,"#a0892c"],[875,-2269,"#a0892c"],[822,-2348,"#a0892c"],[780,-2428,"#a0892c"],[1408,-2024,"#a0892c"],[1376,-2107,"#a0892c"],[1306,-2162,"#a0892c"]]}',

    '{"start":[-1268,-3910],"goal":[-2649,-3240],"doors":[[-3067,-3066,-3173,-3066,"#55ddff",true],[-2466,-2660,-2466,-2873,"#2aff80",true],[-987,-3669,-1093,-3669,"#55ddff",true],[-1201,-2875,-1201,-3019,"#55ddff",true],[-987,-3642,-1093,-3642,"#2aff80",true],[-2216,-3080,-2322,-3080,"#55ddff",false],[-2216,-3052,-2322,-3052,"#2aff80",false]],"obstacles":[[1565,-2459,1650,-2476,1697,-2406,1656,-2298,1571,-2254,1512,-2300,1565,-2459],[-1243,-4197,-1623,-3689,-1093,-3689,-1093,-3617,-1358,-3377,-1623,-3617,-1623,-3495,-1695,-3495,-1695,-3617,-2419,-3617,-2419,-3109,-2322,-3109,-2322,-3020,-2419,-3020,-2419,-2873,-2512,-2873,-2512,-3020,-3067,-3020,-3067,-3109,-2512,-3109,-2512,-3617,-3236,-3617,-3236,-3109,-3173,-3109,-3173,-3020,-3579,-2893,-3579,-2639,-2512,-2512,-2512,-2660,-2419,-2660,-2419,-2512,-1839,-2512,-1569,-2047,-779,-2047,-485,-2512,-485,-3020,-485,-4197,-794,-4197,-794,-4121,-900,-4121,-900,-4197,-1243,-4197],[-900,-4015,-794,-4015,-794,-3689,-696,-3689,-696,-3617,-794,-3617,-794,-3020,-2216,-3020,-2216,-3109,-1695,-3109,-1695,-3388,-1623,-3388,-1623,-3109,-900,-3109,-900,-3617,-987,-3617,-987,-3689,-900,-3689,-900,-4015],[-3006,-3161,-3006,-3361,-2767,-3361,-3006,-3161],[-2132,-3436,-1767,-3436,-2132,-3179,-2132,-3436],[-882,-2305,-1101,-2370,-1278,-2226,-1284,-2454,-1475,-2579,-1260,-2655,-1201,-2875,-1062,-2694,-835,-2706,-964,-2518,-882,-2305]],"collectibles":[[-2263,-3402,"#55ddff"],[-853,-4068,"#a0892c"],[-1122,-3272,"#2aff80"],[-638,-3652,"#a0892c"],[-2634,-2766,"#a0892c"],[-3463,-2766,"#a0892c"],[-1014,-2937,"#a0892c"],[-1936,-2649,"#a0892c"],[-1532,-2290,"#a0892c"],[-1374,-2931,"#a0892c"],[-853,-2272,"#a0892c"],[-1664,-3440,"#a0892c"]]}',

    '{"start":[-211,-2507],"goal":[948,-3195],"doors":[[669,-2722,944,-2862,"#2aff80",true],[397,-2869,445,-2564,"#55ddff",true],[888,-2558,1106,-2339,"#d8ed7a",true],[526,-2302,659,-2010,"#55ddff",false],[1321,-3846,1413,-3610,"#d8ed7a",true]],"obstacles":[[659,-2010,800,-2299,1106,-2339],[888,-2558,944,-2862],[669,-2722,397,-2869],[445,-2564,221,-2351,526,-2302,24,-2302,-40,-2934,-481,-2601,24,-2010,659,-2010],[221,-2351,-72,-3251,233,-3466,532,-3242,397,-2869],[154,-3046,107,-3195,236,-3285,361,-3191,310,-3043,154,-3046],[944,-2862,746,-3246,1010,-3373,1220,-2988,1846,-3152,1547,-3924,233,-3466],[1413,-3610,1543,-3283,1327,-3190],[1106,-2339,1220,-2988]],"collectibles":[[1513,-3769,"#d8ed7a"],[670,-2477,"#55ddff"],[229,-3353,"#2aff80"],[58,-3095,"#a0892c"],[401,-3088,"#a0892c"],[-115,-2743,"#a0892c"],[-153,-2614,"#a0892c"],[-53,-2261,"#a0892c"],[653,-3236,"#a0892c"],[581,-2976,"#a0892c"],[1241,-3164,"#a0892c"],[1258,-3683,"#a0892c"],[1112,-3632,"#a0892c"],[964,-3577,"#a0892c"],[346,-2146,"#a0892c"]]}',
];

let showLevelSelectScreen = null;

let APP = {
    DEBUG: {
        render_groundtruth: false,
        add_noise_to_sensors: true,
        frames: {
            slidingMean: new SlidingMean(60, 60),
            tickEnd: Date.now() - 60,
            tickBegin: Date.now(),
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

            robot.sensors.forEach(sensor => {
                sensor.update(robot);

                let lineSegments = map.obstacles.lineSegments.slice();

                map.doors.forEach(
                    door => door.lineSegments.forEach(
                        lineSegment => lineSegments.push(lineSegment)));

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
        }
    });

    loop.start();

    window.addEventListener('resize', () => APP.resize_canvas = true);
});
