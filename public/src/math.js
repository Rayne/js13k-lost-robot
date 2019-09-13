/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

let AM = {};

AM.deg2rad = function (angleDeg) {
    return angleDeg * 0.017453292519943295; // (angle / 180) * Math.PI
};

AM.rad2deg = function (angleRad) {
    return angleRad * 57.29577951308232; // angle / Math.PI * 180};
};

/**
 * Mutable 2D vector.
 */
AM.Vector2D = class {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;

        return this;
    };

    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;

        return this;
    };

    multiply(factor) {
        this.x *= factor;
        this.y *= factor;

        return this;
    };

    // divide(divisor) {
    //     this.x /= divisor;
    //     this.y /= divisor;
    //
    //     return this;
    // };

    /**
     * @param {AM.Vector2D} other
     * @returns {number} Distance between vectors.
     */
    distance(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    };

    // /**
    //  * @param {AM.Vector2D} other
    //  * @returns {number} Squared distance between vectors.
    //  * @deprecated Keep this method?
    //  */
    // distance2(other) {
    //     return (this.x - other.x) ** 2 + (this.y - other.y) ** 2;
    // }

    magnitude() {
        return Math.hypot(this.x, this.y);
    };

    // TODO Throw exception or do nothing when working with zero divisions?
    normalize() {
        return this.multiply(1 / this.magnitude());
    };

    // toArray() {
    //     return [this.x, this.y];
    // };
    //
    // toObject() {
    //     return {x: this.x, y: this.y};
    // };

    clone() {
        return new AM.Vector2D(this.x, this.y);
    };

    // invert() {
    //     this.x *= -1;
    //     this.y *= -1;
    //
    //     return this;
    // };
    //
    // abs() {
    //     this.x = Math.abs(this.x);
    //     this.y = Math.abs(this.y);
    //
    //     return this;
    // };

    // /**
    //  * TODO Single purpose {truncate}, {clampMin}, {clampMax} vs. multi-purpose {clamp}.
    //  *
    //  * @param min number
    //  * @param max number
    //  * @returns {AM.Vector2D}
    //  */
    // clamp(min, max) {
    //     let m = this.magnitude();
    //
    //     if (m < min) {
    //         this.normalize();
    //         this.multiply(min);
    //     } else if (m > max) {
    //         this.normalize();
    //         this.multiply(max);
    //     }
    //
    //     return this;
    // };
    //
    // truncate(max) {
    //     if (this.magnitude() > max) {
    //         return this.normalize().multiply(max);
    //     }
    //
    //     return this;
    // };

    setXY(x, y) {
        this.x = x;
        this.y = y;

        return this;
    };

    /**
     * @param {number} cx Vector gets rotated around origin `(cx, cy)`,
     * @param {number} cy Vector gets rotated around origin `(cx, cy)`,
     * @param {number} angle Angle in degree.
     * @returns {AM.Vector2D}
     *
     * @deprecated
     * @see {rotateDeg}
     * @see {rotateRad}
     */
    rotate(cx, cy, angle) {
        return this.rotateDeg(angle,cx,cy);
    };

    /**
     * @param {number} angleDeg Angle in degree.
     * @param {Object|Vector2D|number} vector_or_cx X position or {Object} with `x` and `y` properties.
     * @param {number} cy Ignored when {vector_or_cx} is an {Object}
     * @returns {AM.Vector2D} The modified object for chaining.
     */
    rotateDeg(angleDeg, vector_or_cx = 0, cy = 0) {
        return this.rotateRad((Math.PI / 180) * angleDeg, vector_or_cx, cy)
    };

    /**
     * @param {number} angleRad Angle in radian.
     * @param {Object|Vector2D|number} vector_or_cx X position or {Object} with `x` and `y` properties.
     * @param {number} cy Ignored when {vector_or_cx} is an {Object}
     * @returns {AM.Vector2D} The modified object for chaining.
     */
    rotateRad(angleRad, vector_or_cx = 0, cy = 0) {
        let cx = vector_or_cx;

        if (vector_or_cx instanceof Object) {
            cx = vector_or_cx.x;
            cy = vector_or_cx.y;
        }

        let x = this.x;
        let y = this.y;

        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        let nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
        let ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

        this.x = nx;
        this.y = ny;

        return this;
    }

    copyFrom(vector) {
        this.x = vector.x;
        this.y = vector.y;

        return this;
    };

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    // /**
    //  * @param {AM.Vector2D} a
    //  * @param {AM.Vector2D} b
    //  * @param progress Number in range [0,1].
    //  * @returns {AM.Vector2D}
    //  *
    //  * TODO Could the method also be named "tween"?
    //  */
    // interpolate(a, b, progress) {
    //     this.copyFrom(b).subtract(a).multiply(progress).add(a);
    //
    //     return this;
    // }

    // moveY(y) {
    //     this.y += y;
    //     return this;
    // }
    //
    // moveX(x) {
    //     this.x += x;
    //     return this;
    // }

    moveXY(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
};


