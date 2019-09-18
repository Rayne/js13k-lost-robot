/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

import {Sprite, keyPressed as kontra_keyPressed} from '../../node_modules/kontra/kontra.mjs';
import {AM} from './math.js';
import {DistanceSensor} from "./sensors.js";

let createRobot = function () {
    let robot = Sprite({
        _cameraKeyDown: false,

        disabled: false,
        sensors: [],
        color: '#feffd9',
        isTurbo: false,
        isMoving: false,
        trails: [],
        defaultColor: '#feffd9',
        polygon: new SAT.Polygon(new SAT.Vector(100, 100), [
            new SAT.Vector(-40, -17.5),
            new SAT.Vector(-40, 17.5),
            new SAT.Vector(0, 20),
            new SAT.Vector(40, 17.5),
            new SAT.Vector(40, -17.5),
            new SAT.Vector(0, -20),
        ]),
        update: function () {
            if (this.disabled) {
                return;
            }

            this.color = this.defaultColor;

            // Toggle camera mode.
            {
                let app = document.APP;
                let cameraKeyDown = kontra_keyPressed('c');

                if (cameraKeyDown && !this._cameraKeyDown) {
                    app.relative_camera_enabled = !app.relative_camera_enabled;
                }

                this._cameraKeyDown = cameraKeyDown;
            }

            // Back to level screen.
            // Doesn't really belong to this class,
            // but we are now handling all keys here due to a lack of time for a proper refactoring.
            {
                if (kontra_keyPressed('esc')) {
                    document.APP.showLevelSelect();
                    return;
                }
            }

            {
                // Negate angle to convert between coordinate systems.
                let direction = new AM.Vector2D(1, 0).rotateRad(-this.polygon.angle);

                // TODO Map XBOX analog sticks to wheels (one wheel per stick).
                let turbo = kontra_keyPressed('t') || kontra_keyPressed('space');
                let leftPlus = kontra_keyPressed('w');
                let leftMinus = kontra_keyPressed('s');
                let rightPlus = kontra_keyPressed('i');
                let rightMinus = kontra_keyPressed('k');

                this.isTurbo = turbo;

                let leftAcceleration = (leftPlus !== leftMinus) ? (leftPlus ? 1 : -1) : 0;
                let rightAcceleration = (rightPlus !== rightMinus) ? (rightPlus ? 1 : -1) : 0;

                // Easy mode.
                {
                    let up = kontra_keyPressed('up');
                    let down = kontra_keyPressed('down');
                    let left = kontra_keyPressed('left');
                    let right = kontra_keyPressed('right');

                    if (up && !down) {
                        if (left && !right) {
                            leftAcceleration = 0;
                            rightAcceleration = 1;
                        } else if (!left && right) {
                            leftAcceleration = 1;
                            rightAcceleration = 0;
                        } else {
                            leftAcceleration = 1;
                            rightAcceleration = 1;
                        }
                    } else if (!up && down) {
                        if (left && !right) {
                            leftAcceleration = 0;
                            rightAcceleration = -1;
                        } else if (!left && right) {
                            leftAcceleration = -1;
                            rightAcceleration = 0;
                        } else {
                            leftAcceleration = -1;
                            rightAcceleration = -1;
                        }
                    } else if (kontra_keyPressed('left')) {
                        leftAcceleration = -1;
                        rightAcceleration = 1;
                    } else if (kontra_keyPressed('right')) {
                        leftAcceleration = 1;
                        rightAcceleration = -1;
                    }
                }

                // TODO Acceleration and real kinematics instead of this nonsense.

                let multOneDirection = turbo ? 4.5 : 3;
                let multRotDirection = turbo ? 3 : 2;
                let rotationPerFrame = turbo ? 2 : 1;
                let stopRotationPerFrame = turbo ? 3 : 2;

                let isMoving = false;

                // Move forwards.
                if (leftAcceleration > 0 && rightAcceleration > 0) {
                    isMoving = true;
                    this.polygon.pos.add(direction.multiply(multOneDirection));
                }

                // Move backward.
                else if (leftAcceleration < 0 && rightAcceleration < 0) {
                    isMoving = true;
                    this.polygon.pos.sub(direction.multiply(multOneDirection));
                }

                // Rotate right.
                else if (leftAcceleration > 0 && rightAcceleration < 0) {
                    isMoving = true;
                    this.polygon.setAngle(this.polygon.angle + AM.deg2rad(stopRotationPerFrame));
                }

                // Rotate left.
                else if (leftAcceleration < 0 && rightAcceleration > 0) {
                    isMoving = true;
                    this.polygon.setAngle(this.polygon.angle + AM.deg2rad(-stopRotationPerFrame));
                }

                // Move forward + right.
                else if (leftAcceleration > 0 && rightAcceleration === 0) {
                    isMoving = true;
                    this.polygon.setAngle(this.polygon.angle + AM.deg2rad(rotationPerFrame));
                    this.polygon.pos.add(direction.multiply(multRotDirection));
                }

                // Move forward + left.
                else if (leftAcceleration === 0 && rightAcceleration > 0) {
                    isMoving = true;
                    this.polygon.setAngle(this.polygon.angle + AM.deg2rad(-rotationPerFrame));
                    this.polygon.pos.add(direction.multiply(multRotDirection));
                }

                // Move backward + right.
                else if (leftAcceleration < 0 && rightAcceleration === 0) {
                    isMoving = true;
                    this.polygon.setAngle(this.polygon.angle + AM.deg2rad(-rotationPerFrame));
                    this.polygon.pos.sub(direction.multiply(multRotDirection));
                }

                // Move backward + left.
                else if (leftAcceleration === 0 && rightAcceleration < 0) {
                    this.polygon.setAngle(this.polygon.angle + AM.deg2rad(rotationPerFrame));
                    this.polygon.pos.sub(direction.multiply(multRotDirection));
                }

                this.isMoving = isMoving;
                this.leftAcceleration = leftAcceleration;
                this.rightAcceleration = rightAcceleration;
            }
        },
        /**
         * We are manually adding the turbo effect as collision handling occurs in `app.js`.
         */
        addMovingEffects() {
            // Add trails.
            if (this.isTurbo) {
                let randomX = 30 - Math.random() * 15;
                let randomY = 30 - Math.random() * 60;
                this.trails.push({
                    begin: new AM.Vector2D(randomX, randomY).rotateRad(-this.polygon.angle).add(this.polygon.pos),
                    end: new AM.Vector2D(
                        randomX - 40 - Math.random() * 10,
                        randomY
                    ).rotateRad(-this.polygon.angle).add(this.polygon.pos),
                    ttl: 0.33,
                });
            }
        },
        renderWheel(wheelId, acceleration) {
            let black = 'black';
            let context = this.context;

            context.strokeStyle = black;
            context.fillStyle = black;

            let globalCenter = new AM.Vector2D(0, wheelId === 'left' ? -20 : 20);
            let localBottomLeft = new AM.Vector2D(-20, -5);
            let localBopLeft = new AM.Vector2D(-20, 5);
            let localBopRight = new AM.Vector2D(20, 5);
            let localBottomRight = new AM.Vector2D(20, -5);

            let arrowDirection = acceleration > 0 ? 1 : -1;

            let localArrowHatCenter = new AM.Vector2D(arrowDirection * 35, 0);
            let localArrowHatLeft = new AM.Vector2D(arrowDirection * 25, -10);
            let localArrowHatRight = new AM.Vector2D(arrowDirection * 25, 10);

            // Negate angle to convert between coordinate systems.
            let angleRad = -this.polygon.angle;

            globalCenter.rotateRad(angleRad).add(this.polygon.pos);

            // Make local coordinates global.
            [
                localBottomLeft,
                localBopLeft,
                localBopRight,
                localBottomRight,
                localArrowHatCenter,
                localArrowHatLeft,
                localArrowHatRight
            ].forEach(vector => vector.rotateRad(angleRad).add(globalCenter));

            context.beginPath();
            context.moveTo(localBottomLeft.x, localBottomLeft.y);
            context.lineTo(localBopLeft.x, localBopLeft.y);
            context.lineTo(localBopRight.x, localBopRight.y);
            context.lineTo(localBottomRight.x, localBottomRight.y);
            context.closePath();
            context.fill();

            if (acceleration !== 0) {

                context.beginPath();
                context.moveTo(globalCenter.x, globalCenter.y);
                context.lineTo(localArrowHatCenter.x, localArrowHatCenter.y);
                context.closePath();
                context.lineWidth = 4;
                context.stroke();

                context.beginPath();
                context.moveTo(localArrowHatLeft.x, localArrowHatLeft.y);
                context.lineTo(localArrowHatCenter.x, localArrowHatCenter.y);
                context.lineTo(localArrowHatRight.x, localArrowHatRight.y);
                context.closePath();
                context.fill();
            }
        },
        render() {
            let context = this.context;
            let points = this.polygon.calcPoints;

            context.beginPath();
            context.moveTo(this.polygon.pos.x + points[0].x, this.polygon.pos.y + points[0].y);

            for (let i = 1; i < points.length; ++i)
                context.lineTo(this.polygon.pos.x + points[i].x, this.polygon.pos.y + points[i].y);

            context.closePath();
            context.fillStyle = this.color;
            context.fill();

            if (this.trails.length) {
                this.trails = this.trails.filter(trail => {
                    if (!this.isMoving) {
                        return false;
                    }

                    context.lineWidth = 1;
                    context.strokeStyle = '#e27d7e';
                    context.moveTo(trail.begin.x, trail.begin.y);
                    context.lineTo(trail.end.x, trail.end.y);
                    context.stroke();

                    trail.ttl -= 1 / 60;
                    return trail.ttl > 0;
                });
            }

            // Render color shell.
            {
                context.strokeStyle = '#7570cc';
                context.lineWidth = 1;

                [
                    [points[0], points[1]],
                    [points[3], points[4]],
                ].forEach(points => {
                    context.beginPath();
                    context.moveTo(this.polygon.pos.x + points[0].x, this.polygon.pos.y + points[0].y);
                    context.lineTo(this.polygon.pos.x + points[1].x, this.polygon.pos.y + points[1].y);
                    context.stroke();
                });

                context.lineWidth = 4;

                let angleRad = -this.polygon.angle;
                let spoilerLeft = new AM.Vector2D(-30, 10).rotateRad(angleRad);
                let spoilerRight = new AM.Vector2D(-30, -10).rotateRad(angleRad);

                [
                    [points[1], points[2], points[3]],
                    [points[4], points[5], points[0]],

                    // It's nonsense to paint the spoiler two times to the left point,
                    // but it saves refactoring for now.
                    [spoilerLeft, spoilerRight, spoilerLeft],
                ].forEach(points => {
                    context.beginPath();
                    context.moveTo(this.polygon.pos.x + points[0].x, this.polygon.pos.y + points[0].y);
                    context.lineTo(this.polygon.pos.x + points[1].x, this.polygon.pos.y + points[1].y);
                    context.lineTo(this.polygon.pos.x + points[2].x, this.polygon.pos.y + points[2].y);
                    context.stroke();
                });
            }

            this.renderWheel('left', this.leftAcceleration);
            this.renderWheel('right', this.rightAcceleration);
        },
        onCollision() {
            this.color = 'red';
        },
    });

    // Attach sensors to robot.
    {
        for (let i = -90; i <= 90; i += 10) {
            robot.sensors.push(
                new DistanceSensor(robot.polygon, new AM.Vector2D(), AM.deg2rad(i), 512)
            );
        }

        [-22.5, 0, 22.5].forEach(diff => {
            robot.sensors.push(new DistanceSensor(robot.polygon, new AM.Vector2D(0, 0), AM.deg2rad(180 + diff), 160));
        });
    }

    return robot;
};

export {createRobot}
