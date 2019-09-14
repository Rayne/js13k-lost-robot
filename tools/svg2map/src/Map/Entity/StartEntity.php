<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Map\Entity;

class StartEntity implements MapEntityInterface
{
    /**
     * @var array
     */
    private $position;

    /**
     * @param NodeEntity $node
     */
    public function __construct(NodeEntity $node)
    {
        $this->position = [(float)$node->element['cx'], (float)$node->element['cy']];
    }

    /**
     * @return array
     */
    public function toMapEntity(): array
    {
        return [
            (int)$this->position[0],
            (int)$this->position[1],
        ];
    }
}
