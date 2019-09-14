<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Map\Entity;

use App\Parser\DescriptionParser;
use App\Parser\StyleParser;
use SimpleXMLElement;

/**
 * Helper class.
 */
class NodeEntity
{
    /**
     * @var SimpleXMLElement
     */
    public $element;

    /**
     * @var string[]
     */
    public $description;

    /**
     * @var string[]
     */
    public $style;

    /**
     * @param SimpleXMLElement $element
     */
    public function __construct(SimpleXMLElement $element)
    {
        $this->element = $element;

        $this->extractDescription();
        $this->extractStyle();
    }

    private function extractDescription()
    {
        $description = $this->element->children()->desc;
        $this->description = DescriptionParser::parse($description);
    }

    private function extractStyle()
    {
        $this->style = StyleParser::parseInlineStyle($this->element['style'] ?? '');
    }
}
