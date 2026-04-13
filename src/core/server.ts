import * as http from 'node:http';
import { ProxyConfig } from '../types';
import { resolveConfig } from '../config';
import { Logger } from '../utils/logger';
import { handleProxyRequest } from './proxy';

export class ProxyServer {
    private config: ProxyConfig;
    private logger: Logger;
    private server: http.Server;

    constructor(config: Partial<ProxyConfig> = {}) {
        this.config = resolveConfig(config);
        this.logger = new Logger(this.config);

        this.server = http.createServer((req, res) => {
            handleProxyRequest(req, res, this.config, this.logger);
        });
    }

    public start(): void {
        this.server.listen(this.config.port, () => {
            console.log(`=== Proxy Configuration ===`);
            console.log(`Target URL : \x1b[32m${this.config.targetUrl}\x1b[0m`);
            console.log(`Port       : \x1b[31m${this.config.port}\x1b[0m`);
            console.log(`Logging    : ${this.config.logRequests ? 'Enabled' : 'Disabled'}`);
            console.log(`===========================`);
            console.log(`Listening on http://localhost:${this.config.port}`);
        });
    }

    public stop(callback?: (err?: Error) => void): void {
        this.server.close(callback);
    }
}

export function createProxy(config: Partial<ProxyConfig> = {}) {
    return new ProxyServer(config);
}
