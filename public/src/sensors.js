/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

import {Sprite} from "../../node_modules/kontra/kontra.mjs";
import {AM} from "./math.js";

/**
 * A distance sensor that can be mounted on another entity, e.g. a vehicle.
 * Sensor values are updated when calling {sense}.
 */
export class DistanceSensor {
    /**
     * @param parent
     * @param {AM.Vector2D|Sprite|Vector} position
     * @param {number} angleRadian
     * @param {number} maxDistance
     */
    constructor(parent, position, angleRadian, maxDistance) {
        this._begin = new AM.Vector2D();
        this._end = new AM.Vector2D();

        this.pos = position;
        this.angle = angleRadian;
        this.maxDistance = maxDistance;

        /**
         * The distance to the sensed obstacle.
         *
         * @type {number}
         */
        this.distance = Infinity;

        /**
         * The intersection point where an obstacle was sensed.
         *
         * @type {null|AM.Vector2D}
         */
        this.intersection = null;

        this.setParent(parent);
    }

    /**
     * @param {null|Object|Sprite} parent
     */
    setParent(parent) {
        this.parent = parent;
    }

    update() {
        let parent = this.parent;
        let parentPos = parent ? parent.pos : new AM.Vector2D();
        let parentAngle = parent ? -parent.angle : 0;

        // Calculate global sensor position.
        this._begin
            .copyFrom(this.pos)
            .rotateRad(parentAngle)
            .add(parentPos);

        // Calculate global sensor limit.
        this._end
            .setXY(this.maxDistance, 0)
            .rotateRad(this.angle + parentAngle)
            .add(this._begin);
    }

    /**
     * @param {[[]]} lineSegmentList List of tuples of line segments with global x and y positions.
     * @returns {null|AM.Vector2D}
     */
    sense(lineSegmentList) {
        let minDistance = Infinity;
        let minPoint = null;

        let begin = this._begin;
        let end = this._end;

        /**
         * Locate nearest obstacle.
         */
        for (let segmentId = 0; segmentId < lineSegmentList.length; ++segmentId) {
            let segment = lineSegmentList[segmentId];

            let intersection = AM.Intersection.segmentSegment(begin, end, segment[0], segment[1]);

            if (intersection) {
                let distance = begin.distance(intersection);

                if (distance < minDistance) {
                    minDistance = distance;
                    minPoint = intersection;
                }
            }
        }

        this.distance = minDistance;
        this.intersection = minPoint;

        return minPoint;
    }

    render(context) {
        if (!this.intersection) {
            return;
        }

        let segmentBegin = this._begin;
        let segmentEnd = this.intersection;

        context.beginPath();
        context.moveTo(segmentBegin.x, segmentBegin.y);
        context.lineTo(segmentEnd.x, segmentEnd.y);
        context.closePath();

        context.lineWidth = 2;
        context.strokeStyle = '#bbff30';
        context.stroke();

        context.beginPath();
        context.arc(segmentEnd.x, segmentEnd.y, 4, 0, 2 * Math.PI, false);
        context.fillStyle = 'red';
        context.fill();
    }
}

// export class RotatingDistanceSensor extends DistanceSensor {
//     /**
//      * @param parent
//      * @param {AM.Vector2D|Sprite|Vector} position
//      * @param {number} angleRadian
//      * @param {number} angleRangeRadian
//      * @param {number} angleStepRadian
//      * @param {number} maxDistance
//      */
//     constructor(parent, position, angleRadian, angleRangeRadian, angleStepRadian, maxDistance) {
//         super(parent, position, angleRadian, maxDistance);
//
//         this.angleMin = angleRadian - angleRangeRadian / 2;
//         this.angleMax = angleRadian + angleRangeRadian / 2;
//         this.angleDirection = 1;
//         this.angleStep = angleStepRadian;
//     }
//
//     update() {
//         this.angle += this.angleDirection * this.angleStep;
//
//         if (this.angle < this.angleMin) {
//             this.angle = this.angleMin;
//             this.angleDirection *= -1;
//         } else if (this.angle > this.angleMax) {
//             this.angle = this.angleMax;
//             this.angleDirection *= -1;
//         }
//
//         super.update();
//     }
// }
