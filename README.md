# sciter logger

This is a [sciter.js](https://sciter.com/) logger that listens to the console output and redirects it to a file and/or any html element.

This work was made possible thanks to [https://2ality.com/2015/10/intercepting-method-calls.html](https://2ality.com/2015/10/intercepting-method-calls.html).

![sciter logger screenshot](screenshot.png)

## demo

- git clone the repository
- on Linux/Mac `chmod +x install.sh start.sh`
- run `install.bat` (Win) or `./install.sh` (Linux/Mac) to download the latest sciter binaries and the sciter package manager
- install packages `npm install`
- run `start.bat` (Win) or `./start.sh` (Linux/Mac)

## install

- use npm (`npm install git://github.com/8ctopus/sciter-logger#1.1.0`), alternatively add the `src` dir to your project
- add to `<script type="module">`

```js
import Logger from "node_modules/sciter-logger/src/logger.js";

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

## known issues

- iframe code causes issues, commented for now

## code linting

Javascript code linting uses [eslint](https://github.com/eslint/eslint). HTML code linting uses [HTMLLint](https://htmlhint.com/). Both require Node.js

```sh
npm install

# lint javascript
npx eslint main.htm src/*.js

# lint html
npx htmlhint main.htm
```

## ideas

- open log file only once? would require non-exclusive rights to the file
- spawn a separate logging window
- add icons for each channel
