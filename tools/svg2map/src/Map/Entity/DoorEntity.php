<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Map\Entity;

class DoorEntity extends ObstacleEntity
{
    /**
     * @var string
     */
    private $color;

    /**
     * @var bool
     */
    private $isClosed;

    /**
     * @param NodeEntity $node
     */
    public function __construct(NodeEntity $node)
    {
        parent::__construct($node);

        $this->color = $node->style['stroke'];
        $this->isClosed = ($node->description['state'] ?? 'closed') !== 'open';
    }

    /**
     * @return array
     */
    public function toMapEntity(): array
    {
        return [
            // We are only using the first polygon.
            // We assume that a door has only two vertices,
            // therefore only one polygon must exist.
            //
            // [POLYGON_ID][VERTEX_ID][COMPONENT_X_OR_Y]
            (int)$this->polygons[0][0][0],
            (int)$this->polygons[0][0][1],
            (int)$this->polygons[0][1][0],
            (int)$this->polygons[0][1][1],
            $this->color,
            $this->isClosed,
        ];
    }
}
