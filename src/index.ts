import * as http from 'node:http';
import * as https from 'node:https';

export interface ProxyConfig {
    targetUrl: string;
    port: number;
}

const DEFAULT_CONFIG: ProxyConfig = {
    targetUrl: process.env.PROXY_TARGET_URL ?? 'https://api.mycustombackend.com',
    port: parseInt(process.env.PROXY_PORT ?? '3000', 10),
};

export function createProxy(config: Partial<ProxyConfig> = {}) {
    const finalConfig: ProxyConfig = { ...DEFAULT_CONFIG, ...config };
    const targetUrlParsed = new URL(finalConfig.targetUrl);

    const server = http.createServer((req, res) => {
        console.log(`[PROXY] ${req.method} ${req.url}`);

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
            console.error('Proxy Request Error:', err);
            if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'text/plain' });
                res.end('502 Bad Gateway');
            }
        });

        req.pipe(proxyReq, { end: true });
    });

    return {
        server,
        start: () => {
            server.listen(finalConfig.port, () => {
                console.log(`Target URL : \x1b[32m${finalConfig.targetUrl}\x1b[0m`);
                console.log(`Port       : \x1b[31m${finalConfig.port}\x1b[0m`);
                console.log(`Listening on http://localhost:${finalConfig.port}`);
            });
        }
    };
}

if (typeof require !== 'undefined' && require.main === module) {
    const proxy = createProxy();
    proxy.start();
}
