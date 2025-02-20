# sciter logger

![latest version](https://img.shields.io/npm/v/sciter-logger.svg)
![downloads](https://img.shields.io/npm/dy/sciter-logger.svg)

This is a [sciter.js](https://sciter.com/) logger that listens to the console output and redirects it to a file and/or any html element.

![sciter logger screenshot](https://github.com/8ctopus/sciter-logger/raw/master/screenshot.png)

This work was made possible thanks to [https://2ality.com/2015/10/intercepting-method-calls.html](https://2ality.com/2015/10/intercepting-method-calls.html).

## demo

- git clone the repository
- install packages `npm install`
- install latest sciter sdk `npm run install-sdk`
- start the demo `npm run scapp`

## demo requirements

- A recent version of Node.js `node` (tested with 22 LTS) and its package manager `npm`.
    - On Windows [download](https://nodejs.dev/download/) and run the installer
    - On Linux check the [installation guide](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-2-%E2%80%94-installing-node-js-with-apt-using-a-nodesource-ppa)

## add to your project

You can either add it to your project using npm or by copying the src directory.

### using npm

- install package `npm install sciter-logger`

### copy source

- add the `src` dir to your project

### add to `<script type="module">`

```js
// npm
import Logger from "node_modules/sciter-logger/src/logger.js";
// or source copy
import Logger from "src/logger.js";

// initialize logger
Logger.init({
    url: __DIR__ + "%DATE%.log",
    clear: true,
});

// attach logger to console
Logger.attach();

// capture unhandled exceptions
Logger.capture();

// log
console.log("new logger test");
```

### enhanced console

Console is enhanced with new methods

```js
console.debug("test debug");
console.exception("test exception");
console.note("test note");
console.line();
```

### objects can be logged

```js
console.debug({
    a: 1,
    b: {
        alpha: "test",
        beta: "yet another test"
    },
    c: 3,
});
```

### redirect console output

Console output can be redirected to a plaintext element

```js
Logger.plaintext(document.$("plaintext"));
```

Output can be colored if you include the stylesheet

```html
<style src="node_modules/sciter-logger/src/logger.css" />
```

### subscribe to logger

```js
Logger.subscribe(function(level, message) {

});
```

### multiple windows and iframes

- as each `Window` has its own console, you will need to use the `console` object from the parent window:

```js
import Logger from "src/logger.js";

// get console from parent
Logger.setConsole();
```

- unhandled exceptions must also be captured in every new `Window`.

```js
import Logger from "src/logger.js";

// capture unhandled exceptions
Logger.capture();
```

`iframe`s behave just like `Window`s in that aspect.

## ideas

- open log file only once? would require non-exclusive rights to the file
- spawn a separate logging window
- add icons for each channel
