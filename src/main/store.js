/// <reference path="../common/types/electron-store.d.ts"/>

const R = require('ramda');
const ElectronStore = require('electron-store');
const GlobalObserver = require('./observer/observer')

class Store extends ElectronStore {
    constructor() {
        super({
            name: 'store',
            accessPropertiesByDotNotation: true,
            defaults: require('../common/store-defaults.json'),
            schema: {
                ...require('./modules/store/schema.json'),
            }
        });

        // this.onDidAnyChange((newValue) => {
        //     GlobalObserver.emit(GlobalObserver.Events.StoreChange, newValue)
        // })
    }

    getSystemProxyEnable = this.get.bind(this, 'systemProxy.enable');
    setSystemProxyEnable = this.set.bind(this, 'systemProxy.enable');
    getSystemProxyWeb = this.get.bind(this, 'systemProxy.web');
    setSystemProxyWeb = this.set.bind(this, 'systemProxy.web');
    getSystemProxySecureWeb = this.get.bind(this, 'systemProxy.secureWeb');
    setSystemProxySecureWeb = this.set.bind(this, 'systemProxy.secureWeb');
    getSystemProxySocks = this.get.bind(this, 'systemProxy.socks');
    setSystemProxySocks = this.set.bind(this, 'systemProxy.socks');
    getSystemProxyPac = this.get.bind(this, 'systemProxy.pac');
    setSystemProxyPac = this.set.bind(this, 'systemProxy.pac');
    getSystemProxy = this.get.bind(this, 'systemProxy');
    setSystemProxy = this.set.bind(this, 'systemProxy');
    getNodeList = this.get.bind(this, 'proxyNode.list');
    getCurrentNodeUUID = this.get.bind(this, 'proxyNode.current');
    setCurrentNodeUUID = this.set.bind(this, 'proxyNode.current');
    getRouter = this.get.bind(this, 'settings.router');
    setRouter = this.set.bind(this, 'settings.router');
    getRouterModes = this.get.bind(this, 'settings.router.modes');
    setRouterModes = this.set.bind(this, 'settings.router.modes');

    setSystemProxyByName = (name, option) => {
        if (name === 'pac') this.setSystemProxyPac(option)

        if (name === 'web') this.setSystemProxyWeb(option)

        if (name === 'secureWeb') this.setSystemProxySecureWeb(option)

        if (name === 'socks') this.setSystemProxySocks(option)
    }

    getNodeByUUID = (uuid) => {
        return this.getNodeList().find(R.propEq('uuid', uuid));
    }

    getCurrentNode = () => {
        return this.getNodeByUUID(this.getCurrentNodeUUID());
    }

    appendNode = (node) => {
        this.setNodeList(this.getNodeList().concat(node))
    }

    setNodeByUUID = (uuid, node) => {
        this.setNodeList(this.getNodeList().map(R.when(R.propEq('uuid', uuid), () => node)))
    }

    removeNodeByUUID = (uuid) => {
        this.setNodeList(
            R.pipe(
                R.map(R.when(R.propEq('uuid', uuid), () => null)),
                R.reject(R.isNil)
            )(this.getNodeList())
        )
    }

    getRouterModeByName = (name) => {
        return this.getRouterModes().find(R.propEq('name', name));
    }

    setRouterModeByName = (name, mode) => {
        this.setRouterModes(this.getRouterModes().map(R.when(R.propEq('name', name), () => mode)))
    }
}

module.exports = new Store();