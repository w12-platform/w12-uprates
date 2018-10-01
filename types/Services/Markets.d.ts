import {PriceResult} from "./MarketPriceFetcher";

export interface IMarkets {
    request(symbols: string | string[]): Promise<PriceResult | null>;
}
