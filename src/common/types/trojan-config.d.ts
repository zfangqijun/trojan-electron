interface Api {
    enabled: boolean;
    api_addr: string;
    api_port: number;
}

interface Mux {
    enabled: boolean;
}

interface TrojanConfig {
    remote_addr: string;
    remote_port: number;
    password: string[];
    websocket: Websocket;
    ssl: Ssl;
    run_type: string;
    local_addr: string;
    local_port: number;
    shadowsocks: Shadowsocks;
    mux: Mux;
    api: Api;
    router: Router;
}

interface Router {
    enabled: boolean;
    bypass: string[];
    block: string[];
    proxy: string[];
    default_policy: 'bypass' | 'proxy' | 'block';
    domain_strategy: 'as_is' | 'ip_if_non_match' | 'ip_on_demand';
    geoip: string;
    geosite: string;
}

interface Shadowsocks {
    enabled: boolean;
    method: string;
    password: string;
}

interface Ssl {
    sni: string;
}

interface Websocket {
    host: string;
    enabled: boolean;
    path: string;
}

