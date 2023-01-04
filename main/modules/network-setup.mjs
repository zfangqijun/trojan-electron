import util from 'util'
import childProcess from 'child_process'
import BaseModule from '../base-module.mjs'

const exec = util.promisify(childProcess.exec)

class NetworkSetup extends BaseModule {
  name = 'NetworkSetup'

  /**
     * @type {string[]}
     */
  cacheServiceNames = []

  init = async () => {
    const systemProxy = await this.invoke('Store.getSystemProxy')

    if (systemProxy.enable) {
      await this.enableSystemProxys(systemProxy)
    } else {
      await this.disableSystemProxys(systemProxy)
    }
  }

  /**
     * 开启系统代理
     */
  enableSystemProxys = async (options) => {
    const { web, secureWeb, socks } = options

    if (web.enable) {
      await this.enableSystemProxy('web')
    }

    if (secureWeb.enable) {
      await this.enableSystemProxy('secureWeb')
    }

    if (socks.enable) {
      await this.enableSystemProxy('socks')
    }
  }

  disableSystemProxys = async (options) => {
    const { web, secureWeb, socks } = options

    if (web.enable) {
      await this.enableSystemProxy('web', false)
    }

    if (secureWeb.enable) {
      await this.enableSystemProxy('secureWeb', false)
    }

    if (socks.enable) {
      await this.enableSystemProxy('socks', false)
    }
  }

  /**
     *
     * @param {SystemProxyName} option
     * @param {boolean} enable
     * @returns
     */
  enableSystemProxy = async (option, enable = true) => {
    if (R.isNil(option)) return

    const services = await this.getNetworkServiceNames()

    const port = await this.invoke('Ports.getPort', 'proxy')

    const servicesWithDomain = services.map(
      service => ({ service, domain: '127.0.0.1', port, state: enable ? 'on' : 'off' })
    )

    switch (option) {
      case 'pac':
        await Promise.all(servicesWithDomain.map(this.setAutoProxy))
        break
      case 'web':
        await Promise.all(servicesWithDomain.map(this.setWebProxy))
        break
      case 'secureWeb':
        await Promise.all(servicesWithDomain.map(this.setSecureWebProxy))
        break
      case 'socks':
        await Promise.all(servicesWithDomain.map(this.setSocksFirewallProxy))
        break
    }
  }

  /**
     * 设置PAC自动代理
     * @param {*} options
     * @returns
     */
  setAutoProxy = async (options) => {
    const service = R.prop('service', options)
    const url = `http://127.0.0.1:${await this.invoke('Ports.getPort', 'http')}/gfwlist.pac`
    const state = R.propOr('on', 'state', options)

    const cmd = state === 'on'
      ? `networksetup -setautoproxyurl '${service}' ${url}`
      : `networksetup -setautoproxystate '${service}' ${state}`

    return this.exec(cmd)
  }

  /**
     * 设置Web代理
     * @param {*} options
     * @returns
     */
  setWebProxy = async (options) => {
    const service = R.prop('service', options)
    const domain = R.propOr('', 'domain', options)
    const port = R.propOr('', 'port', options)
    const state = R.propOr('on', 'state', options)

    const cmd = state === 'on'
      ? `networksetup -setwebproxy '${service}' ${domain} ${port}`
      : `networksetup -setwebproxystate '${service}' ${state}`

    return this.exec(cmd)
  }

  /**
     * 设置安全Web代理
     * @param {*} options
     * @returns
     */
  setSecureWebProxy = async (options) => {
    const service = R.prop('service', options)
    const domain = R.propOr('', 'domain', options)
    const port = R.propOr('', 'port', options)
    const state = R.propOr('on', 'state', options)

    const cmd = state === 'on'
      ? `networksetup -setsecurewebproxy '${service}' ${domain} ${port}`
      : `networksetup -setsecurewebproxystate '${service}' ${state}`

    return this.exec(cmd)
  }

