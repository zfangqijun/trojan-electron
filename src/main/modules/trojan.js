/* eslint-disable camelcase */
const BaseModule = require('../base-module')

const { spawn } = require('child_process')
const fs = require('fs/promises')
const { promisify } = require('util')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('@grpc/grpc-js')

const template = require('./proxy/client-config-template.json')

const Paths = require('../paths')

class Trojan extends BaseModule {
  name = 'Trojan'
  goProcess = null
  config = null

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

  initApiclientService = async () => {
    if (this.apiClientService) return

    const port = await this.invoke('Ports.getPort', 'proxyApi')
    const TrojanClientService = await getServiceClientConstructor()
    this.apiClientService = new TrojanClientService(`127.0.0.1:${port}`, grpc.ChannelCredentials.createInsecure())
    await promisify(this.apiClientService.waitForReady).call(this.apiClientService, new Date().getTime() + 10 * 1000)
  }

  enableTrafficNotify = async () => {
    if (this.getTrafficTimer) return

    await this.initApiclientService()

    const GetTraffic = promisify(this.apiClientService.GetTraffic).bind(this.apiClientService)

    this.getTrafficTimer = setInterval(async () => {
      const args = { user: { password: this.config.password[0] } }
      const traffic = await GetTraffic(args)

      this.invoke('RPCServer.notifyAllSides', 'Trojan.Traffic', traffic)
    }, 1000 * 2)
  }

  disableTrafficNotify = () => {
    clearInterval(this.getTrafficTimer)
    this.getTrafficTimer = null
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
      this.logError(error)
    })

    process.on('exit', (code, signal) => {
      this.goProcess = null
      this.log('trojan-go exited', code, signal)
      this.invoke('RPCServer.notifyAllSides', 'Trojan.Log', { from: 'exit', data: 'trojan-go exited' })
    })

    const { stdout, stderr } = process

    stdout.on('data', (data) => {
      data = data.toString()
      this.invoke('RPCServer.notifyAllSides', 'Trojan.Log', { from: 'stdout', data })
      this.log(data)
    })

    stderr.on('data', (data) => {
      data = data.toString()
      this.invoke('RPCServer.notifyAllSides', 'Trojan.Log', { from: 'stderr', data })
      this.logError(data)
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
      throw Error('URL需以trojan或trojan-go开头')
    }

    if (url.username === '') {
      throw Error('密码不能为空')
    }

    if (url.hostname === '') {
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
      log_file: null,
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