/**
 * Provides static intersection checks between various shapes.
 */
AM.Intersection = class {
    // /**
    //  * @param p The point which is checked if it lies inside the provided rectangle.
    //  * @param r0 The first (x,y) coordinate of the rectangle.
    //  * @param r1 The second (x,y) coordinate of the rectangle.
    //  * @returns {boolean}
    //  */
    // static pointInRect(p, r0, r1) {
    //     let xMin = r0.x < r1.x ? r0.x : r1.x;
    //     let xMax = r0.x > r1.x ? r0.x : r1.x;
    //     let yMin = r0.y < r1.y ? r0.y : r1.y;
    //     let yMax = r0.y > r1.y ? r0.y : r1.y;
    //
    //     return xMin <= p.x && p.x <= xMax && yMin <= p.y && p.y <= yMax;
    // }

    // /**
    //  * @param p The point which is checked if it lies inside one of the axis segments provided by the rectangle.
    //  * @param r0 The first (x,y) coordinate of the rectangle.
    //  * @param r1 The second (x,y) coordinate of the rectangle.
    //  * @returns {boolean} True when the p is at least cornered in one axis.
    //  * @deprecated Unknown real world use case?
    //  */
    // static pointInRectOneAxis(p, r0, r1) {
    //     let xMin = r0.x < r1.x ? r0.x : r1.x;
    //     let xMax = r0.x > r1.x ? r0.x : r1.x;
    //     let yMin = r0.y < r1.y ? r0.y : r1.y;
    //     let yMax = r0.y > r1.y ? r0.y : r1.y;
    //
    //     return xMin <= p.x && p.x <= xMax || yMin <= p.y && p.y <= yMax;
    // }

    // /**
    //  *
    //  * @param {AM.Vector2D} l0 First point on the line.
    //  * @param {AM.Vector2D} l1 Second point on the line.
    //  * @param {AM.Vector2D} cc Center of the circle.
    //  * @param {number} cr Radius of the circle.
    //  * @param {null|Object} debug Optional debugging object. Will be updated when defined.
    //  * @returns {Vector2D[]}
    //  */
    // static lineCircle(l0, l1, cc, cr, debug = null) {
    //     // @see https://en.m.wikipedia.org/wiki/Intersection_(Euclidean_geometry)#A_line_and_a_circle
    //     // @see https://en.wikipedia.org/wiki/Circle#Equations
    //
    //     // Move circle to center to be able to use the simplified circle formula.
    //     // Parameters for the circle: x^2 + y^2 = r^2
    //     let r = cr;
    //
    //     // Move line into the local coordinate system of the circle.
    //     l0 = l0.clone().subtract(cc);
    //     l1 = l1.clone().subtract(cc);
    //
    //     // Parameters for implicit line equation ("Koordinatenform"): a * x + b * y = c
    //     let a = l0.y - l1.y;
    //     let b = l1.x - l0.x;
    //     let c = l1.x * l0.y - l0.x * l1.y;
    //
    //     // Auxiliary variables.
    //     let ac = a * c;
    //     let bc = b * c;
    //     let innerMonster = r ** 2 * (a ** 2 + b ** 2) - c ** 2;
    //     let monster = Math.sqrt(innerMonster);
    //     let divisor = a ** 2 + b ** 2;
    //
    //     if (divisor === 0) {
    //         if (debug) debug.error = 'ZERO_DIVISION';
    //         return [];
    //     }
    //
    //     if (innerMonster === 0) {
    //         if (debug) {
    //             debug.type = 'TANGENT';
    //             debug.expectedPoints = 1;
    //         }
    //     } else if (innerMonster >= 0) {
    //         if (debug) {
    //             debug.type = 'SECANT';
    //             debug.expectedPoints = 2;
    //         }
    //     } else {
    //         if (debug) {
    //             debug.type = 'NO_INTERSECTION';
    //             debug.expectedPoints = 0;
    //         }
    //
    //         return [];
    //     }
    //
    //     let x1 = (ac + b * monster) / divisor;
    //     let x2 = (ac - b * monster) / divisor;
    //
    //     let y1 = (bc - a * monster) / divisor;
    //     let y2 = (bc + a * monster) / divisor;
    //
    //     // Move points into old coordinate system.
    //     let first = new AM.Vector2D(x1, y1).add(cc);
    //     let second = new AM.Vector2D(x2, y2).add(cc);
    //
    //     if (debug) {
    //         debug.points = [first, second];
    //     }
    //
    //     return [first, second];
    // }

    /**
     * Calculates the intersection point between two lines.
     *
     * @param {AM.Vector2D} p0 First point of the first line.
     * @param {AM.Vector2D} p1 Second point of the first line.
     * @param {AM.Vector2D} q0 First point of the second line.
     * @param {AM.Vector2D} q1 Second point of the second line.
     * @param {null|Object} debug Optional debugging object. Will be updated when defined.
     * @returns {null|AM.Vector2D} NULL when there lines are parallel. Otherwise the intersection point.
     */
    static lineLine(p0, p1, q0, q1, debug = null) {
        // Koordinatenform ax + by = c

        // https://de.wikipedia.org/wiki/Koordinatenform#Aus_der_Zweipunkteform
        // Parameters for implicit line equation ("Koordinatenform"): a1 * x + b1 * y = c1
        let a1 = p0.y - p1.y;
        let b1 = p1.x - p0.x;
        let c1 = p1.x * p0.y - p0.x * p1.y;

        // Parameters for implicit line equation ("Koordinatenform"): a2 * x + b2 * y = c2
        let a2 = q0.y - q1.y;
        let b2 = q1.x - q0.x;
        let c2 = q1.x * q0.y - q0.x * q1.y;

        let divisor = a1 * b2 - a2 * b1;

        if (divisor === 0) {
            if (debug) {
                debug.type = 'PARALLEL';
                debug.position = [NaN, NaN];
            }

            return null;
        }

        let x = (c1 * b2 - c2 * b1) / divisor;
        let y = (a1 * c2 - a2 * c1) / divisor;

        if (debug) {
            debug.type = 'INTERSECTION';
            debug.position = [x, y];
        }

        return new AM.Vector2D(x, y);
    }

    /**
     * @param {AM.Vector2D} p The point which is checked if it lies inside the provided circle.
     * @param {AM.Vector2D} c The center of the circle.
     * @param {number} r The radius of the circle.
     * @returns {boolean}
     */
    static pointInCircle(p, c, r) {
        return (p.x - c.x) ** 2 + (p.y - c.y) ** 2 <= r ** 2;
    }

    /**
     * @param p0
     * @param p1
     * @param q0
     * @param q1
     * @param debug
     * @returns {null|AM.Vector2D}
     */
    static segmentSegment(p0, p1, q0, q1, debug = null) {
        let p = AM.Intersection.lineLine(p0, p1, q0, q1, debug);

        if (p === null) {
            return null;
        }

        let cp = p0.clone().moveXY((p1.x - p0.x) / 2, (p1.y - p0.y) / 2);
        let rp = Math.sqrt(((p1.x - p0.x) / 2) ** 2 + ((p1.y - p0.y) / 2) ** 2);

        let cq = q0.clone().moveXY((q1.x - q0.x) / 2, (q1.y - q0.y) / 2);
        let rq = Math.sqrt(((q1.x - q0.x) / 2) ** 2 + ((q1.y - q0.y) / 2) ** 2);

        // Point p is located on both lines.
        // Is it also located inside both line segments?
        if (AM.Intersection.pointInCircle(p, cp, rp) && AM.Intersection.pointInCircle(p, cq, rq)) {
            return p;
        }

        if (debug !== null) {
            debug.type = 'OUTSIDE';
        }

        return null;
    }

    // /**
    //  * @param {AM.Vector2D} l0 First point on the line segment.
    //  * @param {AM.Vector2D} l1 Second point on the line segment.
    //  * @param {AM.Vector2D} cc Center of the circle.
    //  * @param {number} cr Radius of the circle.
    //  * @param {null|Object} debug Optional debugging object. Will be updated when defined.
    //  * @returns {Vector2D[]}
    //  */
    // static segmentCircle(l0, l1, cc, cr, debug = null) {
    //     let inCircle0 = AM.Intersection.pointInCircle(l0, cc, cr);
    //     let inCircle1 = AM.Intersection.pointInCircle(l1, cc, cr);
    //
    //     // No further calculation needed as both points are in the circle.
    //     if (inCircle0 && inCircle1) {
    //         return [l0.clone(), l1.clone()];
    //     }
    //
    //     let lineLineResult = AM.Intersection.lineCircle(l0, l1, cc, cr, debug);
    //
    //     // Only one point in the circle.
    //     // Use the one point inside the circle
    //     // and add the points nearest to the point outside of the circle.
    //     if (AM.Intersection.pointInCircle(l0, cc, cr)) {
    //         return [
    //             l0.clone(),
    //
    //             // Add point nearest to point outside of the circle.
    //             lineLineResult[
    //                 l1.distance(lineLineResult[0]) < l1.distance(lineLineResult[1])
    //                     ? 0
    //                     : 1
    //                 ]
    //         ];
    //     }
    //
    //     // Only one point in the circle.
    //     // Use the one point inside the circle
    //     // and add the points nearest to the point outside of the circle.
    //     if (AM.Intersection.pointInCircle(l1, cc, cr)) {
    //         return [
    //             l1.clone(),
    //
    //             // Add point nearest to point outside of the circle.
    //             lineLineResult[
    //                 l0.distance(lineLineResult[0]) < l0.distance(lineLineResult[1])
    //                     ? 0
    //                     : 1
    //                 ]
    //         ];
    //     }
    //
    //     // No point in the circle.
    //     // Check if at least one point is on the line segment.
    //     if (lineLineResult.length > 0) {
    //         // Create circle with center in the center of the line segment
    //         // and radius spanning to both line segment endings.
    //         let circle = l0.clone().moveXY((l1.x - l0.x) / 2, (l1.y - l0.y) / 2);
    //         let radius = Math.sqrt(((l1.x - l0.x) / 2) ** 2 + ((l1.y - l0.y) / 2) ** 2);
    //
    //         let segmentCircleResult = [];
    //
    //         // Point p is located on both lines.
    //         // Is it also located inside both line segments?
    //         if (AM.Intersection.pointInCircle(lineLineResult[0], circle, radius)) {
    //             segmentCircleResult.push(lineLineResult[0]);
    //         }
    //
    //         if (lineLineResult.length > 1 && AM.Intersection.pointInCircle(lineLineResult[1], circle, radius)) {
    //             segmentCircleResult.push(lineLineResult[1]);
    //         }
    //
    //         return segmentCircleResult;
    //     }
    //
    //     return lineLineResult;
    // }
};

export {AM}