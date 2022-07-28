const ElectronLog = require('electron-log')

/**
 *
 * @param {string} logId
 * @param {ElectronLog.LevelOption} fileLevel
 * @param {ElectronLog.LevelOption} consoleLevel
 * @returns
 */
module.exports = function (logId, fileLevel = 'info', consoleLevel = 'silly') {
  const log = ElectronLog.create(logId)
  log.transports.file.level = fileLevel
  log.transports.console.level = consoleLevel
  log.transports.file.fileName = 'main.log'

  return log.scope(logId)
}
