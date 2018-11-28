import BigNumber from 'bignumber.js';
import {expect} from 'chai';
import Web3 from 'web3';
import { fromBytes32toUtf8 } from '../../build/utils/index';
import logger from '../mocks/logger';
import {Rates} from "../../build/services/Rates/Rates";
import contractJson from '../../build/services/Rates/contract';

const abi = contractJson.abi;
const account = '0x0360d0068f30f8952eccde246ab2a96fac889ffd';
const contract = '0x0160d0068f30f8952eccde246ab2a96fac889ffd';
const symbol1 = Web3.utils.fromUtf8('a');
const symbol2 = Web3.utils.fromUtf8('b');
const config = {
    ethRatesAddress: contract
};
const web3 = {
    contractConstructorHook: () => {},
    setPriceEstimateGasHook: () => {},
    setPriceSendHook: () => {},
    setPriceHook: () => {},
    prices: {},
    eth: {
        accounts: {
            wallet: {
                0: { address: account }
            }
        },
        Contract: function(abi, address) {
            web3.contractConstructorHook(abi, address);
            this.methods = {
                getSymbolsList() {
                    return {
                        call() {
                            return Promise.resolve([symbol1, symbol2])
                        }
                    }
                },
                set(symbol, price) {
                    web3.setPriceHook(symbol, price);
                    return {
                        estimateGas(args) {
                            web3.setPriceEstimateGasHook(args);
                            return Promise.resolve(10);
                        },
                        send(args) {
                            web3.setPriceSendHook(args);
                            return Promise.resolve(true);
                        }
                    }
                },
                get(symbol) {
                    return {
                        call(args) {
                            return Promise.resolve(web3.prices[fromBytes32toUtf8(symbol)] || '0');
                        }
                    }
                }
            };
        }
    }
};

describe('[service] Rates', async () => {
    const ctx = {};

    beforeEach(async () => {
        web3.contractConstructorHook = (abi, address) => {
            ctx.ContractCreationArgs = {
                abi,
                address
            };
        }
        ctx.Rates = new Rates(config, web3, logger);
    });

    describe('creation', async () => {
        it('should create contract', async () => {
            expect(ctx.ContractCreationArgs.abi).to.be.eq(abi);
            expect(ctx.ContractCreationArgs.address).to.be.eq(contract);
        });
    });

    describe('get symbols', async () => {
        beforeEach(async () => {
            ctx.getSymbolsResult = ctx.Rates.getSymbols();
        });

        it('should return symbols', async () => {
            const actual = await ctx.getSymbolsResult;
            const expected = [Web3.utils.toUtf8(symbol1), Web3.utils.toUtf8(symbol2)];

            expect(actual).to.be.a('array');
            expect(actual).to.deep.eq(expected);
        });
    });

    describe('set price', async () => {
        beforeEach(async () => {
            web3.setPriceHook = (symbol, price) => { ctx.setPriceHookCallArgs = {symbol, price};  };
            web3.setPriceEstimateGasHook = (args) => { ctx.setPriceEstimateCallArgs = args; };
            web3.setPriceSendHook = (args) => { ctx.setPriceSendCallArgs = args; };

            ctx.setPriceResult = ctx.Rates.setPrice(Web3.utils.toUtf8(symbol1), 10);
            web3.prices[symbol1] = '0';
        });

        it('should call contract method', async () => {
            await ctx.setPriceResult;

            const actual = ctx.setPriceHookCallArgs;

            expect(actual).to.be.a('object');
            expect(actual.symbol).to.be.eq(symbol1);
            expect(actual.price).to.be.eq('1000000000');
        });

        it('should call estimate gas', async () => {
            await ctx.setPriceResult;

            const actual = ctx.setPriceEstimateCallArgs;

            expect(actual).to.be.a('object');
            expect(actual.from).to.be.eq(account);
        });

        it('should call send', async () => {
            await ctx.setPriceResult;

            const actual = ctx.setPriceSendCallArgs;

            expect(actual).to.be.a('object');
            expect(actual.from).to.be.eq(account);
        });

        it('should return call result', async () => {
            const actual = await ctx.setPriceResult;

            expect(actual).to.be.eq(true);
        });
    });
});
