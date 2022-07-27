const Electron = require('electron')
const BaseModule = require('../base-module')

class Notification extends BaseModule {
  name = 'Notification'

  show (title, body) {
    new Electron.Notification({
      title,
      body
    }).show()
  }
}

module.exports = new Notification()
