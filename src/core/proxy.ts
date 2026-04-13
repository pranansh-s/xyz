import * as http from 'node:http';
import * as https from 'node:https';
import { ProxyConfig } from '../types';
import { Logger } from '../utils/logger';

export function handleProxyRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    config: ProxyConfig,
    logger: Logger
) {
    const targetUrlParsed = new URL(config.targetUrl);

    logger.info(`[PROXY] ${req.method} ${req.url}`);

    const options: https.RequestOptions = {
        hostname: targetUrlParsed.hostname,
        port: targetUrlParsed.port || 443,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            host: targetUrlParsed.hostname,
        },
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        logger.error('Proxy Request Error:', err);
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('502 Bad Gateway');
        }
    });

    req.pipe(proxyReq, { end: true });
}
