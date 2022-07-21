
class Dao {
    static registered = {};

    /**
     * 
     * @param {string} name 
     * @param {*} module 
     */
    static async register(module) {
        if (Dao.registered[module.name]) {
            throw new Error(`Dao ${module.name} already registered`);
        }

        Dao.registered[module.name] = module;

        if (module.on) {
            const Elog = require('./elog')(module.name);
            module.on('log', Elog.info);
            module.on('log/warn', Elog.warn);
            module.on('log/error', Elog.error);
            module.on('module/invoke', async (id, moduleName, methodName, ...args) => {
                const callee = Dao.getModule(moduleName);
                try {
                    const result = await callee[methodName].call(module, ...args);
                    module.emit(id, null, result);
                }
                catch (error) {
                    module.emit(id, error);
                }
            });
        }

        if (module.init) {
            await module.init();
        }
    }

    static getModule(name) {
        return this.registered[name];
    }

}

module.exports = Dao;