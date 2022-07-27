const BaseModule = require('../base-module')
const toml = require('@iarna/toml')

class Toml extends BaseModule {
  name = 'Toml'

  init = () => {
  }

  exportRouteModeDocument = async (name) => {
    const mode = await this.invoke('Store.getRouterModeByName', name)
    return Buffer.from(toml.stringify(mode))
  }

  importRouteModeDocument = async (name, buffer) => {
    const doc = toml.parse(buffer.toString())
    await this.invoke('Store.setRouterModeByName', name, doc)
  }
}

module.exports = new Toml()
