const store = require('../store');
const tray = require('../tray');
const { Trojan, createProxyNode } = require('../proxy')
const networksetup = require('../network-setup')

module.exports = {
    async trayRender() {
        tray.render()
    },

    async trojanRestart() {
        Trojan.restart(Trojan.config)
    },

    async getTraffic() {
        return Trojan.getTraffic();
    },

    async getStoreData() {
        return store.getStoreData();
    },

    async setNodeByUUID(uuid, node) {
        store.setNodeByUUID(uuid, node)
    },

    async newNode(options) {
        const node = createProxyNode({
            name: options.name,
            config: Trojan.toConfigFromOptions(options.config)
        });

        store.appendNode(node);
    },

    async removeNodeByUUID(uuid) {
        store.removeNodeByUUID(uuid)
    },

    async setSystemProxyEnable(enable) {
        store.setSystemProxyEnable(enable)
    },

    async setSystemProxyByName(name, option) {
        store.setSystemProxyByName(name, option)
    },

    async enableSystemProxy(option, enable) {
        if (store.getSystemProxyEnable()) {
            await networksetup.enableSystemProxy(option, enable)
        }
    },

    async enableSystemProxys() {
        await networksetup.enableSystemProxys(store.getSystemProxy())
    },

    async disableSystemProxys() {
        await networksetup.disableSystemProxys(store.getSystemProxy())
    },

    async setRouterModeByName(name, newMode){
        store.setRouterModeByName(name, newMode);
    },
}