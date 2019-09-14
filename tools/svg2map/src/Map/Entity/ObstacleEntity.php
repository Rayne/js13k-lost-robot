<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Map\Entity;

use App\Svg\Path;
use SimpleXMLElement;

class ObstacleEntity implements MapEntityInterface
{
    /**
     * @var array[]
     */
    protected $polygons = [];

    /**
     * @param NodeEntity $node
     */
    public function __construct(NodeEntity $node)
    {
        $this->buildPolygon($node->element);
    }

    /**
     * @param SimpleXMLElement $element
     */
    private function buildPolygon(SimpleXMLElement $element)
    {
        $this->polygons = (new Path())->getGlobalPolygons($element['d']);
    }

    /**
     * @return array
     */
    public function toMapEntity(): array
    {
        $xyLists = [];

        foreach ($this->polygons as $polygon) {
            $xyList = [];

            foreach ($polygon as $point) {
                $xyList[] = (int)$point[0];
                $xyList[] = (int)$point[1];
            }

            $xyLists[] = $xyList;
        }

        return $xyLists;
    }
}
