/// <reference path="../../common/types/electron-store.d.ts"/>

const R = require('ramda');
const util = require('util');

const Elog = require('../elog')('Network Setup')
const { getPort } = require('../../ports');
const store = require('../store')
const ports = require('../../ports')

const execAsync = util.promisify(require('child_process').exec);

async function exec(cmd) {
    try {
        Elog.info(cmd);
        return await execAsync(cmd);
    } catch (error) {
        Elog.error(cmd, error);
        throw error
    }
}

const bypassDomains = [
    '127.0.0.1',
    '192.168.0.0/16',
    '10.0.0.0/8',
    '172.16.0.0/12',
    'localhost'
]

/**
 * 开启系统代理
 */
async function enableSystemProxys(options) {
    const { web, secureWeb, socks } = options;

    if (web.enable) {
        await enableSystemProxy('web')
    }

    if (secureWeb.enable) {
        await enableSystemProxy('secureWeb')
    }

    if (socks.enable) {
        await enableSystemProxy('socks')
    }
}

/**
 * 关闭系统代理
 */
async function disableSystemProxys(options) {
    const { web, secureWeb, socks } = options;

    if (web.enable) {
        await enableSystemProxy('web', false)
    }

    if (secureWeb.enable) {
        await enableSystemProxy('secureWeb', false)
    }

    if (socks.enable) {
        await enableSystemProxy('socks', false)
    }
}


/**
 * 
 * @param {SystemProxyName} option 
 * @param {boolean} enable 
 * @returns 
 */
async function enableSystemProxy(option, enable = true) {
    if (R.isNil(option)) return;

    const services = await getNetworkServiceNames();

    const servicesWithDomain = services.map(
        service => ({ service, domain: '127.0.0.1', port: ports.getPort('proxy'), state: enable ? 'on' : 'off' })
    );

    switch (option) {
        case 'pac':
            await Promise.all(servicesWithDomain.map(setAutoProxy))
            break;
        case 'web':
            await Promise.all(servicesWithDomain.map(setWebProxy))
            break;
        case 'secureWeb':
            await Promise.all(servicesWithDomain.map(setSecureWebProxy))
            break;
        case 'socks':
            await Promise.all(servicesWithDomain.map(setSocksFirewallProxy))
            break;
    }
}


/**
 * 设置Web代理
 * @param {*} options 
 * @returns 
 */
function setWebProxy(options) {
    const service = R.prop('service', options);
    const domain = R.propOr('', 'domain', options);
    const port = R.propOr('', 'port', options);
    const state = R.propOr('on', 'state', options);

    const cmd = state === 'on' ?
        `networksetup -setwebproxy '${service}' ${domain} ${port}` :
        `networksetup -setwebproxystate '${service}' ${state}`

    return exec(cmd)
}


/**
 * 设置安全Web代理
 * @param {*} options 
 * @returns 
 */
function setSecureWebProxy(options) {
    const service = R.prop('service', options);
    const domain = R.propOr('', 'domain', options);
    const port = R.propOr('', 'port', options);
    const state = R.propOr('on', 'state', options);

    const cmd = state === 'on' ?
        `networksetup -setsecurewebproxy '${service}' ${domain} ${port}` :
        `networksetup -setsecurewebproxystate '${service}' ${state}`

    return exec(cmd)
}


/**
 * 设置Socks代理
 * @param {*} options 
 * @returns 
 */
function setSocksFirewallProxy(options) {
    const service = R.prop('service', options);
    const domain = R.propOr('', 'domain', options);
    const port = R.propOr('', 'port', options);
    const state = R.propOr('on', 'state', options);

    const cmd = state === 'on' ?
        `networksetup -setsocksfirewallproxy '${service}' ${domain} ${port}` :
        `networksetup -setsocksfirewallproxystate '${service}' ${state}`

    return exec(cmd)
}




/**
 * 设置PAC自动代理
 * @param {*} options 
 * @returns 
 */
