const { MenuItem, clipboard } = require('electron');
const R = require('ramda');
const store = require('../store')
const { Trojan } = require('../proxy');

module.exports = function (render) {
    const nodes = store.getNodeList()
        .map(({ name, uuid, config }) =>
            new MenuItem({
                type: 'checkbox',
                label: `${name} (${config.remote_addr}:${config.remote_port})`,
                checked: uuid === store.getCurrentNodeUUID(),
                click: function () {
                    if (uuid === store.getCurrentNodeUUID()) {
                        store.setCurrentNodeUUID(null);
                        Trojan.stop();
                    } else {
                        const node = store.getNodeByUUID(uuid);
                        store.setCurrentNodeUUID(uuid);
                        Trojan.restart(node.config);
                    }
                    render()
                }
            })
        );

    return [
        new MenuItem({
            type: 'normal',
            label: '代理节点',
            enabled: false
        }),
        ...nodes
    ]
}