  /**
     * 设置Socks代理
     * @param {*} options
     * @returns
     */
  setSocksFirewallProxy = async (options) => {
    const service = R.prop('service', options)
    const domain = R.propOr('', 'domain', options)
    const port = R.propOr('', 'port', options)
    const state = R.propOr('on', 'state', options)

    const cmd = state === 'on'
      ? `networksetup -setsocksfirewallproxy '${service}' ${domain} ${port}`
      : `networksetup -setsocksfirewallproxystate '${service}' ${state}`

    return this.exec(cmd)
  }

  /**
     * 设置跳过的域名列表
     * @param {*} options
     * @returns
     */
  setProxyBypassDomains = async (options) => {
    const service = R.prop('service', options)
    const domains = R.prop('domains', options)

    const domainsline = domains.length === 0 ? '\'\'' : domains.join(' ')

    const cmd = `networksetup -setproxybypassdomains '${service}' ${domainsline}`

    return this.exec(cmd)
  }

  /**
     * 获取跳过的域名列表
     * @param {string} serviceName 网络服务名 如：Wi-Fi
     * @returns {Promise<string[]>}
     */
  getProxyBypassDomainsByService = async (serviceName) => {
    const cmd = `networksetup -getproxybypassdomains "${serviceName}"`

    return this.exec(cmd)
      .then(R.prop('stdout'))
      .then(R.when(R.includes('There aren\'t any bypass domains set on'), () => ''))
      .then(R.split('\n'))
      .then(R.reject(R.isEmpty))
  }

  /**
     *
     * @param {string} service
     * @returns {Promise<{enable:boolean, host:string, port:string}>}
     */
  getWebProxy = async (service) => {
    return this.getProxy('webproxy', service)
  }

  /**
     *
     * @param {string} service
     * @returns {Promise<{enable:boolean, host:string, port:string}>}
     */
  getSecureWebProxy = async (service) => {
    return this.getProxy('securewebproxy', service)
  }

  /**
     *
     * @param {string} service
     * @returns {Promise<{enable:boolean, host:string, port:string}>}
     */
  getSocksFirewallProxy = async (service) => {
    return this.getProxy('socksfirewallproxy', service)
  }

  /**
     * 获取Hardware Port为en开头的网络服务名称列表
     */
  getNetworkServiceNames = async () => {
    if (this.cacheServiceNames.length > 0) return this.cacheServiceNames

    const cmd = 'networksetup -listnetworkserviceorder'

    return this.exec(cmd)
      .then(R.prop('stdout'))
      .then(R.match(/Hardware Port: [\S ]+, Device: en/g))
      // 没有匹配到en开头的Hardware Port
      .then(R.when(R.isNil, () => []))
      .then(R.map(R.replace(/Hardware Port: |, Device: en/g, '')))
      .then((names) => {
        this.cacheServiceNames = names
        return names
      })
  }

  /**
     *
     * @param {'webproxy' | 'securewebproxy' | 'socksfirewallproxy'} name
     * @param {string} service
     * @returns
     */
  getProxy = async (name, service) => {
    const cmd = `networksetup -get${name} '${service}'`

    // Enabled: Yes
    // Server: 127.0.0.1
    // Port: 2188
    // Authenticated Proxy Enabled: 0
    return this.exec(cmd)
      .then(R.prop('stdout'))
      .then(R.pipe(
        R.split('\n'),
        R.reject(R.isEmpty),
        R.map(R.split(': ')),
        R.reduce((prev, [key, value]) => R.assoc(key, value, prev), {})
      ))
      .then(({ Enabled, Server, Port }) => {
        const enable = Enabled === 'Yes' ? 'on' : 'off'
        const host = Server
        const port = Port === '0' ? '' : Port
        return { enable, host, port }
      })
  }

  exec = async (cmd) => {
    try {
      return await exec(cmd)
    } catch (error) {
      this.logError(cmd, error)
      throw error
    }
  }
}

export default new NetworkSetup()
