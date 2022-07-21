const { createProxyNode } = require('./proxy/proxy-node')
const BaseModule = require('../base-module')

class RPCMethods extends BaseModule {
  name = 'RPCMethods'

  getMethods = () => {
    return R.pipe(
      R.keys,
      R.filter(R.propIs(Function, R.__, this)),
      R.reject(R.equals('getMethods')),
      R.map(R.prop(R.__, this))
    )(this)
  }

  trayUpdate = async () => {
    await this.invoke('Tary.update')
  }

  trojanRestart = async () => {
    await this.invoke('Trojan.restart')
  }

  getTraffic = async () => {
    return await this.invoke('Trojan.getTraffic')
  }

  getStoreData = async () => {
    return this.invoke('Store.getStoreData')
  }

  /**
     *
     * @param {string} uuid
     * @param {ProxyNode} node
     */
  setNodeByUUID = async (uuid, node) => {
    const nodeList = await this.invoke('Store.getNodeList')
    const newNodeList = nodeList.map(R.when(R.propEq('uuid', uuid), () => node))
    await this.invoke('Store.setNodeList', newNodeList)
  }

  appendNode = async (options) => {
    const node = createProxyNode({
      name: options.name,
      config: await this.invoke('Trojan.toConfigFromOptions', options.config)
    })

    await this.invoke('Store.appendNode', node)
  }

  removeNodeByUUID = async (uuid) => {
    const nodeList = await this.invoke('Store.getNodeList')
    const newNodeList = R.pipe(
      R.map(R.when(R.propEq('uuid', uuid), () => null)),
      R.reject(R.isNil)
    )(nodeList)
    await this.invoke('Store.setNodeList', newNodeList)
  }

  setSystemProxyEnable = async (enable) => {
    await this.invoke('Store.setSystemProxyEnable', enable)
  }

  /**
     *
     * @param {SystemProxyName} name
     * @param {SystemProxyOption} option
     */
  setSystemProxyByName = async (name, option) => {
    if (name === 'pac') await this.invoke('Store.setSystemProxyPac', option)

    if (name === 'web') await this.invoke('Store.setSystemProxyWeb', option)

    if (name === 'secureWeb') await this.invoke('Store.setSystemProxySecureWeb', option)

    if (name === 'socks') await this.invoke('Store.setSystemProxySocks', option)
  }

  enableSystemProxy = async (option, enable) => {
    if (await this.invoke('Store.getSystemProxyEnable')) {
      await this.invoke('NetworkSetup.enableSystemProxy', option, enable)
    }
  }

  enableSystemProxys = async () => {
    await this.invoke('NetworkSetup.enableSystemProxys', await this.invoke('Store.getSystemProxy'))
  }

  disableSystemProxys = async () => {
    await this.invoke('NetworkSetup.disableSystemProxys', await this.invoke('Store.getSystemProxy'))
  }

  setRouterModeByName = async (name, newMode) => {
    await this.invoke('Store.setRouterModeByName', name, newMode)
  }
}

module.exports = new RPCMethods()
