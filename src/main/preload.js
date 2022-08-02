module.exports = function () {
  global.R = require('ramda')

  global.crypto = {
    getRandomValues: require('get-random-values')
  }

  const ElectronLog = require('electron-log')
  ElectronLog.transports.file.level = 'info'
  ElectronLog.transports.console.level = 'silly'
  ElectronLog.transports.file.fileName = 'main.log'
}
