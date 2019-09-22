/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

import {Sprite, Quadtree} from "../../node_modules/kontra/kontra.mjs";
import {AM} from "./math.js";
import {Log} from "./Log.js";

class ObstacleManager {
    constructor() {
        /**
         * Holds a {Sprite} list. Every {Sprite} has a {SAT.Polygon} at `Sprite.polygon`.
         *
         * @type {Sprite[]}
         * @readonly
         * @deprecated
         */
        this.obstacles = [];

        /**
         * Contains only line segments,
         * including the line segments of complex polygons
         * added by {addBox} and {addPolygon}.
         *
         * @readonly
         * @type {Array}
         */
        this.lineSegments = [];

        this.quadtree = new Quadtree();
    }

    /**
     * Synchronizes the quadtree.
     */
    updateQuadtree() {
        let bounds = {
            xMin: Infinity,
            xMax: -Infinity,
            yMin: Infinity,
            yMax: -Infinity,
        };

        let obstacles = [];

        /**
         * Registers obstacles and updates the bounds of the Quadtree
         * to make it big enough for all obstacles.
         *
         * @param {Object[]} segment
         */
        let segmentConverter = segment => {
            let a = segment[0];
            let b = segment[1];

            let xMin = Math.min(a.x, b.x);
            let xMax = Math.max(a.x, b.x);
            let yMin = Math.min(a.y, b.y);
            let yMax = Math.max(a.y, b.y);

            obstacles.push({
                x: xMin,
                y: yMin,
                width: xMax - xMin,
                height: yMax - yMin,
                segment: segment,
            });

            // Update the area of the Quadtree.
            bounds.xMin = Math.min(bounds.xMin, xMin);
            bounds.xMax = Math.max(bounds.xMax, xMax);
            bounds.yMin = Math.min(bounds.yMin, yMin);
            bounds.yMax = Math.max(bounds.yMax, yMax);
       };

        this.lineSegments.forEach(segmentConverter);

        this.quadtree.clear();
        this.quadtree.maxDepth = 3;
        this.quadtree.maxObjects = 5;
        this.quadtree.bounds = {
            x: bounds.xMin,
            y: bounds.yMin,

            // @see https://github.com/straker/kontra/issues/111
            width: bounds.xMax - bounds.xMin + 2,
            height: bounds.yMax - bounds.yMin + 2,
        };

        this.quadtree.add(obstacles);
    }

    /**
     * @param {SAT.Polygon} polygon
     * @private
     */
    _addInternalPolygon(polygon) {
        this._addInternalSegments(polygon);

        this.obstacles.push(Sprite({
            polygon: polygon,
            render() {
                let context = this.context;
                let points = this.polygon.calcPoints;

                context.beginPath();
                context.moveTo(points[0].x, points[0].y);

                for (let i = 1; i < points.length; ++i)
                    context.lineTo(points[i].x, points[i].y);

                context.closePath();

                context.lineWidth = 1;
                context.strokeStyle = '#c0c0c0';
                context.stroke();
            },
        }));
    }

    /**
     * @param {SAT.Polygon} polygon
     * @private
     */
    _addInternalSegments(polygon) {
        let points = polygon.calcPoints;

        for (let p = 0; p < points.length; p++) {
            let p0 = points[p];
            let p1 = points[(p + 1) % points.length];

            this.lineSegments.push([
                new AM.Vector2D().add(p0),
                new AM.Vector2D().add(p1),
            ]);
        }
    }

    /**
     * @param x
     * @param y
     * @param width
     * @param height
     * @param {number} angle The angle to rotate (in radians)
     */
    addBox(x, y, width, height, angle) {
        this._addInternalPolygon(new SAT.Box(
            // We are using `translate()` instead of specifying
            // the position via the positioning vector.
            // See `KNOWN_BUGS.md` for `(0,0)`.
            //       ↓↓
            new SAT.V(), width, height)
            .toPolygon()
            .setAngle(angle)
            .translate(x, y)
        );
    }

    /**
     * Adds an open polygonal chain as individual line segments.
     * Therefore polygonal chains don't have to be closed or convex.
     * This allows to use them with the {SAT} library
     * but also prevents checking if a point or polygon lies inside a polygon.
     *
     * @param {number[]} xyList List of alternating x and y coordinates.
     */
    addPolygon(xyList) {
        for (let i = 3; i < xyList.length; i += 2) {
            this._addInternalPolygon(new SAT.Polygon(new SAT.V(), [
                new SAT.V(xyList[i - 3], xyList[i - 2]),
                new SAT.V(xyList[i - 1], xyList[i])
            ]))
        }
    }


    /**
     * Renders the ground truth.
     */
    render() {
        this.obstacles.forEach(obstacle => obstacle.render());
    }
}

export {ObstacleManager}
