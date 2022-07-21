
const { app } = require('electron')
const Elog = require('electron-log')
const notification = require('./notification/notification')
const Dao = require('./dao')
const NetworkSetup = require('./modules/network-setup')
const Store = require('./modules/store')
const Ports = require('./modules/ports')
const RPCServer = require('./modules/rpc-server')
const RpcMethods = require('./modules/rpc-methods')
const Tray = require('./modules/tray')
const Trojan = require('./modules/trojan')

app.on('ready', async () => {
  if (require('electron-squirrel-startup')) {
    app.exit()
  } else if (!app.requestSingleInstanceLock()) {
    app.exit()
  } else {
    process.on('uncaughtException', (error) => {
      notification.show({ title: 'Error', body: error.message })
      Elog.error('uncaughtException', error)
    })

    Elog.info(`User Data %c"${app.getPath('userData')}"`, 'color: green')
    Elog.info(`Log %c"${app.getPath('logs')}"`, 'color: green')

    require('./preload')()

    Dao.autoInit(false)
    Dao.register(Store)
    Dao.register(Ports)
    Dao.register(NetworkSetup)
    Dao.register(Tray)
    Dao.register(RpcMethods)
    Dao.register(RPCServer)
    Dao.register(Trojan)

    await Dao.initAllModules()

    app.on('will-quit', async (event) => {
      event.preventDefault()
      try {
        const systemProxy = Store.getSystemProxy()
        await NetworkSetup.disableSystemProxys(systemProxy)
        await Trojan.stop()
        app.exit()
      } catch (error) {
        console.error(error)
        app.exit()
      }
    })

    app.on('window-all-closed', (event) => {
      event.preventDefault()
    })
  }
})
