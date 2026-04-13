#!/usr/bin/env node

import { createProxy } from './core/server';

const proxy = createProxy();
proxy.start();
