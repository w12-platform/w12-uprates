export function generate(account) {
    const web3 = {
        contractConstructorHook: () => {},
        suggestEstimateGasHook: () => {},
        suggesteSendHook: () => {},
        suggestHook: () => {},
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
                    suggest(symbols, rates) {
                        web3.suggestHook(symbols, rates);
                        return {
                            estimateGas(args) {
                                web3.suggestEstimateGasHook(args);
                                return Promise.resolve(10);
                            },
                            send(args) {
                                web3.suggesteSendHook(args);
                                return Promise.resolve(true);
                            }
                        }
                    }
                };
            }
        }
    };

    return web3;
}
