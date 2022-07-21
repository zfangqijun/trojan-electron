/* eslint-disable camelcase */
const BaseModule = require('../base-module')

const { spawn } = require('child_process')
const fs = require('fs/promises')
const { promisify } = require('util')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('@grpc/grpc-js')

const template = require('./proxy/client-config-template.json')

const notification = require('../notification/notification')
const GlobalObserver = require('../observer/observer')
const Paths = require('../paths')

class Trojan extends BaseModule {
  name = 'Trojan'

  goProcess = null

  config = null

  traffic = {}

  init = async () => {
    await this.waitModuleReady('Store')
    await this.waitModuleReady('Ports')

    const currentNode = await this.invoke('Store.getCurrentNode')

    if (currentNode) {
      await this.start(currentNode.config)
    }
  }

  start = async (config) => {
    if (this.goProcess) return

    this.config = await this.overwriteConfig(config)

    await fs.writeFile(
      Paths.TrojanClientConfig,
      JSON.stringify(this.config, null, '\t')
    )

    this.goProcess = await this.spawn()

    await this.startApiClient()

    this.log('started')
  }

  stop = async () => {
    if (this.goProcess === null) return
    return new Promise(resolve => {
      this.goProcess.once('exit', () => {
        this.log('stoped')
        resolve()
      })
      this.goProcess.kill('SIGINT')
    })
  }

  restart = async (config = this.config) => {
    this.log('restart')
    await this.stop()
    await this.start(config)
  }

  startApiClient = async () => {
    if (this.apiClientService) return

    const port = await this.invoke('Ports.getPort', 'proxyApi')
    const TrojanClientService = await getServiceClientConstructor()
    const service = new TrojanClientService(`127.0.0.1:${port}`, grpc.ChannelCredentials.createInsecure())
    await promisify(service.waitForReady).call(service, new Date().getTime() + 10 * 1000)
    Trojan.GetTraffic = promisify(service.GetTraffic).bind(service)
    this.apiClientService = service
  }

  getTraffic = async () => {
    if (R.isNil(Trojan.GetTraffic)) {
      throw Error('api service is no ready')
    }

    return Trojan.GetTraffic({
      user: {
        password: Trojan.config.password[0]
      }
    })
  }

  spawn = () => {
    // return new Promise((resolve, reject) => {
    const process = spawn(Paths.TrojanGo, [
      '-config',
      Paths.TrojanClientConfig
    ])

    process.once('spawn', () => {
      this.log(Paths.TrojanGo, Paths.TrojanClientConfig)
    })

    process.once('error', (error) => {
      this.log.error(error)
    })

    process.on('exit', (code, signal) => {
      this.goProcess = null
      GlobalObserver.emit(GlobalObserver.Events.TrojanLog, {
        from: 'exit',
        data: 'trojan-go 进程退出'
      })
      this.log('trojan-go exited', code, signal)
    })

    const { stdout, stderr } = process

    stdout.on('data', (data) => {
      const dataString = 'stdout: ' + data.toString()
      GlobalObserver.emit(GlobalObserver.Events.TrojanLog, {
        from: 'stdout',
        data: dataString
      })
      this.log(dataString)
    })

    stderr.on('data', (data) => {
      const dataString = 'stderr: ' + data.toString()
      GlobalObserver.emit(GlobalObserver.Events.TrojanLog, {
        from: 'stderr',
        data: dataString
      })
      this.log.warn(dataString)
    })
    return process
  }

  getConfig = () => {
    return this.config
  }

  toConfigFromOptions = (options) => {
    const {
      remote_addr,
      remote_port,
      password,
      ssl,
      mux = {},
      websocket = {},
      shadowsocks = {}
    } = options

    return R.mergeDeepRight(template, {
      remote_addr,
      remote_port: remote_port || 443,
      password,
      ssl: {
        sni: (ssl && ssl.sni) || remote_addr
      },
      mux,
      websocket,
      shadowsocks
    })
  }

  toConfigFromUrl = (url) => {
    if (typeof url === 'string') {
      url = new URL(url)
    }

    if (url.protocol !== 'trojan:' && url.protocol !== 'trojan-go:') {
      notification.show({ title: '导入代理配置', body: 'URL需以trojan或trojan-go开头' })
      throw Error('URL需以trojan或trojan-go开头')
    }

    if (url.username === '') {
      notification.show({ title: '导入代理配置', body: '密码不能为空' })
      throw Error('密码不能为空')
    }

    if (url.hostname === '') {
      notification.show({ title: '导入代理配置', body: 'host不能为空' })
      throw Error('host不能为空')
    }

    return this.toConfigFromOptions({
      remote_addr: url.hostname,
      remote_port: parseInt(url.port),
      password: [url.username]
    })
  }

  overwriteConfig = async (config) => {
    const router = await this.invoke('Store.getRouter')

    const mode = router.modes[0]

    return R.mergeDeepRight(config, {
      run_type: 'client',
      local_port: await this.invoke('Ports.getPort', 'proxy'),
      log_level: 2,
      log_file: Paths.TrojanLogFile,
      mux: {
        concurrency: 8,
        idle_timeout: 60 * 1000
      },
      api: {
        enabled: true,
        api_addr: '127.0.0.1',
        api_port: await this.invoke('Ports.getPort', 'proxyApi')
      },
      router: {
        enabled: router.enabled,
        bypass: [
          ...textToRules(mode.bypassText)
        ],
        proxy: [
          ...textToRules(mode.proxyText)
        ],
        block: [
          ...textToRules(mode.blockText)
        ],
        default_policy: mode.defaultPolicy,
        domain_strategy: mode.domainStrategy,
        geosite: mode.geosite,
        geoip: mode.geoip
      }
    })
  }
}

function textToRules (text) {
  return R.pipe(
    R.split('\n'),
    R.map(R.trim),
    R.reject(R.isEmpty),
    R.reject(R.startsWith('#'))
  )(text)
}

const getServiceClientConstructor = (function () {
  /**
     * @type {import('@grpc/grpc-js').ServiceClientConstructor}
     */
  let TrojanClientService
  return async function () {
    if (TrojanClientService) return TrojanClientService
    const packageDefinition = await protoLoader.load(Paths.TrojanApiProto)
    const grpcObject = grpc.loadPackageDefinition(packageDefinition)

    TrojanClientService = grpcObject.trojan.api.TrojanClientService
    return TrojanClientService
  }
}())

module.exports = new Trojan()
