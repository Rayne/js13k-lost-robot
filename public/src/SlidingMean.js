/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

/**
 * A simple Sliding Mean implementation.
 */
export class SlidingMean {
    /**
     * @param {number} bufferSize
     * @param {number} defaultValue
     */
    constructor(bufferSize = 30, defaultValue = 0) {
        this.buffer = [];
        this.bufferPointer = 0;
        this.bufferSize = bufferSize;

        for (let i = 0; i < bufferSize; ++i) {
            this.addValue(defaultValue);
        }
    }

    addValue(value) {
        this.bufferPointer = (this.bufferPointer + 1) % this.bufferSize;
        this.buffer[this.bufferPointer] = value;
        return this;
    }

    getMean() {
        let mean = 0;

        for (let i = 0; i < this.bufferSize; ++i) {
            mean += this.buffer[i];
        }

        return mean / this.bufferSize;
    }
}
