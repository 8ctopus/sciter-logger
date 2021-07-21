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
    static #_clear;

    static #_original = "";
    static #_callback = null;

    /**
     * Initialize logger
     * @param string file - log file path
     * @param bool clear - clear log file
     * @return void
     * @note use URL.toPath()
     */
    static init(file, clear)
    {
        this.#_file  = file;
        this.#_clear = clear;

        if (clear)
            this.#clear();
    }

    /**
     * Attach to console
     * @return void
     */
    static attach()
    {
        // save original console.log function code
        this.#_original = this.#_original || console.log;

        // create proxy around console object
        console = new Proxy(console, {
            get(target, methodName, receiver) {
                // get origin method
                const originMethod = target[methodName];

                return function(...args) {
                    switch (methodName) {
                        case "log":
                        case "warn":
                        case "error":
                            // dispatch internally
                            const message = logger.format(methodName, args);

                            // write to file
                            logger.write(message);

                            // send message to subscribers
                            logger.send(methodName, message);
                            break;
                    }

                    // call origin method
                    return originMethod.apply(this, args);
                };
            }
        });

        if (!this.#_clear) {
            this.newLine();
            this.newLine();
        }

        console.log("Logger started and attached to console");
    }

    /**
     * Capture unhandled exceptions
     * @return void
     */
    static capture()
    {
        debug.setUnhandledExeceptionHandler(function(err) {
            console.error(err.toString() + "\r\n" + err.stack);
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
     * Send to subscribers
     * @param string level
     * @param string message
     * @return void
     */
    static send(level, message)
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
    static format(level, message)
    {
        switch (level) {
            case "warn":
                message = `WARNING: ${message}`;
                break;

            case "error":
                message = `ERROR: ${message}`;
                break;

            default:
        }

        // add time
        const [hh, mm, ss] = new Date().toLocaleTimeString("en-US").split(/:| /)

        return `${hh}:${mm}:${ss} ${message}`;
    }

    static newLine()
    {
        this.write("");
    }

    /**
     * Write message to file
     * @param string message
     * @return void
     * @note needs to be public for Proxy to access it
     */
    static write(message)
    {
        try {
            // open file
            // https://nodejs.org/api/fs.html#fs_file_system_flags
            sys.fs.open(this.#_file, "a+", 0o666)
                .then(
                    function(handle) {
                        // write message to file
                        const buffer = encode(message + "\r\n", "utf-8");
                        handle.write(buffer);
                        handle.close();
                    },
                    function(error) {
                        console.error(`write to file - FAILED - ${error}`);
                    });
        }
        catch (e) {
            // send message to original console method
            console.error(`write to file - FAILED - ${e.toString()}`);
        }
    }

    /**
     * Clear log
     * @return void
     */
    static #clear()
    {
        try {
            sys.fs.open(this.#_file, "w", 0o666)
                .then(
                    function(handle) {
                        const buffer = encode("", "utf-8");
                        handle.write(buffer);
                        handle.close();
                    },
                    function(error) {
                        console.error(`clear file - FAILED - ${error}`);
                    });
        }
        catch (e) {
            console.error(`clear log - FAILED - ${e.toString()}`);
        }
    }

    /**
     * Debug info
     */
    static debug()
    {
        console.log(`original console.log - ${this.#_original}`);

        // check if sciter is running with --debug flag
        if (this.#_original == "(...args) => log(3,0,args)")
            console.warn("sciter running with --debug flag");
        else
            console.log("sciter running without --debug flag");
    }
}
