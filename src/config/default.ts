import { ProxyConfig } from '../types';

export const DEFAULT_CONFIG: ProxyConfig = {
    targetUrl: process.env.PROXY_TARGET_URL || 'https://example.com',
    port: parseInt(process.env.PROXY_PORT || '3000', 10),
    logRequests: process.env.PROXY_LOG_REQUESTS !== 'false',
};
