
const { app } = require('electron');
const Elog = require('electron-log');
const notification = require('./notification/notification')

app.on('ready', async () => {
  if (require('electron-squirrel-startup')) {
    app.exit();
  }
  else if (!app.requestSingleInstanceLock()) {
    app.exit();
  }
  else {
    process.on('uncaughtException', (error) => {
      notification.show({ title: 'Error', body: error.message })
      Elog.error('uncaughtException', error)
    });

    Elog.info(`User Data %c"${app.getPath('userData')}"`, 'color: green')
    Elog.info(`Log %c"${app.getPath('logs')}"`, 'color: green')

    require('./preload')();

    const Dao = require('./dao');
    const NetworkSetup = require('./modules/network-setup');
    const Store = require('./modules/store');
    const Ports = require('./modules/ports');
    const RPCServer = require('./modules/rpc-server');
    const RpcMethods = require('./modules/rpc-methods');
    const TrayMenu = require('./modules/tray');

    await Dao.register(Ports);
    await Dao.register(NetworkSetup);
    await Dao.register(Store);
    await Dao.register(RpcMethods);
    await Dao.register(RPCServer);
    await Dao.register(TrayMenu);

    console.log(RpcMethods.getMethods())

    await require('./start')(app);
  }
})