import BigNumber from "bignumber.js";
import {TransactionReceipt} from "web3/types";

export type Price = number | string | BigNumber;
export interface BulkSetPriceRequest {
    [symbol: string]: Price;
}

export interface IRatesGuard {
    bulkSetPrice(request: BulkSetPriceRequest): Promise<TransactionReceipt | false>;
}
