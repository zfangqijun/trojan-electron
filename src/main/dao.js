
class Dao {
  static registered = {}

  /**
     *
     * @param {string} name
     * @param {*} module
     */
  static async register (module) {
    if (Dao.registered[module.name]) {
      throw new Error(`Dao ${module.name} already registered`)
    }

    Dao.registered[module.name] = module

    if (module.on) {
      const Elog = require('./elog')(module.name)
      module.on('log', Elog.info)
      module.on('log/warn', Elog.warn)
      module.on('log/error', Elog.error)
      module.on('module/invoke', async (id, moduleName, methodName, ...args) => {
        try {
          const callee = Dao.getModuleMethod(moduleName, methodName)
          const result = await callee.call(module, ...args)

          module.emit(id, null, result)
        } catch (error) {
          module.emit(id, error)
        }
      })
    }

    if (module.init) {
      await module.init()
    }
  }

  static getModule (name) {
    return this.registered[name]
  }

  static getModuleMethod (moduleName, methodName) {
    const module = Dao.getModule(moduleName)
    if (R.isNil(module)) {
      throw new Error(`Module ${moduleName} not found`)
    }
    if (module[methodName]) {
      return module[methodName]
    } else {
      throw new Error(`Method ${methodName} not found`)
    }
  }
}

module.exports = Dao
