export interface PriceResult {
    [symbol: string]: string;
}

export interface IMarketPriceFetcher {
    enabled: boolean;

    request(symbols: string | string[]): Promise<PriceResult | null>;
}
