import {IMarketPriceFetcher, PriceResult} from "../../../../types/Services/MarketPriceFetcher";
import {ConfigMarket} from "../../../../types/config";
import {Logger} from "winston";
import axios, {AxiosInstance} from "axios";

export class BaseMarketPriceFetcher implements IMarketPriceFetcher {
    readonly host: string;
    readonly token: string;
    readonly enabled: boolean;
    readonly requestTimeout: number;
    readonly responseTimeout: number;
    protected readonly logger: Logger;
    protected axios: AxiosInstance;

    protected constructor(config: Readonly<ConfigMarket>, logger: Logger) {
        this.host = config.host;
        this.token = config.token;
        this.enabled = !!config.enabled;
        this.requestTimeout = parseInt(config.requestTimeout || '0', 10);
        this.responseTimeout = parseInt(config.responseTimeout || '0', 10);

        this.logger = logger;
        this.axios = axios.create({
            baseURL: `https://${this.host}`,
            timeout: this.responseTimeout
        });
    }

    async request(symbols: string | string[]): Promise<PriceResult | null> {
        throw new Error('implement it');
    }

    protected async waitBeforeRequest(): Promise<any> {
        this.logger.debug('[IMarketPriceFetcher] wait before request %s ms', this.requestTimeout);

        return new Promise((rs, rj) => { setTimeout(rs, this.requestTimeout); });
    }
}
