const { app, Menu, Tray, MenuItem, dialog } = require('electron');
const fs = require('fs/promises')
const path = require('path')

const proxyNodeSelect = require('./proxy-node-select');
const systemProxy = require('./system-proxy');
const importFromUrl = require('./import-from-url');
const onOff = require('./on-off');

const WindowManager = require('../../window');
const Paths = require('../../paths');
const store = require('../store');
const {
    exportRouterModeByName,
    importRouterModeByName,
    exportCurrentRouterMode,
    importCurrentRouterMode,
    exportCurrentNode,
    importCurrentNode
} = require('../../toml')

const separator = { type: 'separator' }

let tray = new Tray(Paths.IconTray);

function render() {
    tray.closeContextMenu();

    tray.setContextMenu(
        Menu.buildFromTemplate([
            showWindow(),
            onOff(),
            separator,
            ...systemProxy(),
            separator,
            ...proxyNodeSelect(render),
            importFromUrl(render),
            separator,
            new MenuItem({
                label: '导出路由配置',
                click: async function () {
                    const doc = exportRouterModeByName('default');
                    const filePath = path.resolve(Paths.Downloads, 'trojan-katana.toml');
                    await fs.writeFile(filePath, doc);
                    console.log(`"${filePath}"`)
                }
            }),
            new MenuItem({
                label: '导入路由配置',
                click: async function () {
                    const filePath = path.resolve(Paths.Downloads, 'trojan-katana.toml');
                    const buffer = await fs.readFile(filePath)
                    importRouterModeByName('default', buffer.toString());
                }
            }),
            new MenuItem({
                label:'导出节点配置',
                click: async function () {
                    const doc = exportCurrentNode();
                    const filePath = path.resolve(Paths.Downloads, 'trojan-katana-node.toml');
                    await fs.writeFile(filePath, doc);
                    console.log(`"${filePath}"`)
                },
            }),
            new MenuItem({
                label:'导入节点配置',
                click: async function () {
                    const filePath = path.resolve(Paths.Downloads, 'trojan-katana-node.toml');
                    const buffer = await fs.readFile(filePath)
                    importCurrentNode(buffer.toString());
                }
            }),
            quit()
        ])
    )

    tray.setToolTip('Katana')
}

function showWindow() {
    return new MenuItem({
        label: '显示窗口',
        click: function () {
            WindowManager.show('main');
        }
    })
}

function quit() {
    return new MenuItem({
        label: '退出',
        role: 'quit'
    })
}

module.exports = { render }