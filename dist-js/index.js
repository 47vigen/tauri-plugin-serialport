import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

class Serialport {
    constructor(options) {
        this.isOpen = false;
        this.encoding = options.encoding || "utf-8";
        this.options = {
            portName: options.portName,
            baudRate: options.baudRate,
            dataBits: options.dataBits || 8,
            flowControl: options.flowControl || null,
            parity: options.parity || null,
            stopBits: options.stopBits || 2,
            timeout: options.timeout || 200
        };
        this.size = options.size || 1024;
    }
    /**
     * @description: Returns a list of all serial ports on system
     * @return {Promise<string[]>}
     */
    static async available_ports() {
        try {
            return await invoke("plugin:serialport|available_ports");
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Forces serial port closure
     * @param {string} portName
     * @return {Promise<void>}
     */
    static async forceClose(portName) {
        return await invoke("plugin:serialport|force_close", {
            portName
        });
    }
    /**
     * @description: Closes all serial ports
     * @return {Promise<void>}
     */
    static async closeAll() {
        return await invoke("plugin:serialport|close_all");
    }
    /**
     * @description: Stops listening on a serial port
     * @return {Promise<void>}
     */
    async cancelListen() {
        try {
            if (this.unListen) {
                this.unListen();
                this.unListen = undefined;
            }
            return;
        }
        catch (error) {
            return Promise.reject("Failed to cancel serial monitoring: " + error);
        }
    }
    /**
     * @description: Stops reading data
     * @return {Promise<void>}
     */
    async cancelRead() {
        try {
            return await invoke("plugin:serialport|cancel_read", {
                portName: this.options.portName
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Changes serial port
     * @param {object} options
     * @return {Promise<void>}
     */
    async change(options) {
        try {
            let isOpened = false;
            if (this.isOpen) {
                isOpened = true;
                await this.close();
            }
            if (options.portName) {
                this.options.portName = options.portName;
            }
            if (options.baudRate) {
                this.options.baudRate = options.baudRate;
            }
            if (isOpened) {
                await this.open();
            }
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Close serial port
     * @return {Promise<InvokeResult>}
     */
    async close() {
        try {
            if (!this.isOpen) {
                return;
            }
            await this.cancelRead();
            const res = await invoke("plugin:serialport|close", {
                portName: this.options.portName
            });
            await this.cancelListen();
            this.isOpen = false;
            return res;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Monitors serial port information
     * @param {function} fn
     * @return {Promise<void>}
     */
    async listen(fn, isDecode = true) {
        try {
            const appWindow = getCurrentWindow();
            await this.cancelListen();
            let readEvent = "plugin-serialport-read-" + this.options.portName;
            this.unListen = await appWindow.listen(readEvent, ({ payload }) => {
                try {
                    if (isDecode === "hex") {
                        fn(payload.hex_string);
                    }
                    else if (isDecode) {
                        const decoder = new TextDecoder(this.encoding);
                        const data = decoder.decode(new Uint8Array(payload.data));
                        fn(data);
                    }
                    else {
                        fn(new Uint8Array(payload.data));
                    }
                }
                catch (error) {
                    console.error(error);
                }
            });
            return;
        }
        catch (error) {
            return Promise.reject("Failed to monitor serial port data: " + error);
        }
    }
    /**
     * @description: Opens serial port
     * @return {*}
     */
    async open() {
        try {
            if (!this.options.portName) {
                return Promise.reject(`Port name can not be empty!`);
            }
            if (!this.options.baudRate) {
                return Promise.reject(`BaudRate can not be empty!`);
            }
            if (this.isOpen) {
                return;
            }
            const res = await invoke("plugin:serialport|open", {
                portName: this.options.portName,
                baudRate: this.options.baudRate,
                dataBits: this.options.dataBits,
                flowControl: this.options.flowControl,
                parity: this.options.parity,
                stopBits: this.options.stopBits,
                timeout: this.options.timeout
            });
            this.isOpen = true;
            return Promise.resolve(res);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Reads serial port information
     * @param {ReadOptions} options { timeout, size }
     * @return {Promise<void>}
     */
    async read(options) {
        try {
            return await invoke("plugin:serialport|read", {
                portName: this.options.portName,
                timeout: options?.timeout || this.options.timeout,
                size: options?.size || this.size
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Sets baudrate
     * @param {number} value
     * @return {Promise<void>}
     */
    async setBaudRate(value) {
        try {
            let isOpened = false;
            if (this.isOpen) {
                isOpened = true;
                await this.close();
            }
            this.options.baudRate = value;
            if (isOpened) {
                await this.open();
            }
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Sets port name
     * @param {string} value
     * @return {Promise<void>}
     */
    async setPortName(value) {
        try {
            let isOpened = false;
            if (this.isOpen) {
                isOpened = true;
                await this.close();
            }
            this.options.portName = value;
            if (isOpened) {
                await this.open();
            }
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Writes data to serial port
     * @param {string} value
     * @return {Promise<number>}
     */
    async write(value) {
        try {
            if (!this.isOpen) {
                return Promise.reject(`Serial port ${this.options.portName} not opened!`);
            }
            return await invoke("plugin:serialport|write", {
                value,
                portName: this.options.portName
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    /**
     * @description: Writes binary data to serial port
     * @param {Uint8Array} value
     * @return {Promise<number>}
     */
    async writeBinary(value) {
        try {
            if (!this.isOpen) {
                return Promise.reject(`Serial port ${this.options.portName} not opened!`);
            }
            if (value instanceof Uint8Array || value instanceof Array) {
                return await invoke("plugin:serialport|write_binary", {
                    value: Array.from(value),
                    portName: this.options.portName
                });
            }
            else {
                return Promise.reject("value type not admitted! Expected type: string, Uint8Array, number[]");
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}
// 🐍

export { Serialport };
