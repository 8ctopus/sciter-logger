/**
 * logger
 * @author 8ctopus <hello@octopuslabs.io>
 */

import * as sys from "@sys";
import {encode,decode} from "@sciter";
import * as debug from "@debug";

export class logger
{
    static #file = "";
    static #original;

    static #attached = false;
    static #callback = null;

    static #plaintext = null;

    /**
     * Initialize logger
     * @param object (optional) options
     * @return void
     * @note use URL.toPath() to generate file
     */
    static init(options)
    {
        if (typeof options === "undefined")
            return;

        if (typeof options !== "object") {
            console.error(`options not an object`);
            return;
        }

        if (typeof options.file === "string") {
            //console.log(options.file);

            // validate path
            if (/^[a-z]:((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+\.[a-z]+$/i.test(options.file))
                this.#file = options.file;
            else
                console.error("invalid file path");
        }

        if (this.#file === "")
            return;

        if (options.clear ?? false)
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
        if (this.#attached)
            return;

        // save original console.log function code
        this.#original = console.log;

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
                                message = loggerThis.#format(methodName, ...args);
                            else
                                message = "-----------------------------------------------------------------";

                            // write message to file
                            loggerThis.#write(message);

                            // send message to subscribers
                            loggerThis.#send(methodName, message);

                            // use closest method in native console
                            switch (methodName) {
                                case "note":
                                case "debug":
                                    originMethod = target["log"];
                                    break;

                                case "line":
                                    originMethod = target["log"];
                                    args[0] = message;
                                    break;

                                case "exception":
                                    originMethod = target["error"];
                                    break;
                            }

                            break;
                    }

                    // call original method if it exists
                    if (originMethod)
                        return originMethod.apply(this, args);
                };
            }
        });

        this.#attached = true;
        console.debug("logger started and attached to console");
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
        this.#callback = callback;
    }

    /**
     * Add plaintext
     * @param plaintext element
     * @return void
     */
    static plaintext(element)
    {
        if (typeof element !== "object" || !element.constructor || element.constructor.name !== "Element" || element.tag !== "plaintext") {
            console.error(`element not plaintext`);
            return;
        }

        // clean plaintext hack (plaintext always has a text element created)
        const clean = element.$("> text");

        if (clean)
            clean.remove();

        this.#plaintext = element;
    }

    /**
     * Debug info
     * @return void
     */
    static debug()
    {
        console.debug(`original console.log - ${this.#original}`);

        // check if sciter is running with --debug flag
        if (this.#original == "(...args) => log(3,0,args)")
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
        if (this.#callback)
            // call callback
            this.#callback(level, message);

        if (!this.#plaintext)
            return;

        this.#plaintext.append(JSX(level, {}, [message]));

        // scroll to last item
        this.#plaintext.lastElementChild.scrollIntoView({behavior: "smooth"});
    }

    /**
     * Copy object making all properties visible
     * @param object object
     * @return object
     */
    static #copyObject(object)
    {
        let copy = {};

        // get all keys (enumerable or not)
        const keys = Object.getOwnPropertyNames(object);

        // copy all keys (making them enumerable)
        keys.forEach((key) => {
            copy[key] = object[key];
        });

        return copy;
    }

    /**
     * Format message
     * @param string level
     * @param array messages
     * @return string
     */
    static #format(level, ...messages)
    {
        if (!Array.isArray(messages))
            return "";

        let message = "";

        for (let i = 0; i < messages.length; ++i) {
            // add space
            message += i ? ' ' : '';

            const item = messages[i];

            switch (typeof item) {
                case "object":
                    if (Array.isArray(item))
                        message += "Array " + JSON.stringify(item, null, 3);
                    else {
                        const name = item.constructor.name ?? '';

                        switch (name) {
                            case "Map":
                                message += name + " " + JSON.stringify(Object.fromEntries(item), null, 3);
                                break;

                            case "Date":
                                message = name + " " + item;
                                break;

                            default:
                                // make all object properties visible
                                const copy = this.#copyObject(item);
                                message += name + " " + JSON.stringify(copy, null, 3);
                                break;
                        }
                    }

                    break;

                default:
                case "string":
                    message += item;
                    break;
            }
        }

        // add time
        const [hh, mm, ss] = new Date().toLocaleTimeString("en-US").split(/:| /)

        return `${hh}:${mm}:${ss} ${level.toUpperCase()}: ${message}`;
    }

    /**
     * Write message to file
     * @param string message
     * @return Promise
     */
    static async #write(message)
    {
        try {
            if (this.#file === "")
                return;

            // open file
            // https://nodejs.org/api/fs.html#fs_file_system_flags
            const handle = await sys.fs.open(this.#file, "a+", 0o666)

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
            const handle = await sys.fs.open(this.#file, "w", 0o666)

            const buffer = encode("", "utf-8");
            await handle.write(buffer);
            await handle.close();
        }
        catch (e) {
            console.error(`clear log - FAILED - ${e.toString()}`);
        }
    }
}
