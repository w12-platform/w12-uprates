import {Config} from "../../../types/config";
import Web3 = require("web3");
import {Account} from "web3/eth/accounts";
import Contract from "web3/eth/contract";
import {TransactionReceipt} from "web3/types";
import {Logger} from "winston";
import contract from './contract.json';
import {BulkSetPriceRequest, IRates, Price, SymbolsList} from "../../../types/Services/Rates";
import {fromBytes32toUtf8, fromUtf8toBytes32} from "../../utils";
import BigNumber from "bignumber.js";

export class Rates implements IRates {
    private readonly web3: Web3;
    private readonly logger: Logger;
    private readonly accountAddress: string;
    private readonly ratesAddress: string;
    private readonly contract: Contract;

    constructor(config: Readonly<Config>, web3: Web3, logger: Logger) {
        this.web3 = web3;
        this.logger = logger;
        this.accountAddress = ((this.web3.eth.accounts.wallet as any)[0] as Account).address;
        this.ratesAddress = config.ethRatesAddress;
        this.contract = new web3.eth.Contract(contract.abi, this.ratesAddress);

        logger.debug(`[Rates] initialized Rates contract address ${this.ratesAddress}`);
        logger.debug(`[Rates] initialized account address ${this.accountAddress}`);
    }

    async getSymbols(): Promise<SymbolsList> {
        const result = await this.contract.methods
            .getSymbolsList()
            .call({ from: this.accountAddress });

        return result.map(fromBytes32toUtf8);
    }

    async setPrice(symbol: string, price: Price): Promise<TransactionReceipt | false> {
        price = this.normalizePrice(price);

        const currentPrice = await this.contract.methods
            .get(fromUtf8toBytes32(symbol)).call({ from: this.accountAddress });

        this.logger.info(
            '[Rates] symbol %s, prev. price %s, new price %s',
            symbol, currentPrice, price.toString()
        );

        if (price.eq(currentPrice)) return false;

        const gas = await this.contract.methods
            .set(fromUtf8toBytes32(symbol), price.toString())
            .estimateGas({ from: this.accountAddress });
        const receipt = await this.contract.methods
            .set(fromUtf8toBytes32(symbol), price.toString())
            .send({from: this.accountAddress, gas: gas});

        this.logger.info(
            '[Rates] success set new price %s for symbol %s',
            price.toString(), symbol
        );

        return receipt;
    }

    async bulkSetPrice(request: BulkSetPriceRequest): Promise<(TransactionReceipt | false)[]> {
        const requests = Object.entries(request);
        const results = [];

        for (const [symbol, price] of requests) {
            results.push(await this.setPrice(symbol, price));
        }

        return results as (TransactionReceipt | false)[];
    }

    private normalizePrice(price: Price): BigNumber {
        const _price = new BigNumber(price);

        return (new BigNumber(_price.toFixed(8))).multipliedBy(10 ** 8);
    }
}
