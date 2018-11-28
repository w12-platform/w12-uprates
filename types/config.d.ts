export interface ConfigMarket {
    moduleName: string,
    host: string,
    token: string,
    enabled: boolean;
    requestTimeout: string,
    responseTimeout: string,
}

export interface Config {
    markets: ConfigMarket[];
    ethAccountPrivateKey: string;
    ethProvider: string;
    ethRatesAddress: string;
    ethRatesGuardAddress: string;
}

declare module 'config.js' {
    export default Config;
}
