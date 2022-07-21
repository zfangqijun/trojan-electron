/// <reference path="../../common/types/electron-store.d.ts"/>

const ElectronStore = require('electron-store')
const BaseModule = require('../base-module')

class Store extends BaseModule {
  name = 'Store'
  eStore = new ElectronStore({
    name: 'store',
    accessPropertiesByDotNotation: true,
    /**
         * @type {ElectronStoreState}
         */
    defaults: require('../../common/store-defaults.json'),
    schema: require('../../common/schema.json')
  })

  init = () => {
    // this.onDidAnyChange((newValue) => {
    //     GlobalObserver.emit(GlobalObserver.Events.StoreChange, newValue)
    // })
  }

  /**
     *
     * @returns {ElectronStoreState}
     */
  getStoreData = () => {
    return this.eStore.store
  }

  /**
     *
     * @param {ElectronStoreState} newValue
     */
  setStoreData = (newValue) => {
    this.eStore.set(newValue)
  }

  /**
     * @type {() => boolean}
     */
  getSystemProxyEnable = this.eStore.get.bind(this.eStore, 'systemProxy.enable')

  /**
     * @type {(value: boolean) => void}
     */
  setSystemProxyEnable = this.eStore.set.bind(this.eStore, 'systemProxy.enable')

  /**
     * @type {() => SystemProxyOption}
     */
  getSystemProxyWeb = this.eStore.get.bind(this.eStore, 'systemProxy.web')

  /**
     * @type {(value: SystemProxyOption) => void}
     */
  setSystemProxyWeb = this.eStore.set.bind(this.eStore, 'systemProxy.web')

  /**
     * @type {() => SystemProxyOption}
     */
  getSystemProxySecureWeb = this.eStore.get.bind(this.eStore, 'systemProxy.secureWeb')

  /**
     * @type {(value: SystemProxyOption) => void}
     */
  setSystemProxySecureWeb = this.eStore.set.bind(this.eStore, 'systemProxy.secureWeb')

  /**
     * @type {() => SystemProxyOption}
     */
  getSystemProxySocks = this.eStore.get.bind(this.eStore, 'systemProxy.socks')

  /**
     * @type {(value: SystemProxyOption) => void}
     */
  setSystemProxySocks = this.eStore.set.bind(this.eStore, 'systemProxy.socks')

  /**
     * @type {() => SystemProxyOption}
     */
  getSystemProxyPac = this.eStore.get.bind(this.eStore, 'systemProxy.pac')

  /**
     * @type {(value: SystemProxyOption) => void}
     */
  setSystemProxyPac = this.eStore.set.bind(this.eStore, 'systemProxy.pac')

  /**
     * @type {() => SystemProxy}
     */
  getSystemProxy = this.eStore.get.bind(this.eStore, 'systemProxy')

  /**
     * @type {(value: SystemProxy) => void}
     */
  setSystemProxy = this.eStore.set.bind(this.eStore, 'systemProxy')

  /**
     * @type {() => ProxyNode[]}
     */
  getNodeList = this.eStore.get.bind(this.eStore, 'proxyNode.list')

  /**
     * @type {() => string}
     */
  getCurrentNodeUUID = this.eStore.get.bind(this.eStore, 'proxyNode.current')

  /**
     * @type {(value: string) => void}
     */
  setCurrentNodeUUID = this.eStore.set.bind(this.eStore, 'proxyNode.current')

  /**
     * @type {() => ElectronStoreState['settings']['router']}
     */
  getRouter = this.eStore.get.bind(this.eStore, 'settings.router')

  /**
     * @type {(value: ElectronStoreState['settings']['router']) => void}
     */
  setRouter = this.eStore.set.bind(this.eStore, 'settings.router')

  /**
     * @type {() => RouterMode[]}
     */
  getRouterModes = this.eStore.get.bind(this.eStore, 'settings.router.modes')

  /**
     * @type {(value: RouterMode[]) => void}
     */
  setRouterModes = this.eStore.set.bind(this.eStore, 'settings.router.modes')

  /**
     *
     * @param {string} uuid
     * @returns {ProxyNode}
     */
  getNodeByUUID = (uuid) => {
    return this.getNodeList().find(R.propEq('uuid', uuid))
  }

  /**
     *
     * @returns {ProxyNode}
     */
  getCurrentNode = () => {
    return this.getNodeByUUID(this.getCurrentNodeUUID())
  }

  /**
     *
     * @param {ProxyNode} node
     */
  appendNode = (node) => {
    this.setNodeList(this.getNodeList().concat(node))
  }

  /**
     *
     * @param {string} name
     * @returns {RouterMode}
     */
  getRouterModeByName = (name) => {
    return this.getRouterModes().find(R.propEq('name', name))
  }

  /**
     *
     * @param {string} name
     * @param {RouterMode} mode
     */
  setRouterModeByName = (name, mode) => {
    this.setRouterModes(this.getRouterModes().map(R.when(R.propEq('name', name), () => mode)))
  }
}

module.exports = new Store()
