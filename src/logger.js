/**
 * logger
 * @author 8ctopus <hello@octopuslabs.io>
 */

import * as sys from "@sys";
import {encode,decode} from "@sciter";

export class logger
{
    static #file;
    static #console;

    /**
     * Initialize logger
     * @param string file - log file path
     * @param bool console - also log to console
     * @return void
     * @note use URL.toPath()
     */
    static init(file, console)
    {
        this.#file    = file;
        this.#console = console;
    }

    static log(message)
    {
        if (this.#console)
            console.log(message);

        this.#write(`${message}`);
    }

    static warn(message)
    {
        if (this.#console)
            console.warn(message);

        this.#write(`WARN - ${message}`);
    }

    static error(message)
    {
        if (this.#console)
            console.error(message);

        this.#write(`ERROR - ${message}`);
    }

    /**
     * Write message to file
     * @param string message
     * @return void
     */
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
}
