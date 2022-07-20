const EventEmitter = require('events');

class BaseModule extends EventEmitter {
    invokeId = 0;

    constructor() {
        super();

        this.log = (...args) => {
            this.emit('log', ...args);
        }

        this.log.error = (...args) => {
            this.emit('log/error', ...args);
        }
    }

    invoke = (methodPath, ...args) => {
        this.log('invoke', methodPath, args);

        const [moduleName, methodName] = methodPath.split('.');

        if (!moduleName || !methodName) {
            this.log.error(new Error(`路径: ${methodPath} 不合法`))
            return Promise.reject(new Error(`methodPath:${methodPath} 不合法`))
        }

        return new Promise((resolve, reject) => {
            this.emit('module/invoke', String(this.invokeId), moduleName, methodName, ...args);
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