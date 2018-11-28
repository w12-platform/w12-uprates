import {IMarkets} from "../../types/Services/Markets";
import {IRates} from "../../types/Services/Rates";
import {BulkSetPriceRequest, IRatesGuard} from "../../types/Services/RatesGuard";
import {Logger} from "winston";

export class RatesUpdateController {
    private readonly markets: IMarkets;
    private readonly rates: IRates;
    private readonly ratesGuard: IRatesGuard;
    private readonly logger: Logger;

    constructor(markets: IMarkets, rates: IRates, ratesGuard: IRatesGuard, logger: Logger) {
        this.markets = markets;
        this.rates = rates;
        this.ratesGuard = ratesGuard;
        this.logger = logger;
    }

    async updateRates() {
        try {
            const symbols = await this.rates.getSymbols();

            if (symbols.length == 0) {
                this.logger.info('[RatesUpdateController] no symbols to update');
                return;
            }

            this.logger.info('[RatesUpdateController] requesting prices for %s', symbols.join(', '));

            const rates = await this.markets.request(symbols);

            if (rates == null) {
                this.logger.info('[RatesUpdateController] no prices for %s', symbols.join(', '));
                return;
            }

            this.logger.info('[RatesUpdateController] set new price %o', rates);

            await this.ratesGuard.bulkSetPrice(rates as BulkSetPriceRequest);

            this.logger.info('[RatesUpdateController] success');
        } catch (e) {
            this.logger.debug('[RatesUpdateController] error: \n\n %o', e);

            throw new Error('an error occurred while trying update rates');
        }
    }
}
