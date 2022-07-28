const EventEmitter = require('events')

class BaseModule extends EventEmitter {
  invokeId = 0

  log (...args) {
    this.emit('log', ...args)
  }

  logDebug (...args) {
    this.emit('log/debug', ...args)
  }

  logWarn (...args) {
    this.emit('log/warn', ...args)
  }

  logError (...args) {
    this.emit('log/error', ...args)
  }

  invoke (methodPath, ...args) {
    const [moduleName, methodName] = methodPath.split('.')

    if (!moduleName || !methodName) {
      this.logError(new Error(`路径: ${methodPath} 不合法`))
      return Promise.reject(new Error(`methodPath:${methodPath} 不合法`))
    }

    return new Promise((resolve, reject) => {
      this.once(String(this.invokeId), (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })

      this.emit('module/invoke', String(this.invokeId), moduleName, methodName, ...args)

      this.invokeId++
    })
  }

  waitModuleInited (moduleName) {
    return new Promise((resolve, reject) => {
      const callback = (name) => {
        if (name === moduleName) {
          resolve()
          this.removeListener('module/inited', callback)
        }
      }
      this.on('module/inited', callback)
    })
  }

  waitModuleReady (moduleName) {
    return new Promise((resolve, reject) => {
      const callback = (name) => {
        if (name === moduleName) {
          resolve()
          this.removeListener('module/ready', callback)
        }
      }
      this.on('module/ready', callback)
    })
  }
}

module.exports = BaseModule
