const { MenuItem } = require('electron');
const networksetup = require('../network-setup');
const store = require('../store');
const R = require('ramda');

module.exports = function () {
    const { web, secureWeb, socks } = store.getSystemProxy();

    return [
        new MenuItem({
            type: 'normal',
            label: '系统代理选项',
            enabled: false,
        }),
        {
            type: 'checkbox', label: 'HTTP', checked: web.enable,
            click: function ({ checked }) {
                store.setSystemProxyWeb({ enable: checked })
                if (store.getSystemProxyEnable()) {
                    networksetup.enableSystemProxy('web', checked)
                }
            }
        },
        {
            type: 'checkbox', label: 'HTTPS', checked: secureWeb.enable,
            click: function ({ checked }) {
                store.setSystemProxySecureWeb({ enable: checked })
                if (store.getSystemProxyEnable()) {
                    networksetup.enableSystemProxy('secureWeb', checked)
                }
            }
        },
        {
            type: 'checkbox', label: 'Socks', checked: socks.enable,
            click: function ({ checked }) {
                store.setSystemProxySocks({ enable: checked })
                if (store.getSystemProxyEnable()) {
                    networksetup.enableSystemProxy('socks', checked)
                }
            }
        }
    ]
}