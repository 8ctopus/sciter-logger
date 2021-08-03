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

Apply colors to output

```html
<style src="src/logger.css" />
```

### multiple windows

- as each window has its own console, you'll need to import the console object from the parent window:

```js
// get console from parent window
console = Window.this.parent.document.globalThis.console;
```

### iframe

- iframes also have their own console, you'll need to import the parent console

```js
// get console from iframe parent
console = Window.this.document.globalThis.console;
```

## known issues

- `logger` methods `format`, `write` and `send` should be private but presently can't be because called inside the `Proxy`.
