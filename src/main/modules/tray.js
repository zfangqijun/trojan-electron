const { Menu, Tray, MenuItem, clipboard } = require('electron')
const fs = require('fs/promises')
const path = require('path')

const { createProxyNode } = require('../proxy-node')
const BaseModule = require('../base-module')

const Paths = require('../paths')

class TrayMenu extends BaseModule {
  name = 'Tray'
  tray = null

  init = async () => {
    this.tray = new Tray(Paths.IconTray)
    this.render()
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
    ].flat())

    this.tray.closeContextMenu()
    this.tray.setContextMenu(menu)
    this.tray.setToolTip('Katana')
  }

  update = () => {
    return this.render()
  }

  showWindow = () => {
    return new MenuItem({
      label: '显示窗口',
      click: async () => {
        await this.invoke('View.show')
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
          const systemProxy = await this.invoke('Store.getSystemProxy')

          if (checked) {
            await this.invoke('NetworkSetup.enableSystemProxys', systemProxy)
          } else {
            await this.invoke('NetworkSetup.disableSystemProxys', systemProxy)
          }
          await this.invoke('Store.setSystemProxyEnable', checked)
        } catch (error) {
          this.invoke('Notification.show', 'Error', error.message)
          this.logError(error)
        }
      }
    })
  }

  systemProxyOptions = async () => {
    const { web, secureWeb, socks } = await this.invoke('Store.getSystemProxy')

    return [
      new MenuItem({
        type: 'normal',
        label: '系统代理选项',
        enabled: false
      }),
      {
        type: 'checkbox',
        label: 'HTTP',
        checked: web.enable,
        click: async ({ checked }) => {
          await this.invoke('Store.setSystemProxyWeb', { enable: checked })
          if (await this.invoke('Store.getSystemProxyEnable')) {
            await this.invoke('NetworkSetup.enableSystemProxy', 'web', checked)
          }
        }
      },
      {
        type: 'checkbox',
        label: 'HTTPS',
        checked: secureWeb.enable,
        click: async ({ checked }) => {
          await this.invoke('Store.setSystemProxySecureWeb', { enable: checked })
          if (await this.invoke('Store.getSystemProxyEnable')) {
            await this.invoke('NetworkSetup.enableSystemProxy', 'secureWeb', checked)
          }
        }
      },
      {
        type: 'checkbox',
        label: 'Socks',
        checked: socks.enable,
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
    const nodeList = await this.invoke('Store.getNodeList')
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
                await this.invoke('Store.setCurrentNodeUUID', null)
                await this.invoke('Trojan.stop')
              } else {
                const node = await this.invoke('Store.getNodeByUUID', uuid)
                await this.invoke('Store.setCurrentNodeUUID', uuid)
                await this.invoke('Trojan.restart', node.config)
              }
              this.update()
            }
          })
        )
      ].flat()
    )
  }

  importFromURL = () => {
    return new MenuItem({
      type: 'normal',
      label: '从剪切板导入',
      click: async () => {
        try {
          const url = new URL(clipboard.readText())

          const config = await this.invoke('Trojan.toConfigFromUrl', url)

          const node = createProxyNode({
            name: decodeURIComponent(url.hash).slice(1),
            config
          })

          await this.invoke('Store.appendNode', node)

          this.update()
          this.invoke('Notification.show', '导入代理配置', '导入成功')
        } catch (error) {
          this.logError(error)
          this.log(error)
          this.invoke('Notification.show', '导入代理配置', error.message)
        }
      }
    })
  }

  tomls = () => {
    return [
      new MenuItem({
        label: '导出路由配置',
        click: async () => {
          const docBuffer = await this.invoke('Toml.exportRouteModeDocument', 'default')
          const filePath = path.resolve(Paths.Downloads, 'trojan-katana.toml')
          await fs.writeFile(filePath, docBuffer)
          this.log(filePath)
        }
      }),
      new MenuItem({
        label: '导入路由配置',
        click: async () => {
          const filePath = path.resolve(Paths.Downloads, 'trojan-katana.toml')
          const docBuffer = await fs.readFile(filePath)
          await this.invoke('Toml.importRouteModeDocument', 'default', docBuffer)
          this.log(docBuffer.toString())
        }
      })
      // new MenuItem({
      //   label: '导出节点配置',
      //   click: async function () {
      //     const doc = exportCurrentNode()
      //     const filePath = path.resolve(Paths.Downloads, 'trojan-katana-node.toml')
      //     await fs.writeFile(filePath, doc)
      //     console.log(`"${filePath}"`)
      //   }
      // }),
      // new MenuItem({
      //   label: '导入节点配置',
      //   click: async function () {
      //     const filePath = path.resolve(Paths.Downloads, 'trojan-katana-node.toml')
      //     const buffer = await fs.readFile(filePath)
      //     importCurrentNode(buffer.toString())
      //   }
      // })
    ]
  }

  quit = () => {
    return new MenuItem({
      label: '退出',
      role: 'quit'
    })
  }
}

module.exports = new TrayMenu()
