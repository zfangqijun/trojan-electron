import { app } from 'electron'
import Dao from './dao.js'
import NetworkSetup from './modules/network-setup.js'
import Store from './modules/store.js'

import Ports from './modules/ports.js'
import RPCServer from './modules/rpc-server.js'
import RpcMethods from './modules/rpc-methods.js'
import Tray from './modules/tray.js'
import Trojan from './modules/trojan.js'
import Notification from './modules/notification.js'
import Toml from './modules/toml.js'
import View from './modules/view.js'
import Elog from 'electron-log'

await app.whenReady();

if ((await import('electron-squirrel-startup')).default) {
    app.exit()
} else if (!app.requestSingleInstanceLock()) {
    app.exit()
} else {
    await import('./preload.mjs')

    process.on('uncaughtException', (error) => {
        Notification.show('Error', error.message)
        console.error('uncaughtException', error)
    })

    process.on('warning', e => console.warn(e.stack))

    Elog.info(`User Data %c"${app.getPath('userData')}"`, 'color: green')
    Elog.info(`Log %c"${app.getPath('logs')}"`, 'color: green')

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
    Dao.register(View)

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
