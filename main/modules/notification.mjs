import Electron from 'electron'
import BaseModule from '../base-module.mjs'

class Notification extends BaseModule {
  name = 'Notification'

  show (title, body) {
    new Electron.Notification({
      title,
      body
    }).show()
  }
}

export default new Notification()
