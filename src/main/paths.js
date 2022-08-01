const { app } = require('electron')
const path = require('path')

class Paths {
  static App = app.getAppPath()

  static Logs = app.getPath('logs')

  static UserData = app.getPath('userData')

  static Downloads = app.getPath('downloads')

  static Resource = path.resolve(Paths.App, 'resource')

  static Static = path.resolve(Paths.Resource, 'static')

  static TrojanGo = path.resolve(Paths.Resource, 'trojan/trojan-go')

  static TrojanClientConfig = path.resolve(Paths.UserData, 'client.json')

  static TrojanApiProto = path.resolve(Paths.Resource, 'trojan/api.proto')

  static GwflistPac = path.resolve(Paths.Resource, 'gfwlist.pac')

  static IconTray = path.resolve(Paths.Static, 'tray/icon_16x16.png')

  static TrojanLogFile = path.resolve(Paths.Logs, 'trojan.log')
}

module.exports = Paths
