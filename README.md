# sciter logger

This is a [sciter.js](https://sciter.com/) logger that listens to the console output and redirects it to a file and/or any html element.

This work was made possible thanks to [https://2ality.com/2015/10/intercepting-method-calls.html](https://2ality.com/2015/10/intercepting-method-calls.html).

![sciter logger screenshot](screenshot.png)

## demo

- git clone the repository
- run `install.bat` to download the latest sciter binaries and the sciter package manager
- install packages `php spm.phar install`
- run `scapp.bat`
- to refresh the app after changes to the html/css click `F5`

## install

- add the `src` dir to your project or use the sciter package manager
- in `<script type="module">`

```js
import {logger} from "src/logger.js";

// initialize logger
logger.init(URL.toPath(__DIR__ + "test.log", true));

// attach logger to console
logger.attach();

// capture unhandled exceptions
logger.capture();

// log
console.log("new logger test");
```

### enhanced console

Console is enhanced with new methods

```
console.debug("test debug");
console.note("test note");
console.exception("test exception");
```

### redirect console output

Console output can be redirected to any html element

```js
document.on("ready", function() {
    const plaintext = document.$("plaintext#logger");

    // subscribe to logger messages
    logger.subscribe(function(level, message) {
        plaintext.append(JSX(level, {}, [message]));

        // scroll to last item
        plaintext.lastElementChild.scrollIntoView({behavior: "smooth"});
    });
});
```

Output can be colored if you include the stylesheet

```html
<style src="src/logger.css" />
```

### multiple windows and iframes

- as each `Window` has its own console, you'll need to use the `console` object from the parent window:

```js
import {logger} from "src/logger.js";

// get console from parent
logger.setConsole();
```

- unhandled exceptions must also be captured in every new `Window`.

```js
import {logger} from "src/logger.js";

// capture unhandled exceptions
logger.capture();
```

`iframe`s behave just like `Window`s in that aspect.

## known issues

- no known issues

## ideas

- open log file only once? would require non-exclusive rights to the file
- spawn a separate logging window
- add icons for each channel
