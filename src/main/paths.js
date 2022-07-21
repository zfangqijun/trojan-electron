const { app } = require('electron')
const path = require('path')

const App = app.getAppPath()

const Logs = app.getPath('logs')

const UserData = app.getPath('userData')

const Downloads = app.getPath('downloads')

const Resource = path.resolve(App, 'resource')

const Static = path.resolve(Resource, 'static')

const TrojanGo = path.resolve(Resource, 'trojan/trojan-go')

const TrojanClientConfig = path.resolve(UserData, 'client.json')

const TrojanApiProto = path.resolve(Resource, 'trojan/api.proto')

const GwflistPac = path.resolve(Resource, 'gfwlist.pac')

const IconTray = path.resolve(Static, 'tray/icon_16x16.png')

const TrojanLogFile = path.resolve(Logs, 'trojan.log')

module.exports = {
  App,
  Downloads,

  Resource,
  Static,
  TrojanGo,
  TrojanClientConfig,
  TrojanApiProto,
  GwflistPac,

  IconTray,

  TrojanLogFile
}
