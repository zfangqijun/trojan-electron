
class Dao {
    static registered = {};

    /**
     * 
     * @param {string} name 
     * @param {*} module 
     */
    static register(module) {
        if (this.registered[module.name]) {
            throw new Error(`Dao ${module.name} already registered`);
        }

        this.registered[module.name] = module;

        if (module.init) {
            module.init();
        }

        if (module.on) {
            const Elog = require('./modules/elog')(module.name);
            module.on('log', Elog.info);
            module.on('log/error', Elog.error);
        }
    }


}

module.exports = Dao;