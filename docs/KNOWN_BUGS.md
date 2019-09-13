# Known Bugs

- The app doesn't utilize `pos` of `SAT.Polygon` for obstacles.
  The app is only using `SAT.Polygon.calcPoints` for sensor measurements and rendering.
  It ignores `pos` for obstacles.
  Modifying `SAT.polygon.pos` will lead to unexpected visuals and collisions.

  Solution: Don't modify `SAT.polygon.pos` of obstacles. It should remain `(0,0)`

- Robots driving with turbo mode can collide earlier than robots driving with normal mode. This is a minor problem and does primarly occur on shallow angles. One easy solution would be to use multiple (two is enough) collision checks
