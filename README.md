# LOST ROBOT

> If I'd written the mapping module, it wouldn't be offline!

Well, Jörg didn't write the module
and as a result we now have a robot that doesn't know the way back anymore
because the mapping module is offline.
Fortunately, the remote interface is working as expected.

![](assets/screenshot-400x250.png)

## System Requirements

- Chrome, Edge or Firefox with ES6 support

- Keyboard or multi-touch screen

  > ⚠ *The original JS13K version has no touch controls*

## Workflow

### Development

1.  Install the dependencies

    ```
    npm install
    ```

2.  Run a webserver that is publishing the project root
    to be able to load files from `/node_modules`
    or build the application

3.  Open `/public/index.html` with a browser,
    e.g. Chromium or Firefox

### Build App

```
./bin/build
```

### Build JS13K Release

Please switch to the `js13k` branch for more information.
The submitted build is available at `/build/2019-09-13 00:09:13 JS13K.zip` (13000 bytes),
playable at [js13kgames.com](https://2019.js13kgames.com/entries/lost-robot)
and tagged with `js13k-final`.

### Build Maps

- [SVG MAP Format and Workflow](docs/MAP_FORMAT_SVG.md)

- [JSON MAP Format](docs/MAP_FORMAT_JSON.md)

## Libraries

- [Kontra](https://github.com/straker/kontra)

- [SAT](https://github.com/jriecken/sat-js)

- [ZzFX](https://github.com/KilledByAPixel/ZzFX)
