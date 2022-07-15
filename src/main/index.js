
const { app } = require('electron');
const Elog = require('electron-log');
const notification = require('./notification/notification')

global.crypto = {
  getRandomValues: require('get-random-values')
}

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

    await require('./start')(app);
  }
})