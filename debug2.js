const fs = require('fs');
const code = fs.readFileSync('src/app/contractor-bills/page.js', 'utf8');
const last50 = Buffer.from(code.slice(-50));
console.log('Last 50 bytes hex:', last50.toString('hex'));
console.log('Last 50 chars:', JSON.stringify(code.slice(-50)));
