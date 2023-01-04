type DefineTuple<T> = [() => T, (value: T) => void];

type ProxyNode = {
    uuid: string;
    type: 'trojan';
    name: string;
    config: TrojanConfig;
};

type SystemProxyOption = {
    enable: boolean;
}

type SystemProxyName = 'web' | 'secureWeb' | 'socks' | 'pac'

type SystemProxy = {
    enable: boolean;
    web: SystemProxyOption;
    secureWeb: SystemProxyOption;
    socks: SystemProxyOption;
    pac: SystemProxyOption;
}

type RouterMode = {
    name: 'default' | string;
    label: string;
    bypassText: string;
    proxyText: string;
    blockText: string;
    defaultPolicy: string;
    domainStrategy: string;
    geoip: string;
    geosite: string;
}


type ElectronStoreState = {
    systemProxy: {
        enable: boolean,
        web: { enable: boolean },
        secureWeb: { enable: boolean },
        socks: { enable: boolean },
        pac: { enable: boolean }
    },
    proxyNode: {
        current: null | string;
        list: ProxyNode[];
    },
    settings: {
        router: {
            enabled: boolean,
            modes: Array<RouterMode>
        }
    }
}