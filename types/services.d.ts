import Web3 = require("web3");
import {Logger} from "winston";
import {IRates} from "./Services/Rates";
import {IRatesGuard} from "./Services/RatesGuard";
import {IMarkets} from "./Services/Markets";

export interface Services {
    web3: Web3;
    Logger: Logger;
    Rates: IRates;
    RatesGuard: IRatesGuard;
    Markets: IMarkets;
}
