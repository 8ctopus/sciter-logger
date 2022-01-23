/**
 * logger
 * @author 8ctopus <hello@octopuslabs.io>
 */

import * as sys from "@sys";
import {encode} from "@sciter";
import * as debug from "@debug";

export default class Logger {
    static #file = "";
    static #original;

    static #attached = false;
    static #callback = undefined;

    static #plaintext = undefined;

    /**
     * Initialize logger
     * @param {object} options - (optional)
     * @returns {void}
     */
    static init(options) {
        if (typeof options === "undefined")
            return;

        if (typeof options !== "object") {
            console.error("options not an object");
            return;
        }

        if (typeof options.url === "string") {
            const url = options.url.replace("%DATE%", new Date().toISOString().split("T")[0]);

            const file = URL.toPath(url);

            // validate file path
            if (/^[a-z]:(([/\\])[\s\w!#$%&+.=@[\]^{}\-]+)+\.[a-z]+$/i.test(file)) {
                console.log(`log to ${file}`);
                this.#file = file;
            }
            else
                console.error("invalid file path", file);
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
     * @returns {void}
     */
    static attach() {
        // check if already attached to console
        if (this.#attached)
            return;

        // save original console.log function code
        this.#original = console.log;

        const loggerThis = this;

        // create proxy around console object
        console = new Proxy(console, {
            get(target, methodName, _receiver) {
                // get original method
                let originMethod = target[methodName];

                return function(...arguments_) {
                    switch (methodName) {
                        case "log":
                        case "warn":
                        case "error":

                        // new methods
                        case "debug":
                        case "exception":
                        case "line":
                        case "note": {
                            // format message
                            const message = methodName !== "line" ? loggerThis.#format(methodName, ...arguments_)
                                : "-----------------------------------------------------------------";

                            // write message to file
                            loggerThis.#write(message);

                            // send message to subscribers
                            loggerThis.#send(methodName, message);

                            // use closest method in native console
                            switch (methodName) {
                                case "note":
                                case "debug":
                                    originMethod = target.log;
                                    break;

                                case "line":
                                    originMethod = target.log;
                                    arguments_[0] = message;
                                    break;

                                case "exception":
                                    originMethod = target.error;
                                    break;

                                default:
                            }

                            break;
                        }

                        default:
                    }

                    // call original method if it exists
                    if (originMethod)
                        return originMethod.apply(this, arguments_);
                };
            },
        });

        this.#attached = true;
        console.debug("logger started and attached to console");
    }

    /**
     * Capture unhandled exceptions
     * @param {Function} function_ - (optional) func
     * @returns {void}
     */
    static capture(function_) {
        if (typeof function_ === "function")
            debug.setUnhandledExeceptionHandler(function_);
        else {
            debug.setUnhandledExeceptionHandler(exception => {
                this.#attached ? console.exception("Unhandled exception", exception) : console.error("Unhandled exception", exception);
            });
        }
    }

    /**
     * Subscribe to new messages
     * @param {Function} callback
     * @returns {void}
     */
    static subscribe(callback) {
        this.#callback = callback;
    }

    /**
     * Add plaintext
     * @param {Element} element
     * @returns {void}
     */
    static plaintext(element) {
        if (typeof element !== "object" || !element.constructor
            || element.constructor.name !== "Element" || element.tag !== "plaintext") {
            console.error("element not plaintext");
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
     */
    static debug() {
        console.debug(`original console.log - ${this.#original}`);

        // check if sciter is running with --debug flag
        if (this.#original == "(...args) => log(3,0,args)")
            console.warn("sciter running with --debug flag");
        else
            console.debug("sciter running without --debug flag");
    }

    /**
     * Set window or iframe console to parent console
     */
    static setConsole() {
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
     * @returns {boolean}
     */
    static isAttached() {
        return typeof console.exception === "function";
    }

    /**
     * Send message to subscribers
     * @param {string} level
     * @param {string} message
     */
    static #send(level, message) {
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
     * Format message
     * @param {string} level
     * @param {...any} messages
     * @returns {string}
     */
    static #format(level, ...messages) {
        if (!Array.isArray(messages))
            return "";

        let message = "";

        for (const [index, item] of messages.entries()) {
            // add space
            message += index ? " " : "";

            switch (typeof item) {
                case "object":
                    if (item === null)
                        message += "null";
                    else
                    if (Array.isArray(item))
                        message += "Array " + JSON.stringify(item, this.#stringifyReplacer, 3);
                    else {
                        const name = item.constructor ? (item.constructor.name ?? "") : "";

                        switch (name) {
                            case "Map":
                                message += name + " " + JSON.stringify(Object.fromEntries(item), undefined, 3);
                                break;

                            case "Date":
                                message = name + " " + item;
                                break;

                            case "ArrayBuffer": {
                                const view = new Uint8Array(item);

                                message = `${name}[${view.length}]`;

                                for (let index = 0; index < view.length; ++index)
                                    message += (" " + view[index].toString(16));
                                break;
                            }

                            default: {
                                // make all object properties visible
                                const copy = this.#copyObject(item);
                                message += name + " " + JSON.stringify(copy, this.#stringifyReplacer, 3);
                                break;
                            }
                        }
                    }

                    break;

                case "string":
                default:
                    message += item;
                    break;
            }
        }

        // add time
        const [hh, mm, ss] = new Date().toLocaleTimeString("en-US").split(/:| /);

        return `${hh}:${mm}:${ss} ${level.toUpperCase()}: ${message}`;
    }

    /**
     * Write message to file
     * @param {string} message
     * @returns {Promise}
     */
    static async #write(message) {
        try {
            if (this.#file === "")
                return;

            // open file
            // https://nodejs.org/api/fs.html#fs_file_system_flags
            const handle = await sys.fs.open(this.#file, "a+", 0o666);

            // write message to file
            const buffer = encode(message + "\r\n", "utf-8");
            await handle.write(buffer);
            await handle.close();
        }
        catch (error) {
            // send message to original console method
            console.error(`write to file - FAILED - ${error.toString()}`);
        }
    }

    /**
     * Add new line
     */
    static #newLine() {
        this.#write("");
    }

    /**
     * Clear log
     * @returns {Promise}
     */
    static async #clear() {
        try {
            const handle = await sys.fs.open(this.#file, "w", 0o666);

            const buffer = encode("", "utf-8");
            await handle.write(buffer);
            await handle.close();
        }
        catch (error) {
            console.error(`clear log - FAILED - ${error.toString()}`);
        }
    }

    /**
     * Copy object making all properties visible
     * @param {object} object
     * @returns {object}
     */
    static #copyObject(object) {
        const copy = {};

        // get all keys (enumerable or not)
        const keys = Object.getOwnPropertyNames(object);

        // copy all keys (making them enumerable)
        for (const key of keys)
            copy[key] = object[key];

        return copy;
    }

    /**
     * Json stringify replacer
     * @param {string} key
     * @param {?} value
     * @returns {?}
     */
    static #stringifyReplacer(key, value) {
        return typeof value === "bigint" ? value.toString() : value;
    }
}
