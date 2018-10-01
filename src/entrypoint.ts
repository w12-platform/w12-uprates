import path from 'path';
import {config} from 'dotenv';
import {resolve, validate} from "./utils/config";
import {App} from "./app";
import {Config} from "../types/config";

config({
    path: path.resolve(process.cwd(), '.env'),
    encoding: 'utf8'
});

const configFile = require('../config.js');
const appConfig = resolve(configFile as Config);

if (!validate(appConfig)) {
    throw new Error('app config is not valid');
}

const app = new App(appConfig);

app.start();
