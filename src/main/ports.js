const R = require('ramda');
const { getPortPromise } = require('portfinder');

/**
 * @typedef {{ proxy: number, proxyApi: number, http:number }} Ports
 * @type {Ports}
 */
let ports;

const defaults = {
    proxy: 2188,
    http: 3188
}

async function find() {
    const proxy = await getPortPromise({
        port: defaults.proxy,
        stopPort: defaults.proxy + 10,
    });

    const proxyApi = await getPortPromise({
        port: proxy + 1,
        stopPort: proxy + 10,
    });

    const http = await getPortPromise({
        port: defaults.http,
        stopPort: defaults.http + 10,
    });

    ports = {
        proxy,
        proxyApi,
        http,
    }
}

/**
 * 
 * @param {keyof Ports} name 
 * @returns 
 */
function getPort(name) {
    if (R.has(name, ports)) {
        return ports[name]
    } else {
        throw new Error();
    }
}

module.exports = {
    find,
    getPort
}