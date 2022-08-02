const { BrowserWindow, BrowserView, app } = require('electron')
const Paths = require('../paths')
const path = require('path')
const BaseModule = require('../base-module')

const size = {
  width: 1280,
  height: 960
}

class View extends BaseModule {
  name = 'View'

  views = new Map()

  window = null

  show (name = 'main') {
    if (
      this.window &&
      this.window.isDestroyed() === false &&
      this.window.isVisible()
    ) {
      this.window.show()
      return
    }

    const window = new BrowserWindow({
      ...size,
      titleBarStyle: 'hidden',
      focusable: true
    })

    const view = this.getView(name)

    window.setBrowserView(view)
    view.setBounds({ x: 0, y: 0, ...size })
    view.setAutoResize({ width: true, height: true })

    if (app.isPackaged) {
      view.webContents.loadFile(path.resolve(Paths.App, 'src/view/index.html'))
      // view.webContents.openDevTools({ mode: 'undocked', activate: true });
    } else {
      view.webContents.loadURL('http://localhost:3000/')
      view.webContents.openDevTools({ mode: 'undocked', activate: true })
    }

    this.window = window
  }

  getView (name) {
    if (this.views.has(name)) {
      return this.views.get(name)
    }
    const view = new BrowserView()
    this.views.set(name, view)
    return view
  }
}

module.exports = new View()
