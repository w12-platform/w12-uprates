import BigNumber from 'bignumber.js';
import {expect} from 'chai';
import Web3 from 'web3';
import { fromBytes32toUtf8 } from '../../build/utils/index';
import logger from '../mocks/logger';
import {Rates} from "../../build/services/Rates/Rates";
import contractJson from '../../build/services/Rates/contract';
import {generate} from '../mocks/rates-web3';


const abi = contractJson.abi;
const account = '0x0360d0068f30f8952eccde246ab2a96fac889ffd';
const contract = '0x0160d0068f30f8952eccde246ab2a96fac889ffd';
const symbol1 = Web3.utils.fromUtf8('a');
const symbol2 = Web3.utils.fromUtf8('b');
const config = {
    ethRatesAddress: contract
};
const web3 = generate(account, symbol1, symbol2);


describe('Rates', async () => {
    const ctx = {};

    before( () => {
        web3.contractConstructorHook = (abi, address) => {
            ctx.ContractCreationArgs = {
                abi,
                address
            };
        }
        ctx.Target = new Rates(config, web3, logger);
    });
    afterEach(() => {
        web3.setPriceHook = web3.setPriceEstimateGasHook = web3.setPriceSendHook = () => {};
    });

    it('should create',  () => {
        expect(ctx.ContractCreationArgs.abi).to.be.eq(abi);
        expect(ctx.ContractCreationArgs.address).to.be.eq(contract);
    });

    describe('get symbols', () => {
        it('should return symbols', async () => {
            const actual = await ctx.Target.getSymbols();
            const expected = [Web3.utils.toUtf8(symbol1), Web3.utils.toUtf8(symbol2)];

            expect(actual).to.deep.eq(expected);
        });
    });

    describe('set price', async () => {
        const symbol = '1';
        const symbolBytes32 = Web3.utils.fromUtf8(symbol);

        it('should call with normalized price', async () => {
            web3.setPriceHook = (symbol, price) => {
                expect(price).to.eq('112345679');
            }

            await ctx.Target.setPrice(symbol, 1.12345678901);
        });

        it('should call with expected symbol', async () => {
            web3.setPriceHook = (symbol, price) => {
                expect(symbol).to.eq(symbolBytes32);
            }

            await ctx.Target.setPrice(symbol, 1);
        });

        it('should return false if price the same as existing', async () => {
            web3.prices[symbol] = '1000000000';
            const actual = await ctx.Target.setPrice(symbol, '10');
            expect(actual).to.be.false;
        });

        it('should call with no empty `gas` property', async () => {
            web3.setPriceSendHook = ({gas}) => {
                expect(parseInt(gas)).to.gt(0);
            }

            await ctx.Target.setPrice(symbol, '10');
        });

        it('should call with `from` that equal to account address', async () => {
            web3.setPriceSendHook = ({from}) => {
                expect(from).to.eq(account);
            }

            await ctx.Target.setPrice(symbol, '10');
        });

        it('should return receipt', async () => {
            const receipt = await ctx.Target.setPrice(symbol, 1);
            expect(receipt).to.be.true;
        });
    });
});
