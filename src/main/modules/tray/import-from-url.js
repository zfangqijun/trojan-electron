const { MenuItem, clipboard } = require('electron');
const { Trojan, createProxyNode } = require('../proxy');
const notification = require('../../notification/notification')
const store = require('../store');

module.exports = function importFromURL(render) {
    return new MenuItem({
        type: 'normal',
        label: '从剪切板导入',
        click: function () {
            try {
                const url = new URL(clipboard.readText());

                const config = Trojan.toConfigFromUrl(url)

                const node = createProxyNode({
                    name: decodeURIComponent(url.hash).slice(1),
                    config
                })

                store.appendNode(node);
                render();

                notification.show({ title: '导入代理配置', body: '导入成功' })
            }
            catch (error) {
                notification.show({ title: '导入代理配置', body: error.message })
                console.error(error);
            }
        }
    })
}