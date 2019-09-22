/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

import {Sprite} from "../../node_modules/kontra/kontra.mjs";
import {ObstacleManager} from "./ObstacleManager.js"
import {AM} from "./math.js";

class Map {
    constructor() {
        this.reset();
    }

    startTimer() {
        this.timerStart = Date.now();
    }

    stopTimer() {
        if (!this.timerStop) {
            this.timerStop = Date.now();
        }
    }

    reset() {
        this.points = 0;
        this.timerStart = null;
        this.timerStop = null;
        this.collectibles = [];
        this.doors = [];
        this.obstacles = new ObstacleManager();
        this._triggers = [];
        this.start = new AM.Vector2D();
        this.startAngle = Math.PI / 2;
        this.goal = new AM.Vector2D();
    }

    /**
     * FIXME There are rare occurrences of
     *       "SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data".
     *       It's sometimes possible to reproduce the error message in the console
     *       but the maps are loaded as expected.
     *
     * @param {string} serializedMap
     * @param {string} mapId
     */
    unSerialize(serializedMap, mapId) {
        this.reset();
        this.id = mapId;

        this.startTimer();

        let map = this;
        let mapObject = JSON.parse(serializedMap);

        if (!mapObject.start) {
            throw "Map start not defined!";
        }

        map.start.setXY(mapObject.start[0], mapObject.start[1]);
        map.goal.setXY(mapObject.goal[0], mapObject.goal[1]);

        mapObject.collectibles.forEach(data => {
            let sprite = map.addCollectible(data[0], data[1]);

            if (data[2]) {
                // TODO Use a trigger type instead.
                sprite.colors = [data[2]];
                sprite.setTriggerId(data[2]);
            }
        });

        mapObject.obstacles.forEach(function (obstacle) {
            map.obstacles.addPolygon(obstacle);
        });

        mapObject.doors.forEach(function (door) {
            let sprite = map.addDoor(door[0], door[1], door[2], door[3], door[4], door[5]);

            let triggerId = door[4];

            if (triggerId) {
                if (!map._triggers[triggerId]) {
                    map._triggers[triggerId] = [];
                }

                map._triggers[triggerId].push(function () {
                    sprite.isOpen = !sprite.isOpen;
                });
            }
        });

        // Finalize the loading process by building the quadtree.
        map.obstacles.updateQuadtree();
    }

    addCollectible(cx, cy) {
        let map = this;

        let sprite = Sprite({
            x: cx,
            y: cy,
            radius: 16,
            width: 32, // TODO Optional?
            height: 32, // TODO Optional?

            colors: [
                '#e6e049',
                '#e8e249',
                '#eae448',
                '#ece64b',
                '#eae44a',
                '#e8e249',
            ],
            color: '#ffffff',
            colorPos: 0,

            triggerListener: this,
            triggerId: null,

            isCollectible: true,

            update: function () {
                this.colorPos += 1;
                this.color = this.colors[((this.colorPos / 5) % this.colors.length) | 0];
            },

            render() {
                let context = this.context;

                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI * 2,
                    false);
                context.closePath();

                if (this.isCollectible) {
                    context.fillStyle = this.color;
                    context.fill();
                } else {
                    context.strokeStyle = this.color;
                    context.lineWidth = 2;
                    context.stroke();
                }

            },

            setTriggerId(triggerId) {
                this.triggerId = triggerId;
            },

            trigger() {
                // console.log('🎁 Collected (' + this.x + ',' + this.y + ')');

                this.isCollectible = false;
                map.points += 100;

                if (this.triggerId && this.triggerListener.onTrigger(this, this.triggerId)) {
                    // Don't play sound when a listener was called successfully
                    // as doors are also playing sound effects.
                    return;
                }

                zzfx(1, .1, 1, .7, .12, 2.2, .2, 0, .25); // ZzFX 40871
            }
        });

        this.collectibles.push(sprite);

        return sprite;
    }

    onTrigger(event, triggerId) {
        // console.log('onTrigger: ' + triggerId);
        let listener = false;

        if (this._triggers[triggerId] && this._triggers[triggerId].length > 0) {
            listener = true;
            this._triggers[triggerId].forEach(trigger => trigger());
        }

        return listener;
    }

    addDoor(x0, y0, x1, y1, color, isClosed = true) {
        let sprite = Sprite({
            color: color,
            isOpen: !isClosed,
            _isOpenOld: false,

            lineSegments: [],
            polygon: new SAT.Polygon(new SAT.V(), [new SAT.V(x0, y0), new SAT.V(x1, y1)]),

            update() {
                if (this.isOpen !== this._isOpenOld) {
                    this._isOpenOld = this.isOpen;
                    let diff = 1000000;

                    if (this.isOpen) {
                        // Move door somewhere else.
                        // Ugly solution, but works for now.
                        this.polygon.pos.x += 1000000;
                        this.polygon.pos.y += 1000000;
                    } else {
                        this.polygon.pos.x -= 1000000;
                        this.polygon.pos.y -= 1000000;
                    }

                    this._sync();

                    zzfx(0.25, 0.1, 1586, 0.5, 0.26, 0.1, 2.4, 0, 0.3);
                }
            },

            /**
             * Synchronizes {SAT} with {AM.Vector2D} line segments.
             *
             * @private
             */
            _sync() {
                this.lineSegments.length = 0;
                let polygon = this.polygon;
                let points = polygon.calcPoints;

                for (let p = 0; p < points.length; p++) {
                    let p0 = points[p];
                    let p1 = points[(p + 1) % points.length];

                    this.lineSegments.push([
                        new AM.Vector2D().add(p0).add(polygon.pos),
                        new AM.Vector2D().add(p1).add(polygon.pos),
                    ]);
                }
            },

            render() {
                let context = this.context;
                context.fillStyle = this.color;
                context.lineWidth = 16;
                context.strokeStyle = this.isOpen ? 'white' : this.color;

                context.beginPath();
                context.moveTo(x0, y0);
                context.lineTo(x1, y1);
                context.stroke();

                context.beginPath();
                context.arc(x0, y0, 8, 0, 2 * Math.PI, false);
                context.fill();

                context.beginPath();
                context.arc(x1, y1, 8, 0, 2 * Math.PI, false);
                context.fill();

            }
        });

        // Synchronize line segments.
        sprite._sync();
        this.doors.push(sprite);

        return sprite;
    };
}

export {Map}
