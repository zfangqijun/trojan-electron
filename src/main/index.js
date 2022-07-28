
const { app } = require('electron')
const Dao = require('./dao')
const NetworkSetup = require('./modules/network-setup')
const Store = require('./modules/store')
const Ports = require('./modules/ports')
const RPCServer = require('./modules/rpc-server')
const RpcMethods = require('./modules/rpc-methods')
const Tray = require('./modules/tray')
const Trojan = require('./modules/trojan')
const Notification = require('./modules/notification')
const Toml = require('./modules/toml')

app.on('ready', async () => {
  if (require('electron-squirrel-startup')) {
    app.exit()
  } else if (!app.requestSingleInstanceLock()) {
    app.exit()
  } else {
    require('./preload')()

    process.on('uncaughtException', (error) => {
      Notification.show('Error', error.message)
      console.error('uncaughtException', error)
    })

    console.info(`User Data %c"${app.getPath('userData')}"`, 'color: green')
    console.info(`Log %c"${app.getPath('logs')}"`, 'color: green')

    Dao.autoInit(false)
    Dao.register(Store)
    Dao.register(Ports)
    Dao.register(NetworkSetup)
    Dao.register(Tray)
    Dao.register(RpcMethods)
    Dao.register(RPCServer)
    Dao.register(Trojan)
    Dao.register(Notification)
    Dao.register(Toml)

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
