"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("node:http"));
const https = __importStar(require("node:https"));
// The destination target URL
const TARGET_URL = 'https://example.com';
const PORT = 3000;
const targetUrlParsed = new URL(TARGET_URL);
const server = http.createServer((clientReq, clientRes) => {
    console.log(`[PROXY] ${clientReq.method} ${clientReq.url}`);
    // Options for the outgoing request via https
    const options = {
        hostname: targetUrlParsed.hostname,
        port: targetUrlParsed.port || 443,
        path: clientReq.url,
        method: clientReq.method,
        headers: {
            ...clientReq.headers,
            host: targetUrlParsed.hostname, // Important: rewrite host header to match target
        },
    };
    // Construct the raw https request
    const proxyReq = https.request(options, (proxyRes) => {
        // Forward the status code and headers back to the client
        clientRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        // Pipe the response payload from the target back to the client
        proxyRes.pipe(clientRes, { end: true });
    });
    // Handle errors (e.g. target is unreachable)
    proxyReq.on('error', (err) => {
        console.error('Proxy Request Error:', err);
        if (!clientRes.headersSent) {
            clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
            clientRes.end('502 Bad Gateway');
        }
    });
    // Pipe the incoming request payload to the proxy request
    clientReq.pipe(proxyReq, { end: true });
});
server.listen(PORT, () => {
    console.log(`🚀 Raw proxy server listening on http://localhost:${PORT}`);
    console.log(`➡️  Forwarding all requests to ${TARGET_URL}`);
});
