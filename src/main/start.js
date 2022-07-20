const tray = require('./modules/tray');
const { Trojan } = require('./modules/proxy');
const store = require('./modules/store');
const networksetup = require('./modules/network-setup')
const ports = require('./ports');

/**
 * 
 * @param {import('electron').App} app 
 */
module.exports = async function (app) {
    const systemProxy = store.getSystemProxy();
    const currentNode = store.getCurrentNode();

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