async function setAutoProxy(options) {
    const service = R.prop('service', options);
    const url = `http://127.0.0.1:${getPort('http')}/gfwlist.pac`;
    const state = R.propOr('on', 'state', options);

    const cmd = state === 'on' ?
        `networksetup -setautoproxyurl '${service}' ${url}` :
        `networksetup -setautoproxystate '${service}' ${state}`

    return exec(cmd)
}


/**
 * 设置跳过的域名列表
 * @param {*} options 
 * @returns 
 */
function setProxyBypassDomains(options) {
    const service = R.prop('service', options);
    const domains = R.prop('domains', options);

    const domainsline = domains.length === 0 ? `''` : domains.join(' ');

    const cmd = `networksetup -setproxybypassdomains '${service}' ${domainsline}`

    return exec(cmd)
}


/**
 * 获取跳过的域名列表
 * @param {string} serviceName 网络服务名 如：Wi-Fi
 * @returns {Promise<string[]>}
 */
function getProxyBypassDomainsByService(serviceName) {
    const cmd = `networksetup -getproxybypassdomains "${serviceName}"`

    return exec(cmd)
        .then(R.prop('stdout'))
        .then(R.when(R.includes(`There aren't any bypass domains set on`), () => ''))
        .then(R.split('\n'))
        .then(R.reject(R.isEmpty))
}


/**
 * @type {string[]}
 */
let cacheServiceNames;
/**
 * 获取Hardware Port为en开头的网络服务名称列表
 * @param {*} options 
 * @returns {Promise<string[]>}
 */
async function getNetworkServiceNames() {
    if (cacheServiceNames) return cacheServiceNames;

    const cmd = `networksetup -listnetworkserviceorder`;

    return exec(cmd)
        .then(R.prop('stdout'))
        .then(R.match(/Hardware Port: [\S ]+, Device: en/g))
        // 没有匹配到en开头的Hardware Port
        .then(R.when(R.isNil, () => []))
        .then(R.map(R.replace(/Hardware Port: |, Device: en/g, '')))
        .then((names) => cacheServiceNames = names)
}


/**
 * 
 * @param {string} service 
 * @returns {Promise<{enable:boolean, host:string, port:string}>}
 */
function getWebProxy(service) {
    return _getProxy('webproxy', service)
}


/**
 * 
 * @param {string} service 
 * @returns {Promise<{enable:boolean, host:string, port:string}>}
 */
function getSecureWebProxy(service) {
    return _getProxy('securewebproxy', service)
}


/**
 * 
 * @param {string} service 
 * @returns {Promise<{enable:boolean, host:string, port:string}>}
 */
function getSocksFirewallProxy(service) {
    return _getProxy('socksfirewallproxy', service)
}


/**
 * 
 * @param {string} string 
 * @returns {Record<string, string>}
 */
function keyValueParse(string) {
    return R.pipe(
        R.split('\n'),
        R.reject(R.isEmpty),
        R.map(R.split(': ')),
        R.reduce((prev, [key, value]) => R.assoc(key, value, prev), {})
    )(string)
}


/**
 * 
 * @param {'webproxy' | 'securewebproxy' | 'socksfirewallproxy'} name 
 * @param {string} service 
 * @returns 
 */
function _getProxy(name, service) {
    const cmd = `networksetup -get${name} '${service}'`

    // Enabled: Yes
    // Server: 127.0.0.1
    // Port: 2188
    // Authenticated Proxy Enabled: 0
    return exec(cmd)
        .then(R.prop('stdout'))
        .then(keyValueParse)
        .then(({ Enabled, Server, Port }) => {
            const enable = Enabled === 'Yes' ? 'on' : 'off'
            const host = Server;
            const port = Port === '0' ? '' : Port;
            return { enable, host, port }
        })
}

module.exports = {
    enableSystemProxys,
    enableSystemProxy,
    disableSystemProxys,
    getNetworkServiceNames,
    getProxyBypassDomainsByService,
    getWebProxy,
    getSecureWebProxy,
    getSocksFirewallProxy
}