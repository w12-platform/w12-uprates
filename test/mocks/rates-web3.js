import { fromBytes32toUtf8 } from '../../build/utils/index';

export function generate(account, symbol1, symbol2) {
    const web3 = {
        contractConstructorHook: () => {},
        setPriceEstimateGasHook: () => {},
        setPriceSendHook: () => {},
        setPriceHook: () => {},
        prices: {},
        eth: {
            accounts: {
                wallet: {
                    0: {address: account}
                }
            },
            Contract: function (abi, address) {
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

    return web3;
}
