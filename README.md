# sciter logger

This is a [sciter.js](https://sciter.com/) primitive logger that saves console logs to a file.

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
logger.init("test.log");

// log
logger.log("new logger test");
```
