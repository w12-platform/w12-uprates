import {Config} from "../../types/config";

export function resolve(config: any): Readonly<Config> {
    return config as Readonly<Config>;
}

export function validate(config: Readonly<Config>): boolean {
    return true;
}
