import { getPortPromise } from 'portfinder'
import BaseModule from '../base-module.mjs'

const defaults = {
  proxy: 2188,
  http: 3188
}

class Ports extends BaseModule {
  name = 'Ports'
  /**
   * @typedef {{ proxy: number, proxyApi: number, http:number }} PortDict
   * @type {PortDict}
   */
  ports = {}

  init = async () => {
    const proxy = await getPortPromise({
      port: defaults.proxy,
      stopPort: defaults.proxy + 10
    })

    const proxyApi = await getPortPromise({
      port: proxy + 1,
      stopPort: proxy + 10
    })

    const http = await getPortPromise({
      port: defaults.http,
      stopPort: defaults.http + 10
    })

    this.ports = {
      proxy,
      proxyApi,
      http
    }
  }

  /**
   *
   * @param {keyof PortDict} name
   * @returns {number}
   */
  getPort = (name) => {
    if (R.has(name, this.ports)) {
      return this.ports[name]
    } else {
      throw new Error()
    }
  }
}

export default new Ports()
