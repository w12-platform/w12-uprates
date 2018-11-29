import {expect} from 'chai';
import { RatesGuard } from '../../build/services/RatesGuard/RatesGuard';
import {generate} from '../mocks/rates-guard-web3';
import logger from '../mocks/logger';
import contratJson from '../../build/services/RatesGuard/contract';
import Web3 from 'web3';

const account = '0x0360d0068f30f8952eccde246ab2a96fac889ffd';
const contract = '0x0160d0068f30f8952eccde246ab2a96fac889ffd';
const web3 = generate(account);
const config = {
    ethRatesGuardAddress: contract
};

describe('RatesGuard', () => {
    const ctx = {};

    before(() => {
        web3.contractConstructorHook = (abi, address) => {
            ctx.ContractCreationArgs = {
                abi,
                address
            };
        };
        ctx.Target = new RatesGuard(config, web3, logger)
    });
    afterEach(() => {
        web3.suggesteSendHook = web3.suggestHook = () => {};
    });

    it('should create instance', () => {
        expect(ctx.ContractCreationArgs.abi).to.be.eq(contratJson.abi);
        expect(ctx.ContractCreationArgs.address).to.be.eq(contract);
    });

    describe('bull send prices', () => {
        it('should return false if no prices', async () => {
            const actual = await ctx.Target.bulkSetPrice({});
            expect(actual).to.be.false;
        });

        it('should call `suggest` with no empty `gas` prop', async () => {
            web3.suggesteSendHook = ({gas}) => {
                expect(gas).to.exist;
                expect(parseFloat(gas)).to.gt(0);
            };
            await ctx.Target.bulkSetPrice({ symbol: 1 });
        });

        it('should call `suggest` with expected symbols', async () => {
            web3.suggestHook = (symbols, rates) => {
                expect(symbols[0]).to.eq(Web3.utils.fromUtf8('symbol'));
                expect(symbols[1]).to.eq(Web3.utils.fromUtf8('symbol2'));
            };
            await ctx.Target.bulkSetPrice({symbol: 1, symbol2: 1});
        });

        it('should call `suggest` with expected and normalize rates', async () => {
            web3.suggestHook = (symbols, rates) => {
                expect(rates[0]).to.eq('112345679');
                expect(rates[1]).to.eq('112345679');
            };
            await ctx.Target.bulkSetPrice({symbol: 1.123456789, symbol2: 1.12345678901});
        });

        it('should call `suggest` with `from` that equal account address', async () => {
            web3.suggesteSendHook = ({from}) => {
                expect(from).to.eq(account);
            };
            await ctx.Target.bulkSetPrice({symbol: 1});
        });

        it('should call `suggest` and return receipt', async () => {
            const receipt = await ctx.Target.bulkSetPrice({symbol: 1});
            expect(receipt).to.be.true;
        });
    });
});
