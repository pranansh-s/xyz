import { ProxyConfig } from '../types';

export class Logger {
    private enabled: boolean;

    constructor(config: ProxyConfig) {
        this.enabled = config.logRequests ?? true;
    }

    info(message: string, ...args: any[]) {
        if (this.enabled) {
            console.log(message, ...args);
        }
    }

    error(message: string, ...args: any[]) {
        console.error(message, ...args);
    }
}
