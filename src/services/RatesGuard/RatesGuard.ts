import {Config} from "../../../types/config";
import Web3 = require("web3");
import {Account} from "web3/eth/accounts";
import Contract from "web3/eth/contract";
import {TransactionReceipt} from "web3/types";
import {Logger} from "winston";
import contract from './contract.json';
import {BulkSetPriceRequest, IRatesGuard, Price} from "../../../types/Services/RatesGuard";
import {fromUtf8toBytes32} from "../../utils";
import BigNumber from "bignumber.js";

export class RatesGuard implements IRatesGuard {
    private readonly web3: Web3;
    private readonly logger: Logger;
    private readonly accountAddress: string;
    private readonly ratesGuardAddress: string;
    private readonly contract: Contract;

    constructor(config: Readonly<Config>, web3: Web3, logger: Logger) {
        this.web3 = web3;
        this.logger = logger;
        this.accountAddress = ((this.web3.eth.accounts.wallet as any)[0] as Account).address;
        this.ratesGuardAddress = config.ethRatesGuardAddress;
        this.contract = new web3.eth.Contract(contract.abi, this.ratesGuardAddress);

        logger.debug(`[RatesGuard] initialized RatesGuard contract address ${this.ratesGuardAddress}`);
        logger.debug(`[RatesGuard] initialized account address ${this.accountAddress}`);
    }

    async bulkSetPrice(request: BulkSetPriceRequest): Promise<TransactionReceipt | false> {
        request = Object.assign({}, request);

        const symbols = Object.keys(request);

        if (symbols.length === 0) {
            this.logger.info(
                '[RatesGuard] no rates for update'
            );
            return false;
        }

        const rates = symbols.map(symbol => request[symbol].toString());

        for(const symbol of symbols) {
            request[symbol] = this.normalizePrice(request[symbol]);
        }

        const gas = await this.contract.methods
            .suggest(symbols.map(fromUtf8toBytes32), rates)
            .estimateGas({from: this.accountAddress});
        const receipt = await this.contract.methods
            .suggest(symbols.map(fromUtf8toBytes32), rates)
            .send({from: this.accountAddress, gas: gas});

        for(const symbol of symbols) {
            this.logger.info(
                '[RatesGuard] success set new price %s for symbol %s',
                request[symbol].toString(), symbol
            );
        }

        return receipt;
    }

    private normalizePrice(price: Price): BigNumber {
        const _price = new BigNumber(price);

        return (new BigNumber(_price.toFixed(8))).multipliedBy(10 ** 8);
    }
}
