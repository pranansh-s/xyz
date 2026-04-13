import { ProxyConfig } from '../types';
import { DEFAULT_CONFIG } from './default';

export function resolveConfig(config: Partial<ProxyConfig> = {}): ProxyConfig {
    return {
        ...DEFAULT_CONFIG,
        ...config,
    };
}
