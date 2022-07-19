const { MenuItem } = require('electron');
const networksetup = require('../network-setup');
const store = require('../store');
const notification = require('../../notification/notification');
const Elog = require('electron-log')

module.exports = function onOff() {
    return new MenuItem({
        type: 'checkbox',
        label: '开启系统代理',
        checked: store.getSystemProxyEnable(),
        click: async function ({ checked }) {
            try {
                const systemProxy = store.getSystemProxy();

                if (checked) {
                    await networksetup.enableSystemProxys(systemProxy)
                    // notification.show({ body: '系统代理已开启' })
                } else {
                    await networksetup.disableSystemProxys(systemProxy)
                    // notification.show({ body: '系统代理已关闭' })
                }

                store.setSystemProxyEnable(checked)

            } catch (error) {
                notification.show({ title: '系统代理', body: error.message })
                Elog.error(error.message)
            }

        }
    })
}