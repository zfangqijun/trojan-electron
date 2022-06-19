const tray = require('./modules/tray');
const { Trojan } = require('./modules/proxy');
const store = require('./modules/store');
const rpc = require('./modules/rpc');
const networksetup = require('./modules/network-setup')
const ports = require('./ports');

/**
 * 
 * @param {import('electron').App} app 
 */
module.exports = async function (app) {
    await ports.find();
    await rpc.start();

    const systemProxy = store.getSystemProxy();
    const uuid = store.getCurrentNode()
    const currentNode = store.getNodeByUUID(uuid);

    if (currentNode) {
        await Trojan.start(currentNode.config);
    }

    if (systemProxy.enable) {
        await networksetup.enableSystemProxys(systemProxy)
    } else {
        await networksetup.disableSystemProxys(systemProxy)
    }

    tray.render();

    app.on('will-quit', async (event) => {
        event.preventDefault();
        try {
            const systemProxy = store.getSystemProxy();
            await networksetup.disableSystemProxys(systemProxy);
            await Trojan.stop();
            app.exit();
        } catch (error) {
            console.error(error)
            app.exit();
        }
    })

    app.on('window-all-closed', (event) => {
        event.preventDefault();
    })
}