import BigNumber from "bignumber.js";
import {TransactionReceipt} from "web3/types";

export type SymbolsList = string[];
export type Price = number | string | BigNumber;
export interface BulkSetPriceRequest {
    [symbol: string]: Price;
}

export interface IRates {
    getSymbols(): Promise<SymbolsList>;
    setPrice(symbol: string, price: Price): Promise<TransactionReceipt | false>;
    bulkSetPrice(request: BulkSetPriceRequest): Promise<(TransactionReceipt | false)[]>;
}
