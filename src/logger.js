/**
 * logger
 * @author 8ctopus <hello@octopuslabs.io>
 */

import * as sys from "@sys";
import {encode,decode} from "@sciter";

export class logger
{
    static #file;

    static #log;
    static #warn;
    static #error;

    static init(file)
    {
        this.#file  = file;

        // save original console methods
        this.#log   = console.log;
        this.#warn  = console.warn;
        this.#error = console.error;
    }

    static log(message)
    {
        // send message to original console method
        this.#log.apply(console, arguments);

        this.#write(`${message}`);
    }

    static warn(message)
    {
        // send message to original console method
        this.#warn.apply(console, arguments);

        this.#write(`${message}`);
    }

    static error(message)
    {
        // send message to original console method
        this.#error.apply(console, arguments);

        this.#write(`${message}`);
    }

    static #write(message)
    {
        try {
            // open file
            // https://nodejs.org/api/fs.html#fs_file_system_flags
            sys.fs.open(this.#file, "a+", 0o666)
                .then(function(file) {
                    // write message
                    const buffer = encode(message + "\r\n", "utf-8");
                    file.write(buffer);
                    file.close();
                });
        }
        catch (e) {
            // send message to original console method
            this.#error.apply(console, arguments);
        }
    }
}
