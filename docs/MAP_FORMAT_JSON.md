# Map Format JSON

## Example

```json
{
  "start": [258, -549],
  "goal": [2006, -157],
  "doors": [
    [644, -102, 707, -166, "#2aff80", false]
  ],
  "obstacles": [
    [76, -868, 76, -348, 398, -348]
  ],
  "collectibles": [
    [258, -686, "#2aff80"]
  ]
}
```

## Static Obstacles

List of lists of alternating X and Y coordinate pairs,
e.g. `[x0, y0, x1, y1, x2, y2]`.

```json
{
  "obstacles": [
    [76, -868, 76, -348, 398, -348]
  ]
}
```

## Map Start and Goal

List with X and Y coordinate pair.

```json
{
  "start": [258, -549],
  "goal": [2006, -157]
}
```

## Collectibles and Triggers

Every collectible is a trigger and vice versa in the JSON MAP format.
List of lists of collectibles.
The fill color defines the trigger event ID.

```
[X, Y, FILL_COLOR_AND_TRIGGER]
```

```json
{
  "collectibles": [
    [258, -686, "#2aff80"]
  ]
}
```

## Doors

List of lists of `[X0, Y0, X1, Y1, FILL_COLOR_AND_TRIGGER, IS_CLOSED]`.
A door starts at `(X0, Y0)` and ends at `(X1, Y1)`.
The door's fill colors is also used as trigger ID.
The last item specifies if the door is closed or open when loading the map.
