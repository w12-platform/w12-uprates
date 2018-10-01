import Web3 = require("web3");

export function fromBytes32toUtf8(value: string) {
    return Web3.utils.toUtf8(value);
}

export function fromUtf8toBytes32(value: string) {
    return Web3.utils.fromUtf8(value);
}
