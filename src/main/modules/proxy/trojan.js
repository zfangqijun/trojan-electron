/// <reference path="../../../common/types/trojan-config.d.ts" />

const { spawn } = require('child_process');
const fs = require('fs/promises')
const grpc = require('@grpc/grpc-js');
const { promisify } = require('util');

const TrojanGRPC = require('./trojan-grpc');
const template = require('./client-config-template.json');

const store = require('../store')
const notification = require('../../notification/notification')
const GlobalObserver = require('../../observer/observer');
const Elog = require('../../elog')('Trojan')
const Paths = require('../../paths');
const ports = require('../ports');
const { delay } = require('../../util');


class Trojan {
    /**
     * @type {import('child_process').ChildProcessWithoutNullStreams}
     */
    static goProcess = null;

    /**
     * @type {TrojanConfig}
     */
    static config = null;

    static traffic = {};

    /**
     * 
     * @param {TrojanConfig} config
     * @returns 
     */
    static start = async (config) => {
        if (Trojan.goProcess) return;

        Trojan.config = Trojan.overwriteConfig(config);

        await fs.writeFile(
            Paths.TrojanClientConfig,
            JSON.stringify(Trojan.config, null, '\t')
        );

        Trojan.goProcess = await Trojan.spawn()

        await Trojan.startApiClient();
        Elog.log('started')
    }

    /**
     * 
     * @returns 
     */
    static stop = async () => {
        if (Trojan.goProcess === null) return;
        return new Promise(resolve => {
            Trojan.goProcess.once('exit', () => {
                Elog.info('stoped')
                resolve()
            })
            Trojan.goProcess.kill('SIGINT');
        })
    }

    /**
     * 
     * @param {TrojanConfig} config
     */
    static restart = async (config = Trojan.config) => {
        Elog.info('restart')
        await Trojan.stop();
        await Trojan.start(config);
    }

    /**
     * 
     * @returns {TrojanConfig}
     */
    static getConfig = () => {
        return Trojan.config;
    }

    /**
     * 
     * @param {URL} url 
     * @returns {TrojanConfig}
     */
    static toConfigFromUrl(url) {
        if (typeof url === 'string') {
            url = new URL(url)
        }

        if (url.protocol !== 'trojan:' && url.protocol !== 'trojan-go:') {
            notification.show({ title: '导入代理配置', body: 'URL需以trojan或trojan-go开头' })
            throw Error('URL需以trojan或trojan-go开头');
        }

        if (url.username === '') {
            notification.show({ title: '导入代理配置', body: '密码不能为空' })
            throw Error('密码不能为空')
        }

        if (url.hostname === '') {
            notification.show({ title: '导入代理配置', body: 'host不能为空' })
            throw Error('host不能为空')
        }

        return Trojan.toConfigFromOptions({
            remote_addr: url.hostname,
            remote_port: parseInt(url.port),
            password: [url.username]
        })
    }

    /**
     * 
     * @param {TrojanConfig} options 
     * @returns 
     */
    static toConfigFromOptions = (options) => {
        const {
            remote_addr,
            remote_port,
            password,
            ssl,
            mux = {},
            websocket = {},
            shadowsocks = {}
        } = options;

        return R.mergeDeepRight(template, {
            remote_addr: remote_addr,
            remote_port: remote_port || 443,
            password: password,
            ssl: {
                sni: ssl && ssl.sni || remote_addr
            },
            mux,
            websocket,
            shadowsocks
        })
    }

    static overwriteConfig = (config) => {
        const router = store.getRouter();
        const mode = router.modes[0]

        return R.mergeDeepRight(config, {
            run_type: 'client',
            local_port: ports.getPort('proxy'),
            log_level: 2,
            log_file: Paths.TrojanLogFile,
            mux: {
                concurrency: 8,
                idle_timeout: 60 * 1000,
            },
            api: {
                enabled: true,
                api_addr: '127.0.0.1',
                api_port: ports.getPort('proxyApi')
            },
            router: {
                enabled: router.enabled,
                bypass: [
                    ...textToRules(mode.bypassText),
                ],
                proxy: [
                    ...textToRules(mode.proxyText),
                ],
                block: [
                    ...textToRules(mode.blockText),
                ],
                default_policy: mode.defaultPolicy,
                domain_strategy: mode.domainStrategy,
                geosite: mode.geosite,
                geoip: mode.geoip,
            }
        })
    }

    static startApiClient = async () => {
        if (Trojan.apiClientService) return;

        const port = ports.getPort('proxyApi');
        const TrojanClientService = await TrojanGRPC.getServiceClientConstructor()
        const service = new TrojanClientService(`127.0.0.1:${port}`, grpc.ChannelCredentials.createInsecure());
        await promisify(service.waitForReady).call(service, new Date().getTime() + 10 * 1000);
        Trojan.GetTraffic = promisify(service.GetTraffic).bind(service);
        Trojan.apiClientService = service;
    }

    /**
     * 
     * @returns 
     */
    static getTraffic = async () => {
        if (R.isNil(Trojan.GetTraffic)) {
            throw Error('api service is no ready')
        }

        return Trojan.GetTraffic({
            user: {
                password: Trojan.config.password[0]
            }
        })
    }

    /**
     * 
     * @returns {import('child_process').ChildProcessWithoutNullStreams}
     */
    static spawn = () => {
        // return new Promise((resolve, reject) => {
        const process = spawn(Paths.TrojanGo, [
            '-config',
            Paths.TrojanClientConfig,
        ]);

        process.once('spawn', () => {
            Elog.log(Paths.TrojanGo, Paths.TrojanClientConfig)
            // resolve(process)
        })

        process.once('error', (error) => {
            Elog.error(error)
            // reject(error)
        })

        process.on('exit', (code, signal) => {
            Trojan.goProcess = null;
            GlobalObserver.emit(GlobalObserver.Events.TrojanLog, {
                from: 'exit',
                data: 'trojan-go 进程退出'
            });
            Elog.info('trojan-go exited', code, signal);
        })

        const { stdout, stderr } = process;

        stdout.on('data', (data) => {
            const dataString = 'stdout: ' + data.toString();
            GlobalObserver.emit(GlobalObserver.Events.TrojanLog, {
                from: 'stdout',
                data: dataString
            });
            Elog.info(dataString);
        })

        stderr.on('data', (data) => {
            const dataString = 'stderr: ' + data.toString();
            GlobalObserver.emit(GlobalObserver.Events.TrojanLog, {
                from: 'stderr',
                data: dataString
            });
            Elog.warn(dataString)
        })
        return process

    }
}

function textToRules(text) {
    return R.pipe(
        R.split('\n'),
        R.map(R.trim),
        R.reject(R.isEmpty),
        R.reject(R.startsWith('#'))
    )(text)
}

module.exports = Trojan;

