module.exports = function () {
  global.R = require('ramda')

  global.crypto = {
    getRandomValues: require('get-random-values')
  }

  Object.assign(global.console, require('electron-log').functions)
}
