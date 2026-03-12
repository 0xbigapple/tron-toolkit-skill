const { TronWeb } = require('tronweb');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
let config = {};
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

const fullHost = config.fullNode || config.fullHost || 'https://api.trongrid.io';
const privateKey = config.privateKey || '01'; // Default dummy key for read-only

const tronWebOptions = {
    fullHost: fullHost,
    privateKey: privateKey
};

if (config.apiKey) {
    tronWebOptions.headers = { 'TRON-PRO-API-KEY': config.apiKey };
}

const tronWeb = new TronWeb(tronWebOptions);

async function run() {
    const args = process.argv.slice(2);
    
    // Help for namespaces
    if (args.length === 0 || args[0] === 'help') {
        console.log("TronWeb Universal API Wrapper (v6.x+ compatible)");
        console.log("Usage: node api.js <namespace> <method> [args...]");
        console.log("\nAvailable Namespaces:");
        console.log("  trx                - Query chain data, accounts, blocks, and broadcast transactions");
        console.log("  transactionBuilder - Construct unsigned transactions");
        console.log("  address            - Address conversion utilities (fromHex, toHex)");
        console.log("\nTo see methods in a namespace, run: node api.js <namespace> help");
        return;
    }

    const namespace = args[0];
    
    // address is a static utility on TronWeb class in v6+, but instantiated as tronWeb.address as well
    const target = tronWeb[namespace] || TronWeb[namespace];
    
    if (!target) {
        console.error(`Error: Namespace '${namespace}' does not exist on TronWeb.`);
        return;
    }

    // Help for a specific namespace
    if (args.length === 1 || args[1] === 'help') {
        let funcs = [];
        if (target.constructor && target.constructor.name !== 'Object' && target.constructor.name !== 'Function') {
            funcs = Object.getOwnPropertyNames(Object.getPrototypeOf(target))
                .filter(f => f !== 'constructor' && typeof target[f] === 'function');
        } else {
            funcs = Object.keys(target).filter(k => typeof target[k] === 'function');
        }
        
        console.log(`\nAvailable methods in '${namespace}':`);
        funcs.sort().forEach(f => console.log(`  - ${f}`));
        console.log(`\nUsage: node api.js ${namespace} <method_name> [args...]`);
        return;
    }

    const method = args[1];
    const methodArgs = args.slice(2).map(arg => {
        try { return JSON.parse(arg); } catch(e) { return arg; }
    });

    if (typeof target[method] !== 'function') {
        console.error(`Error: Method ${namespace}.${method} does not exist.`);
        return;
    }

    try {
        const result = await target[method](...methodArgs);
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('API Error:', e.message || e);
    }
}

run();
