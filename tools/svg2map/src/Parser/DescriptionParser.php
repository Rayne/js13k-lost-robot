<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Parser;

class DescriptionParser
{
    public static function parse(string $description)
    {
        return StyleParser::parseInlineStyle($description);
    }
}