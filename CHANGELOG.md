# CHANGELOG

## Unreleased

- Map loading resets the temporary point cloud ("weak map")

- Removed unexpected turbo graphics effects when reaching the goal

- Added favicon

- Added multi-touch support

- Fixed missing turbo effect when moving backwards and turning left

- Fixed unexpected rotation when pressing LEFT + RIGHT at the same time (Easy Mode)

## Release for JS13K GAMES

- Added support for Microsoft Edge

- Added a fourth map

- Added `ESC` to open the level menu

- Changed the intro text

## Playtest 1

- Added turbo mode (button `T` or space bar) with special effects for lead-footed players.

  **Caveat**: Some keyboards do not support all button combinations, e.g. UP + LEFT + SPACE.
  Players using the arrow keys should stick to the button `T` instead of the space bar.

- Added key `C` to toggle the camera mode (robot-centric, fixed)

- Replaced `ZzFX` with `ZzFX Micro` (-382b)

- Added collision sound

- Added collision penalty: -10 points per collision per 500ms

- Made door opening sound a little less horrible

- Added a goal fanfare

- Added a "spoiler" to the robot to graphically differentiate between front and rear

- Reduced collectible pickup distance to 40 units (distance to the robot's center)

- Added one optional point to the first map.
  (Best strategy for speed runs:
  Collect the new point and continue backwards with HARD MODE controls)

- Doors are no longer visibly tracked by the temporary map.
  This prevents players from thinking that an opened door cannot be passed
  because outdated mapping information is still showing distance sensor readings from the previously closed door

- Collected collectibles are no longer removed from the map.
  They are now rendered as empty circle to improve the player's orientation.
  This change can also help finding routes for speed running 

## Playtest 0

- First public playtest
