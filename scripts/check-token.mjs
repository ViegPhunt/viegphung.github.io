#!/usr/bin/env node
import crypto from 'node:crypto';

const token = process.env.GITHUB_TOKEN;
if (!token) {
    console.log('GITHUB_TOKEN: NOT SET');
    process.exit(0);
}
const hash = crypto.createHash('sha256').update(token).digest('hex').slice(0, 12);
console.log(`GITHUB_TOKEN: PRESENT (sha256: ${hash})`);
console.log('Note: Only a short hash is shown; no secret exposed.');