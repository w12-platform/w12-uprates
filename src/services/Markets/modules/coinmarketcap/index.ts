import {BaseMarketPriceFetcher} from "../Base";
import {ConfigMarket} from "../../../../../types/config";
import {PriceResult} from "../../../../../types/Services/MarketPriceFetcher";
import {Logger} from "winston";

interface Response {
    data: {
        [id: string]: {
            name: string;
            symbol: string;
            quote: {
                [symbol: string]: {
                    price: number;
                }
            }
        }
    }
}

export class CoinmarkercapPriceFetcher extends BaseMarketPriceFetcher {
    constructor(config: Readonly<ConfigMarket>, logger: Logger) {
        super(config, logger);

        this.axios.defaults.headers['X-CMC_PRO_API_KEY'] = this.token;
    }

    async request(symbols: string | string[]): Promise<PriceResult | null> {
        const requestedSymbols = Array.isArray(symbols) ? symbols.join(',') : symbols;

        await this.waitBeforeRequest();

        try {
            this.logger.debug('[CoinmarkercapPriceFetcher] request for symbols: %s', requestedSymbols);

            const { data: result } = await this.axios.request({
                method: 'GET',
                url: '/v1/cryptocurrency/quotes/latest',
                params: {
                    symbol: requestedSymbols,
                    convert: 'USD'
                }
            });

            this.logger.debug(result);

            const price = this.convertResponse(result);

            return Object.keys(price).length ? price : null;
        } catch (e) {
            console.log(e);
            this.logger.debug('[CoinmarkercapPriceFetcher] error: \n\n %s', e.message);

            throw new Error('an error occurred while requesting rates');
        }
    }

    private convertResponse(data: Response): PriceResult {
        const result = {} as PriceResult;

        Object.values(data.data)
            .forEach(item => {
                if (item.quote && item.quote['USD']) {
                    result[item.symbol] = '' + item.quote['USD'].price;
                }
            });

        return result;
    }
}
