/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

/**
 * @param {number|string} input
 * @param {number} width
 * @param {number|string } symbol Should be one character.
 * @returns {string}
 */
export function pad_left(input, width, symbol) {
    let text = String(input);
    return String(symbol).repeat(Math.max(0, width - text.length)) + text
}

/**
 * @param {number} milliseconds
 * @returns {string}
 */
export function format_time(milliseconds) {
    let m = pad_left((milliseconds / 1000 / 60) | 0, 2, 0);
    let s = pad_left((milliseconds / 1000 % 60) | 0, 2, 0);
    let ms = pad_left((milliseconds % 1000) | 0, 3, 0);
    return m + ':' + s + ':' + ms;
}

/**
 * @param {number} points
 * @returns {string}
 */
export function format_points(points) {
    return pad_left(points, 9, ' ');
}
