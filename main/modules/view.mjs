import { BrowserWindow, BrowserView, app } from 'electron'
import Paths from '../paths.mjs'
import path from 'path'
import BaseModule from '../base-module.mjs'

const size = {
  width: 1280,
  height: 960
}

class View extends BaseModule {
  name = 'View'

  views = new Map()

  window = null

  show = (name = 'main') => {
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

    const view = new BrowserView()

    window.setBrowserView(view)
    view.setBounds({ x: 0, y: 0, ...size })
    view.setAutoResize({ width: true, height: true })

    if (app.isPackaged) {
      view.webContents.loadFile(path.resolve(Paths.App, 'view/index.html'))
      // view.webContents.openDevTools({ mode: 'undocked', activate: true });
    } else {
      view.webContents.loadURL('http://localhost:3000/')
      view.webContents.openDevTools({ mode: 'undocked', activate: true })
    }

    this.window = window
  }
}

export default new View()
