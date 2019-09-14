# Map Format SVG

[`svg2map` converts SVG files](../tools/svg2map/README.md) adhering to the following specification into the [JSON MAP format](MAP_FORMAT_JSON.md).

## Workflow

1. Design a map, e.g. with Inkscape

2. Convert the SVG MAP file to a JSON MAP file with `/bin/svg2map IN_SVG_FILE OUT_JSON_FILE`
   or save the SVG MAP file at `/data/maps` and call `/bin/build-maps`

3. Add the generated JSON content to the `maps` list in `/public/src/app.js`

## SVG MAP Format

A SVG MAP is a valid SVG file with optional annotations.
Nodes with `desc` tag children are interpreted by `svg2map`.
Nodes without descriptions are ignored.
This allows to document maps with regular SVG structures,
e.g. arrows and text.

**Examples**: See `/data/maps`.

### Static Obstacles

- *Tag*: `path`.
  Open or closed polygon chain with arbitrarily many jumps
  (`MOVETO` commands, see SVG's [path specification](https://www.w3.org/TR/SVG/paths.html)).

- *Description*: `type:obstacle`.
  Paths without description are ignored

- *Example*

  ```svg
  <path
     style="opacity:1;fill:none;fill-opacity:1;stroke:#000000;stroke-width:1.0583334;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
     inkscape:transform-center-x="38.05498"
     inkscape:transform-center-y="-49.06454"
     d="m 762.21448,-258.2754 288.98642,369.74112 162.5977,-16.089609 36.5927,-224.502491 -133.2718,-76.99573"
     id="path881"
     inkscape:connector-curvature="0"
     sodipodi:nodetypes="cccc">
    <desc id="desc67">type:obstacle</desc>
  </path>
  ```

## Map start / goal

- *Tag*: `circle` or `ellipse`

- *Description*: `type:start` / `type:goal`

- *Example*

  ```svg
  <circle
     cy="-549.7085"
     cx="258.27606"
     id="circle884"
     style="opacity:1;fill:#0b280b;fill-opacity:1;stroke:none;stroke-width:0.26458335;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
     r="11.641666">
    <desc id="desc886">type:start</desc>
  </circle>
  ```

### Collectibles

- *Tag*: `circle` or `ellipse`

- *Description*: `type:collectible`

- *Example*

  ```svg
  <circle
      style="opacity:1;fill:#e9afaf;fill-opacity:1;stroke:none;stroke-width:0.26458338;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
      id="circle954"
      cx="1931.4884"
      cy="40.767082"
      r="11.641666">
      <desc id="desc952">type:collectible</desc>
  </circle>
  ```

### Triggers

Triggers are collectibles that are firing trigger events when being collected.
Trigger listeners, e.g. doors, react to fired events.

- *Tag*: `circle` or `ellipse`

- *Description*: `type:trigger`

- *Trigger*:
    The trigger event's ID is equal to the fill style of the circle or ellipse.
    The example below fires a trigger event with ID `#55ddff`

- *Example*:

  ```svg
  <circle
      cy="-27.992308"
      cx="1102.734"
      id="circle892"
      style="opacity:1;fill:#55ddff;fill-opacity:1;stroke:none;stroke-width:0.26458335;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
      r="11.509375">
      <desc id="desc908">type:trigger</desc>
      </circle>
  ```

### Doors
Doors are trigger listeners.
Triggering a door will change its state from closed to open and vice versa

- *Tag*: `path`.
    A door has to be represented by a path with two points

- *Description*:
    `type:door` represents a closed door.
    `type:door;state:open` represents an open door

- *Trigger*:
    Doors subscribe to trigger events that are equal to the door's stroke color.
    The door in the example below subscribes to the trigger event with ID `#2aff80`

    ```svg
    <path
        id="path846"
        d="m 644.37453,-102.30765 63.47253,-63.73152"
        style="fill:none;fill-opacity:1;stroke:#2aff80;stroke-width:16.93333244;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1">
        <desc id="desc844">type:door;state:open</desc>
    </path>
    ```

## Caveats

- SVG transformations are not supported.

  If you are working with Inkscape,
  click on "Path" and select "Convert object into path"
  or use the shortcut <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>C</kbd>.
  If there are still transformations left,
  click on the object,
  then press arrow up followed by arrow down.
