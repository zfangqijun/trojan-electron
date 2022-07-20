const { Menu, Tray, MenuItem, clipboard } = require('electron');
const R = require('ramda');
const fs = require('fs/promises');
const path = require('path');

const BaseModule = require('../../base-module');

const WindowManager = require('../../window');
const Paths = require('../../paths');
const { Trojan } = require('../proxy');

const {
    exportRouterModeByName,
    importRouterModeByName,
    exportCurrentNode,
    importCurrentNode
} = require('../../toml');

const notification = require('../../notification/notification');

class TrayMenu extends BaseModule {
    name = 'Tray';
    tray = new Tray(Paths.IconTray);

    init = () => {
        this.log('init');
    }

    render = async () => {
        const _____ = new MenuItem({ type: 'separator' })

        const menu = Menu.buildFromTemplate([
            await this.showWindow(),
            await this.proxyOnOff(),
            _____,
            await this.systemProxyOptions(),
            _____,
            await this.proxyNodeOptions(),
            await this.importFromURL(),
            _____,
            await this.tomls(),
            await this.quit()
        ].flat());

        this.tray.closeContextMenu();
        this.tray.setContextMenu(menu)
        this.tray.setToolTip('Katana')
    }

    showWindow = () => {
        return new MenuItem({
            label: '显示窗口',
            click: function () {
                WindowManager.show('main');
            }
        })
    }

    proxyOnOff = async () => {
        return new MenuItem({
            type: 'checkbox',
            label: '开启系统代理',
            checked: await this.invoke('Store.getSystemProxyEnable'),
            click: async ({ checked }) => {
                try {
                    const systemProxy = await this.invoke('Store.getSystemProxy');

                    if (checked) {
                        await this.invoke('NetworkSetup.enableSystemProxys', systemProxy);
                    } else {
                        await this.invoke('NetworkSetup.disableSystemProxys', systemProxy);
                    }
                    await this.invoke('Store.setSystemProxyEnable', checked);

                } catch (error) {
                    notification.show({ title: '系统代理', body: error.message })
                    Elog.error(error.message)
                }

            }
        })
    }

    systemProxyOptions = async () => {
        const { web, secureWeb, socks } = await this.invoke('Store.getSystemProxy');

        return [
            new MenuItem({
                type: 'normal',
                label: '系统代理选项',
                enabled: false,
            }),
            {
                type: 'checkbox', label: 'HTTP', checked: web.enable,
                click: async ({ checked }) => {
                    await this.invoke('Store.setSystemProxyWeb', { enable: checked })
                    if (await this.invoke('Store.getSystemProxyEnable')) {
                        await this.invoke('NetworkSetup.enableSystemProxy', 'web', checked)
                    }
                }
            },
            {
                type: 'checkbox', label: 'HTTPS', checked: secureWeb.enable,
                click: async ({ checked }) => {
                    await this.invoke('Store.setSystemProxySecureWeb', { enable: checked })
                    if (await this.invoke('Store.getSystemProxyEnable')) {
                        await this.invoke('NetworkSetup.enableSystemProxy', 'secureWeb', checked)
                    }
                }
            },
            {
                type: 'checkbox', label: 'Socks', checked: socks.enable,
                click: async ({ checked }) => {
                    await this.invoke('Store.setSystemProxySocks', { enable: checked })
                    if (await this.invoke('Store.getSystemProxyEnable')) {
                        await this.invoke('NetworkSetup.enableSystemProxy', 'socks', checked)
                    }
                }
            }
        ]
    }

    proxyNodeOptions = async () => {
        const nodeList = await this.invoke('Store.getNodeList');
        return Promise.all(
            [
                new MenuItem({
                    type: 'normal',
                    label: '代理节点',
                    enabled: false
                }),

                nodeList.map(async ({ name, uuid, config }) =>
                    new MenuItem({
                        type: 'checkbox',
                        label: `${name} (${config.remote_addr}:${config.remote_port})`,
                        checked: uuid === await this.invoke('Store.getCurrentNodeUUID'),
                        click: async () => {
                            if (uuid === await this.invoke('Store.getCurrentNodeUUID')) {
                                await this.invoke('Store.setCurrentNodeUUID', null);
                                Trojan.stop();
                            } else {
                                const node = await this.invoke('Store.getNodeByUUID', uuid);
                                await this.invoke('Store.setCurrentNodeUUID', uuid);
                                Trojan.restart(node.config);
                            }
                            this.render()
                        }
                    })
                )
            ].flat()
        )
    }

    importFromURL = (render) => {
        return new MenuItem({
            type: 'normal',
            label: '从剪切板导入',
            click: async () => {
                try {
                    const url = new URL(clipboard.readText());

                    const config = Trojan.toConfigFromUrl(url)

                    const node = createProxyNode({
                        name: decodeURIComponent(url.hash).slice(1),
                        config
                    })

                    await this.invoke('Store.appendNode', node);

                    this.render();

                    notification.show({ title: '导入代理配置', body: '导入成功' })
                }
                catch (error) {
                    notification.show({ title: '导入代理配置', body: error.message })
                    console.error(error);
                }
            }
        })
    }

    tomls = () => {
        return [
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
                label: '导出节点配置',
                click: async function () {
                    const doc = exportCurrentNode();
                    const filePath = path.resolve(Paths.Downloads, 'trojan-katana-node.toml');
                    await fs.writeFile(filePath, doc);
                    console.log(`"${filePath}"`)
                },
            }),
            new MenuItem({
                label: '导入节点配置',
                click: async function () {
                    const filePath = path.resolve(Paths.Downloads, 'trojan-katana-node.toml');
                    const buffer = await fs.readFile(filePath)
                    importCurrentNode(buffer.toString());
                }
            }),
        ]
    }

    quit = () => {
        return new MenuItem({
            label: '退出',
            role: 'quit'
        })
    }
}

module.exports = new TrayMenu();