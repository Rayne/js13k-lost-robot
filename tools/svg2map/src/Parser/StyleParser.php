<?php

/**
 * (c) Dennis Meckel
 *
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 */

namespace App\Parser;

class StyleParser
{
    /**
     * @param string $inlineStyle Inline CSS style or compatible.
     * @return array
     */
    public static function parseInlineStyle(string $inlineStyle): array
    {
        $map = [];

        foreach (str_getcsv($inlineStyle, ';') as $csvCell) {
            $pos = strpos($csvCell, ':');
            $key = substr($csvCell, 0, $pos);
            $value = substr($csvCell, $pos + 1);

            $map[$key] = $value;
        }

        return $map;
    }
}