# README

`php-svg-lib-modification` is a strongly reduced fork of [`php-svg-lib`](https://github.com/PhenX/php-svg-lib).
The modified library is only able to interpret [SVG paths](https://www.w3.org/TR/SVG/paths.html)
and returns global coordinates of points on given SVG paths.

## Changes made to `php-svg-lib`

- Removed everything except `Svg\Tag\Path`

- Renamed `Svg\Tag\Path` to `App\Svg\Path`

- Modified and renamed `Svg\Tag\Path::start()` to `getGlobalPolygons()`.
  The method is now returning polygons with global coordinates

- Added `SurfacePointCollector` which supports a subset of the interface `Svg\Surface\SurfaceInterface`.
  The new class is collecting and returning global point coordinates instead of painting on surfaces

## License

[`php-svg-lib`](https://github.com/PhenX/php-svg-lib) is LGPL. Therefore this fork is LGPL, too.
