const EventEmitter = require('events');

class BaseModule extends EventEmitter {
    invokeId = 0;

    constructor() {
        super();
    }

    invoke = (module, method, ...args) => {
        return new Promise((resolve, reject) => {
            this.emit('module/invoke', String(this.invokeId), module, method, ...args);
            this.once(String(this.invokeId), (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            })
            this.invokeId++;
        })
    }
}

module.exports = BaseModule;