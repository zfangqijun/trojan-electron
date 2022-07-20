/// <reference path="../common/types/electron-store.d.ts"/>

const R = require('ramda');
const ElectronStore = require('electron-store');
const GlobalObserver = require('./observer/observer');
const BaseModule = require('./base-module');

class Store extends BaseModule {
    name = 'Store';

    eStore = new ElectronStore({
        name: 'store',
        accessPropertiesByDotNotation: true,
        defaults: require('../common/store-defaults.json'),
        schema: {
            ...require('./modules/store/schema.json'),
        }
    });

    init = () => {
        this.emit('log', 'Initializing store module');
        // this.onDidAnyChange((newValue) => {
        //     GlobalObserver.emit(GlobalObserver.Events.StoreChange, newValue)
        // })
    }

    getSystemProxyEnable = this.eStore.get.bind(this.eStore, 'systemProxy.enable');
    setSystemProxyEnable = this.eStore.set.bind(this.eStore, 'systemProxy.enable');
    getSystemProxyWeb = this.eStore.get.bind(this.eStore, 'systemProxy.web');
    setSystemProxyWeb = this.eStore.set.bind(this.eStore, 'systemProxy.web');
    getSystemProxySecureWeb = this.eStore.get.bind(this.eStore, 'systemProxy.secureWeb');
    setSystemProxySecureWeb = this.eStore.set.bind(this.eStore, 'systemProxy.secureWeb');
    getSystemProxySocks = this.eStore.get.bind(this.eStore, 'systemProxy.socks');
    setSystemProxySocks = this.eStore.set.bind(this.eStore, 'systemProxy.socks');
    getSystemProxyPac = this.eStore.get.bind(this.eStore, 'systemProxy.pac');
    setSystemProxyPac = this.eStore.set.bind(this.eStore, 'systemProxy.pac');
    getSystemProxy = this.eStore.get.bind(this.eStore, 'systemProxy');
    setSystemProxy = this.eStore.set.bind(this.eStore, 'systemProxy');
    getNodeList = this.eStore.get.bind(this.eStore, 'proxyNode.list');
    getCurrentNodeUUID = this.eStore.get.bind(this.eStore, 'proxyNode.current');
    setCurrentNodeUUID = this.eStore.set.bind(this.eStore, 'proxyNode.current');
    getRouter = this.eStore.get.bind(this.eStore, 'settings.router');
    setRouter = this.eStore.set.bind(this.eStore, 'settings.router');
    getRouterModes = this.eStore.get.bind(this.eStore, 'settings.router.modes');
    setRouterModes = this.eStore.set.bind(this.eStore, 'settings.router.modes');

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