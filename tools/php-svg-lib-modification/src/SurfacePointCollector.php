<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Svg;

use RuntimeException;

/**
 * Collects global coordinates while painting on an imaginary surface.
 * Implements a subset of the interface `Svg\Surface\SurfaceInterface` of the `php-svg-lib` library.
 */
class SurfacePointCollector
{
    /**
     * @var array[]
     */
    private $polygons = [];

    /**
     * @var array
     */
    private $currentPolygon = [];

    /**
     * @param float|int $x
     * @param float|int $y
     */
    public function lineTo($x, $y)
    {
        $this->currentPolygon[] = [$x, $y];
    }

    /**
     * Not supported.
     *
     * @param float|int $x
     * @param float|int $y
     */
    public function moveTo($x, $y)
    {
        $polygon = [];
        $this->currentPolygon = &$polygon;
        $this->polygons[] = &$polygon;

        $this->lineTo($x, $y);
    }

    /**
     * Not supported.
     *
     * @param $cp1x
     * @param $cp1y
     * @param $cp2x
     * @param $cp2y
     * @param $x
     * @param $y
     */
    public function bezierCurveTo($cp1x, $cp1y, $cp2x, $cp2y, $x, $y)
    {
        throw new RuntimeException('Unsupported operation: bezierCurveTo');
    }

    /**
     * Not supported.
     *
     * @param $cpx
     * @param $cpy
     * @param $x
     * @param $y
     */
    public function quadraticCurveTo($cpx, $cpy, $x, $y)
    {
        throw new RuntimeException('Unsupported operation: quadraticCurveTo');
    }

    /**
     * Copies the first element to the end.
     * This is only "valid" because this class doesn't support `moveTo()`.
     */
    public function closePath()
    {
        $this->currentPolygon[] = $this->currentPolygon[0];
    }

    /**
     * @return array[]
     */
    public function getGlobalPolygons(): array
    {
        return $this->polygons;
    }
}
