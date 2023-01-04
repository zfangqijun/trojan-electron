import BaseModule from './base-module.mjs'
import ElectronLog from 'electron-log'

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
          m.emit('module/inited', module.name)
        })
      }))
    )
  }

  /**
   *
   * @param {string} name
   * @param {BaseModule} module
   */
  static async register (module) {
    if (Dao.registered.has(module.name)) {
      throw new Error(`Dao ${module.name} already registered`)
    }

    Dao.registered.set(module.name, module)

    const elog = ElectronLog.scope(module.name)

    if (module instanceof BaseModule) {
      module.on('log', elog.info)
      module.on('log/warn', elog.warn)
      module.on('log/error', elog.error)
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
      elog.info('%c初始化完成', 'color: green')
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

export default Dao
