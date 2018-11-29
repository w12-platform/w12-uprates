import {expect} from 'chai';
import {Rates, RatesGuard, Markets} from '../mocks/rates-update-controller';
import logger from '../mocks/logger';
import {RatesUpdateController} from '../../build/controllers/RatesUpdateController';

describe('RatesUpdateController', () => {
    const ctx = {};

    before(() => {
        ctx.Target = new RatesUpdateController(Markets, Rates, RatesGuard, logger);
    });
    afterEach(() => {
        Rates.getSymbols = RatesGuard.bulkSetPrice = Markets.request = async () => {};
    })

    describe('update', () => {
        it('should break execution if symbols list is empty', async () => {
            let triggered = false;
            Rates.getSymbols = async () => [];
            RatesGuard.bulkSetPrice = Markets.request = async () => triggered = true;
            await ctx.Target.updateRates();
            expect(triggered).to.be.false;
        });

        it('should request prices from markets', async () => {
            Rates.getSymbols = async () => ['1'];
            Markets.request = async (symbols) => {
                expect(symbols).to.deep.eq(['1']);
                return {1:1};
            };
            await ctx.Target.updateRates();
        });

        it('should break execution if no prices for symbols', async () => {
            let triggered = false;
            Rates.getSymbols = async () => ['1'];
            Markets.request = async (symbols) => {
                return null;
            };
            RatesGuard.bulkSetPrice = async () => triggered = true;
            await ctx.Target.updateRates();
            expect(triggered).to.be.false;
        });

        it('should call bulk set price on rates guard with expected arguments', async () => {
            Rates.getSymbols = async () => ['1'];
            Markets.request = async (symbols) => {
                return {1:1};
            };
            RatesGuard.bulkSetPrice = async (arg) => {
                expect(arg).to.deep.eq({1:1});
            };
            await ctx.Target.updateRates();
        });
    });
})
