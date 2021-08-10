/**
 * logger
 * @author 8ctopus <hello@octopuslabs.io>
 */

import * as sys from "@sys";
import {encode,decode} from "@sciter";
import * as debug from "@debug";

export class logger
{
    static #_file;
    static #_original;

    static #_attached = false;
    static #_callback = null;

    /**
     * Initialize logger
     * @param string file - log file path or "" if logging to file not wanted
     * @param bool clear - clear log file
     * @return void
     * @note use URL.toPath() to generate file
     */
    static init(file, clear)
    {
        this.#_file = file;

        if (file === "")
            return;

        if (clear)
            this.#clear();
        else {
            this.#newLine();
            this.#newLine();
        }
    }

    /**
     * Attach to console
     * @return void
     */
    static attach()
    {
        // check if already attached to console
        if (this.#_attached)
            return;

        // save original console.log function code
        this.#_original = console.log;

        const loggerThis = this;

        // create proxy around console object
        console = new Proxy(console, {
            get(target, methodName, receiver) {
                // get original method
                let originMethod = target[methodName];

                return function(...args) {
                    switch (methodName) {
                        case "log":
                        case "warn":
                        case "error":

                        // new methods
                        case "debug":
                        case "exception":
                        case "line":
                        case "note":
                            // format message
                            let message;

                            if (methodName !== "line")
                                message = loggerThis.#format(methodName, args);
                            else
                                message = "-----------------------------------------------------------------";

                            // write message to file
                            loggerThis.#write(message);

                            // send message to subscribers
                            loggerThis.#send(methodName, message);

                            // use closest method in native console
                            if (methodName === "note" || methodName === "debug" || methodName === "line")
                                originMethod = target["log"];
                            else
                            if (methodName === "exception")
                                originMethod = target["error"];

                            break;
                    }

                    // call original method if it exists
                    if (originMethod)
                        return originMethod.apply(this, args);
                };
            }
        });

        this.#_attached = true;
        console.debug("Logger started and attached to console");
    }

    /**
     * Capture unhandled exceptions
     * @return void
     */
    static capture()
    {
        debug.setUnhandledExeceptionHandler((err) => {
            let message = err.toString() + "\r\n" + err.stack;

            // cleanup message
            message = message.replace("Error: ", "");

            if (console.exception !== undefined)
                console.exception(message);
            else
                console.error(message);
        });
    }

    /**
     * Subscribe to new messages
     * @param function callback
     * @return void
     */
    static subscribe(callback)
    {
        this.#_callback = callback;
    }

    /**
     * Debug info
     * @return void
     */
    static debug()
    {
        console.debug(`original console.log - ${this.#_original}`);

        // check if sciter is running with --debug flag
        if (this.#_original == "(...args) => log(3,0,args)")
            console.warn("sciter running with --debug flag");
        else
            console.debug("sciter running without --debug flag");
    }

    /**
     * Set window or iframe console to parent console
     * @return void
     */
    static setConsole()
    {
        // check for parent window
        if (Window.this && Window.this.parent)
            console = Window.this.parent.document.globalThis.console;
        else
        // check for iframe
        if (document.parentElement && document.parentElement.ownerDocument)
            console = document.parentElement.ownerDocument.globalThis.console;
        else
            console.error("setConsole - FAILED");
    }

    /**
     * Check if logger is attached to console
     * @return bool
     */
    static isAttached()
    {
        return typeof console.exception === "function";
    }

    /**
     * Send message to subscribers
     * @param string level
     * @param string message
     * @return void
     */
    static #send(level, message)
    {
        if (!this.#_callback)
            return;

        // call callback
        this.#_callback(level, message);
    }

    /**
     * Format message
     * @param string level
     * @param string message
     * @return string
     */
    static #format(level, message)
    {
        switch (level) {
            case "debug":
                message = `DEBUG: ${message}`;
                break;

            case "error":
                message = `ERROR: ${message}`;
                break;

            case "exception":
                message = `EXCEPTION: ${message}`;
                break;

            case "note":
                message = `NOTE: ${message}`;
                break;

            case "warn":
                message = `WARNING: ${message}`;
                break;

            default:
        }

        // add time
        const [hh, mm, ss] = new Date().toLocaleTimeString("en-US").split(/:| /)

        return `${hh}:${mm}:${ss} ${message}`;
    }

    /**
     * Write message to file
     * @param string message
     * @return Promise
     */
    static async #write(message)
    {
        try {
            if (this.#_file === "")
                return;

            // open file
            // https://nodejs.org/api/fs.html#fs_file_system_flags
            const handle = await sys.fs.open(this.#_file, "a+", 0o666)

            // write message to file
            const buffer = encode(message + "\r\n", "utf-8");
            await handle.write(buffer);
            await handle.close();
        }
        catch (e) {
            // send message to original console method
            console.error(`write to file - FAILED - ${e.toString()}`);
        }
    }

    /**
     * Add new line
     * @return void
     */
    static #newLine()
    {
        this.#write("");
    }

    /**
     * Clear log
     * @return Promise
     */
    static async #clear()
    {
        try {
            const handle = await sys.fs.open(this.#_file, "w", 0o666)

            const buffer = encode("", "utf-8");
            await handle.write(buffer);
            await handle.close();
        }
        catch (e) {
            console.error(`clear log - FAILED - ${e.toString()}`);
        }
    }
}
