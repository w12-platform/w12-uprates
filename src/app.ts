import Web3 = require("web3");
import Logger from './services/Logger';
import {Config} from "../types/config";
import {Services} from "../types/services";
import {Rates} from "./services/Rates/Rates";
import {Markets} from "./services/Markets/Markets";
import {RatesUpdateController} from "./controllers/RatesUpdateController";


export class App {
    private readonly appConfig: Readonly<Config>;
    private services!: Services;
    private ratesUpdateController!: RatesUpdateController;

    constructor(appConfig: Readonly<Config>) {
        this.appConfig = appConfig;
        this.buildServices();
        this.buildControllers();
    }

    private buildServices(): void {
        const web3 = new Web3(new Web3.providers.HttpProvider(this.appConfig.ethProvider));

        web3.eth.accounts.wallet.add(this.appConfig.ethAccountPrivateKey);

        const rates = new Rates(this.appConfig, web3, Logger);
        const markets = new Markets(this.appConfig.markets, Logger);

        this.services = {
            web3,
            Rates: rates,
            Markets: markets,
            Logger
        };
    }

    private buildControllers(): void {
        this.ratesUpdateController = new RatesUpdateController(
            this.services.Markets,
            this.services.Rates,
            this.services.Logger
        );
    }

    public start(): void {
        this.ratesUpdateController.updateRates()
            .then(() => {
                this.services.Logger.info('[App] success');
                process.exit(0);
            })
            .catch(e => {
                this.services.Logger.error('[App] error: \n\n', e);
                process.exit(1);
            });
    }
}
