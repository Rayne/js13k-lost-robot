<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Map;

use App\Map\Entity\CollectibleEntity;
use App\Map\Entity\DoorEntity;
use App\Map\Entity\GoalEntity;
use App\Map\Entity\NodeEntity;
use App\Map\Entity\ObstacleEntity;
use App\Map\Entity\StartEntity;
use RuntimeException;
use SimpleXMLElement;

class Map
{
    /**
     * @var DoorEntity[]
     */
    private $doors = [];

    /**
     * @var ObstacleEntity[]
     */
    private $obstacles = [];

    /**
     * @var CollectibleEntity[]
     */
    private $collectibles;

    /**
     * @var StartEntity
     */
    private $start;

    /**
     * @var GoalEntity
     */
    private $goal;

    /**
     * @param string $file
     */
    public function loadFromSvgFile(string $file)
    {
        $xml = simplexml_load_file($file);
        $xml->registerXPathNamespace('svg', 'http://www.w3.org/2000/svg');
        $xml->registerXPathNamespace('xlink', 'http://www.w3.org/1999/xlink');

        $this->interpretPaths($xml);
        $this->interpretCircles($xml);

        if (!$this->start) {
            throw new RuntimeException('The SVG file has no circle with description `type:start`.');
        }

        if (!$this->goal) {
            throw new RuntimeException('The SVG file has no circle with description `type:goal`.');
        }
    }

    /**
     * Creates doors and static obstacles.
     * @param SimpleXMLElement $xml
     */
    private function interpretPaths(SimpleXMLElement $xml)
    {
        foreach ($xml->xpath('//svg:path') as $path) {
            $node = new NodeEntity($path);

            if (isset($path->transform)) {
                throw new RuntimeException("Detected a path with transform attribute. Transformation aren't supported. Path ID: " . $path['id']);
            }

            if (!isset($node->description['type'])) {
                echo "Skip path without type\n";
                continue;
            }

            $type = $node->description['type'];
            echo "Path with type: $type\n";

            // Create obstacle.
            if ($type === 'obstacle') {
                $this->obstacles[] = new ObstacleEntity($node);
            }

            // Create door.
            else if ($type === 'door') {
                $this->doors[] = new DoorEntity($node);
            }

            else {
                throw new RuntimeException(sprintf('Unknown type: %s', $type));
            }
        }
    }

    /**
     * @param SimpleXMLElement $xml
     */
    private function interpretCircles(SimpleXMLElement $xml)
    {
        // Inkscape sometimes converts circles to ellipses when scaling.
        // Therefore both are supported.
        foreach ($xml->xpath('//svg:circle|//svg:ellipse') as $circle) {
            $node = new NodeEntity($circle);

            if (!isset($node->description['type'])) {
                echo "Skip circle without type\n";
                continue;
            }

            $type = $node->description['type'];
            echo "Circle with type: $type\n";

            if ($type === 'start') {
                $this->start = new StartEntity($node);
            }

            else if ($type === 'goal') {
                $this->goal = new GoalEntity($node);
            }

            else if ($type === 'collectible' || $type === 'trigger') {
                $this->collectibles[] = new CollectibleEntity($node);
            }

            else {
                throw new RuntimeException(sprintf('Unknown type: %s', $type));
            }
        }
    }

    public function saveToMapFile(string $file)
    {
        $data = [
            'start' => $this->start->toMapEntity(),
            'goal' => $this->goal->toMapEntity(),
        ];

        foreach ($this->doors as $door) {
            $data['doors'][] = $door->toMapEntity();
        }

        foreach ($this->obstacles as $obstacle) {
            foreach ($obstacle->toMapEntity() as $polygon) {
                $data['obstacles'][] = $polygon;
            }
        }

        foreach ($this->collectibles as $collectible) {
            $data['collectibles'][] = $collectible->toMapEntity();
        }

        file_put_contents($file, json_encode($data));
    }
}
