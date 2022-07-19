/// <reference path="../../types/electron-store.d.ts"/>

const Store = require('electron-store');
const GlobalObserver = require('../../observer/observer')
const R = require('ramda');
const defaults = require('../../../common/store-defaults.json')
const schema = require('./schema.json')

const store = new Store({
    name: 'store',
    accessPropertiesByDotNotation: true,
    /**
     * @type {ElectronStoreState}
     */
    defaults: defaults,
    schema: {
        ...schema,
    }
});

store.onDidAnyChange((newValue) => {
    GlobalObserver.emit(GlobalObserver.Events.StoreChange, newValue)
})

/**
 * 
 * @param {string} key 
 * @returns {DefineTuple<unknown>}
 */
function define(key) {
    function get() {
        return store.get(key);
    }
    function set(value) {
        store.set(key, value)
    }
    return [get, set]
}

/**
 * 
 * @returns {ElectronStoreState}
 */
function getStoreData() {
    return store.store;
}

/**
 * 
 * @param {ElectronStoreState} data 
 */
function setStoreData(data) {
    store.set(data)
}

/**
 * @type {DefineTuple<boolean>}
 */
const [getSystemProxyEnable, setSystemProxyEnable] = define('systemProxy.enable');

/**
 * @type {DefineTuple<SystemProxyOption>}
 */
const [getSystemProxyWeb, setSystemProxyWeb] = define('systemProxy.web')

/**
 * @type {DefineTuple<SystemProxyOption>}
 */
const [getSystemProxySecureWeb, setSystemProxySecureWeb] = define('systemProxy.secureWeb')

/**
 * @type {DefineTuple<SystemProxyOption>}
 */
const [getSystemProxySocks, setSystemProxySocks] = define('systemProxy.socks')

/**
 * @type {DefineTuple<SystemProxyOption>}
 */
const [getSystemProxyPac, setSystemProxyPac] = define('systemProxy.pac')

/**
 * @type {DefineTuple<SystemProxy>}
 */
const [getSystemProxy, setSystemProxy] = define('systemProxy')

/**
 * 
 * @param {SystemProxyName} name 
 * @param {SystemProxyOption} option 
 */
function setSystemProxyByName(name, option) {
    if (name === 'pac') setSystemProxyPac(option)

    if (name === 'web') setSystemProxyWeb(option)

    if (name === 'secureWeb') setSystemProxySecureWeb(option)

    if (name === 'socks') setSystemProxySocks(option)
}

/**
 * @type {DefineTuple<ProxyNode[]>}
 */
const [getNodeList, setNodeList] = define('proxyNode.list')

/**
 * @type {DefineTuple<string>}
 */
const [getCurrentNodeUUID, setCurrentNodeUUID] = define('proxyNode.current')

function getCurrentNode(){
    return getNodeByUUID(getCurrentNodeUUID())
}

/**
 * 
 * @param {ProxyNode} node 
 */
function appendNode(node) {
    setNodeList(
        getNodeList().concat(node)
    )
}

/**
 * 
 * @param {string} uuid 
 * @param {ProxyNode} node 
 */
function setNodeByUUID(uuid, node) {
    setNodeList(
        getNodeList().map(
            R.when(R.propEq('uuid', uuid), () => node)
        )
    )
}

/**
 * 
 * @param {string} uuid 
 * @returns {ProxyNode}
 */
function getNodeByUUID(uuid) {
    return getNodeList().find(R.propEq('uuid', uuid))
}

/**
 * 
 * @param {string} uuid 
 */
function removeNodeByUUID(uuid) {
    const newList = R.pipe(
        R.map(R.when(R.propEq('uuid', uuid), () => null)),
        R.reject(R.isNil)
    )(getNodeList())
    setNodeList(newList)
}


/**
 * @type {DefineTuple<ElectronStoreState['settings']['router']>}
 */
const [getRouter, setRouter] = define('settings.router')


/**
 * @type {DefineTuple<RouterMode[]>}
 */
const [getRouterModes, setRouterModes] = define('settings.router.modes')


/**
 * 
 * @param {string} key 
 * @returns 
 */
function getRouterModeByName(name) {
    return getRouterModes().find(mode => mode.name === name)
}


/**
 * @param {string} name
 * @param {RouterMode} newMode 
 */
function setRouterModeByName(name, newMode) {
    const newModes = getRouterModes()
        .map(mode => {
            if (mode.name === name) {
                return newMode;
            }
            return mode;
        })

    setRouterModes(newModes)
}

module.exports = {
    getStoreData,
    setStoreData,

    getSystemProxyEnable,
    setSystemProxyEnable,

    getSystemProxyWeb,
    setSystemProxyWeb,
    getSystemProxySecureWeb,
    setSystemProxySecureWeb,
    getSystemProxySocks,
    setSystemProxySocks,
    getSystemProxyPac,
    setSystemProxyPac,
    getSystemProxy,
    setSystemProxy,
    setSystemProxyByName,

    getNodeList,
    setNodeList,
    getCurrentNodeUUID,
    setCurrentNodeUUID,
    getCurrentNode,

    appendNode,
    setNodeByUUID,
    getNodeByUUID,
    removeNodeByUUID,

    getRouter,
    setRouter,
    getRouterModes,
    setRouterModes,
    getRouterModeByName,
    setRouterModeByName,
}