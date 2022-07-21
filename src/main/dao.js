
class Dao {
  static registered = new Map()
  static options = {
    autoInit: true
  }

  static autoInit (bool) {
    Dao.options.autoInit = bool
  }

  static initAllModules () {
    const modules = Array.from(Dao.registered.values()).filter(module => R.is(Function, module.init))

    return Promise.all(
      modules.map(module => Promise.resolve(module.init()).then(() => {
        module.log('%c初始化完成', 'color: green')
        modules.forEach((m) => {
          m.emit('module/ready', module.name)
        })
      }))
    )
  }

  /**
     *
     * @param {string} name
     * @param {*} module
     */
  static async register (module) {
    if (Dao.registered.has(module.name)) {
      throw new Error(`Dao ${module.name} already registered`)
    }

    Dao.registered.set(module.name, module)

    const Elog = require('./elog')(module.name)

    if (module.on) {
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

    if (Dao.options.autoInit && module.init) {
      await module.init()
      Elog.info('%c初始化完成', 'color: green')
    }
  }

  static getModule (name) {
    return this.registered.get(name)
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
