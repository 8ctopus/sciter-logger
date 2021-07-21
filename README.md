# sciter logger

This is a [sciter.js](https://sciter.com/) logger that listens to the console output and redirects it to a file.

## demo

- git clone the repository
- run `install.bat` to download the latest sciter binaries and the sciter package manager
- run `scapp.bat`
- to refresh the app after changes to the html/css click `F5`

## install

- add the `src` dir to your project
- add to script

```js
<script type="module">

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

- as each window has its own console, you'll need to import the console object from the parent window:

```js
// get console from parent window
console = Window.this.parent.document.globalThis.console;
```
