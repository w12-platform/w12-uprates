import {CoinmarkercapPriceFetcher} from "./modules/coinmarketcap";
import {IMarketPriceFetcher, PriceResult} from "../../../types/Services/MarketPriceFetcher";
import {ConfigMarket} from "../../../types/config";
import {Logger} from "winston";

export class Markets {
    private readonly logger: Logger;
    private markets: IMarketPriceFetcher[] = [];

    constructor(configsOfMarkets: Readonly<ConfigMarket>[], logger: Logger) {
        this.logger = logger;

        for (const marketConfig of configsOfMarkets) {
            switch (marketConfig.moduleName) {
                case 'coinmarketcap':
                    this.markets.push(new CoinmarkercapPriceFetcher(marketConfig, this.logger));
                    break;
            }
        }
    }

    async request(symbols: string | string[]): Promise<PriceResult | null> {
        const prices = await this.getAllPrices(symbols);
        const result = this.adjustPrices(prices);

        return result;
    }

    private async getAllPrices(symbols: string | string[]): Promise<PriceResult[]> {
        const markets = this.getEnabledMarkets();

        if (markets.length) {
            const results = await Promise.all(markets.map(m => m.request(symbols)));

            return results
                .filter(Boolean) as PriceResult[];
        }

        return [];
    }

    private adjustPrices(prices: PriceResult[]): PriceResult | null {
        const div = {} as { [symbol: string]: number; };
        const result = prices.reduce((result, item) => {
            Object.entries(item)
                .forEach(([symbol, price]) => {
                    if (result[symbol] == null) {
                        result[symbol] = parseFloat(price);
                        div[symbol] = 1;
                    } else {
                        (result[symbol] as number) += parseFloat(price);
                        div[symbol] += 1;
                    }
                });

            return result;
        }, {} as { [symbol: string]: number | string; });

        Object.keys(result)
            .forEach(key => {
                result[key] = String((result[key] as number) / div[key]);
            });

        return Object.keys(result).length ? result as PriceResult : null;
    }

    private getEnabledMarkets(): IMarketPriceFetcher[] {
        return this.markets
            .filter(m => m.enabled);
    }
}
