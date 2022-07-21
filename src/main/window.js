const { BrowserWindow, BrowserView, app } = require('electron')
const Paths = require('./paths')
const path = require('path')

const size = {
  width: 1280,
  height: 960
}

class WindowManager {
  static views = new Map()
  /**
     * @type {BrowserWindow}
     */
  static window = null

  static show (name = 'main') {
    if (
      WindowManager.window &&
            WindowManager.window.isDestroyed() === false &&
            WindowManager.window.isVisible()
    ) {
      WindowManager.window.show()
      return
    }

    const window = new BrowserWindow({
      ...size,
      titleBarStyle: 'hidden',
      focusable: true
    })

    const view = WindowManager.getView()

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

    WindowManager.window = window
  }

  /**
     *
     * @param {*} name
     * @returns {BrowserView}
     */
  static getView (name) {
    if (WindowManager.views.has(name)) {
      return WindowManager.views.get(name)
    }
    const view = new BrowserView()
    WindowManager.views.set(name, view)
    return view
  }
}

module.exports = WindowManager
