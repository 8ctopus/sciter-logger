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

    /**
     * Initialize logger
     * @param string file path
     * @note use URL.toPath()
     */
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

        this.#write(`WARN - ${message}`);
    }

    static error(message)
    {
        // send message to original console method
        this.#error.apply(console, arguments);

        this.#write(`ERROR - ${message}`);
    }

    static #write(message)
    {
        try {
            // add time
            const [hh, mm, ss] = new Date().toLocaleTimeString("en-US").split(/:| /)

            message = `${hh}:${mm}:${ss} ${message}`;

            // open file
            // https://nodejs.org/api/fs.html#fs_file_system_flags
            sys.fs.open(this.#file, "a+", 0o666)
                .then(
                    function(file) {
                        // write message to file
                        const buffer = encode(message + "\r\n", "utf-8");
                        file.write(buffer);
                        file.close();
                    },
                    function(error) {
                        console.error(`open file - FAILED - ${error}`);
                    });
        }
        catch (e) {
            // send message to original console method
            console.error("write file - FAILED");
        }
    }
}
