<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Map\Entity;

use RuntimeException;

class CollectibleEntity implements MapEntityInterface
{
    /**
     * @var array
     */
    private $position;

    /**
     * @var string
     */
    private $color;

    /**
     * @var string
     */
    private $trigger;

    /**
     * @param NodeEntity $node
     */
    public function __construct(NodeEntity $node)
    {
        $this->position = [(float)$node->element['cx'], (float)$node->element['cy']];

        if (!isset($node->style['fill'])) {
            throw new RuntimeException('Circle has no `style[fill]`.');
        }

        $this->color = $node->style['fill'];
    }


    /**
     * @return array
     */
    public function toMapEntity(): array
    {
        return [
            (int)$this->position[0],
            (int)$this->position[1],
            $this->color,
        ];
    }
}
