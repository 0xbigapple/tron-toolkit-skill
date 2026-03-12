#!/usr/bin/env node
/**
 * TRON On-chain Data Analysis Tool
 * Usage: node analyze.js <command> [args...]
 *
 * Commands:
 *   incoming <address> [hours=24]        Statistics of incoming TRX transfers within specified hours
 *   outgoing <address> [hours=24]        Statistics of outgoing TRX transfers within specified hours
 *   profile <address> [hours=24]         Account transaction behavior profile
 *   trc20-transfers <contract> <address> [hours=24]  TRC20 transfer records
 */

const { TronWeb } = require('tronweb');
const fs = require('fs');
const path = require('path');

// ─── Setup ───

let config = {
    fullHost: 'https://api.trongrid.io',
    apiKey: '',
    privateKey: '01'
};

const configPath = path.join(__dirname, 'config.json');
if (fs.existsSync(configPath)) {
    try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config = { ...config, ...fileConfig };
    } catch (e) {
        console.error('⚠️ Warning: Failed to parse config.json, using defaults.');
    }
}

const tronWeb = new TronWeb({
    fullHost: config.fullHost || config.fullNode || 'https://api.trongrid.io',
    privateKey: config.privateKey || '01',
    headers: config.apiKey ? { 'TRON-PRO-API-KEY': config.apiKey } : {}
});

const SUN = 1_000_000;
const formatTRX = (sun) => (Number(sun || 0) / SUN).toFixed(2);

/**
 * Normalizes any TRON address to Base58 format for safe comparison.
 */
function normalize(addr) {
    if (!addr) return '';
    try {
        return tronWeb.address.fromHex(tronWeb.address.toHex(addr));
    } catch (e) {
        return addr;
    }
}

/**
 * Standard fetch wrapper with proper headers
 */
async function apiFetch(endpoint) {
    const url = `${config.fullHost || config.fullNode}${endpoint}`;
    const headers = { 'Accept': 'application/json' };
    if (config.apiKey) headers['TRON-PRO-API-KEY'] = config.apiKey;

    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    return await resp.json();
}

// ─── Data Fetching ───

async function fetchTransactions(address, minTimestamp, maxTimestamp) {
    const all = [];
    let fingerprint = '';
    const limit = 200;
    const path = `/v1/accounts/${address}/transactions`;

    while (true) {
        let query = `?limit=${limit}&min_timestamp=${minTimestamp}&max_timestamp=${maxTimestamp}&order_by=block_timestamp,desc`;
        if (fingerprint) query += `&fingerprint=${fingerprint}`;

        try {
            const data = await apiFetch(path + query);
            if (!data.data || data.data.length === 0) break;
            
            all.push(...data.data);
            if (data.meta?.fingerprint) {
                fingerprint = data.meta.fingerprint;
            } else {
                break;
            }

            if (all.length >= 5000) {
                console.error(`⚠️ Reached 5000 tx limit, results may be incomplete`);
                break;
            }
        } catch (e) {
            console.error(`Fetch error: ${e.message}`);
            break;
        }
    }
    return all;
}

// ─── Analysis Logic ───

async function analyzeIncoming(address, hours) {
    const target = normalize(address);
    const now = Date.now();
    const since = now - hours * 3600 * 1000;

    console.error(`📊 Fetching transactions for ${target} (last ${hours}h)...`);
    const txs = await fetchTransactions(target, since, now);

    const incoming = [];
    for (const tx of txs) {
        const contract = tx.raw_data?.contract?.[0];
        if (contract?.type !== 'TransferContract') continue;

        const param = contract.parameter.value;
        const to = normalize(param.to_address);
        if (to !== target) continue;

        incoming.push({
            from: normalize(param.owner_address),
            amount_sun: param.amount,
            amount_trx: formatTRX(param.amount),
            time: new Date(tx.raw_data.timestamp).toISOString(),
            txid: tx.txID,
        });
    }

    const bySender = {};
    for (const tx of incoming) {
        if (!bySender[tx.from]) bySender[tx.from] = { count: 0, total_sun: 0 };
        bySender[tx.from].count++;
        bySender[tx.from].total_sun += tx.amount_sun;
    }

    const senders = Object.entries(bySender)
        .map(([addr, data]) => ({
            address: addr,
            tx_count: data.count,
            total_trx: formatTRX(data.total_sun),
            total_sun: data.total_sun,
        }))
        .sort((a, b) => b.total_sun - a.total_sun);

    return {
        target,
        period: `${hours}h`,
        incoming_trx_transfers: incoming.length,
        unique_senders: senders.length,
        total_received: `${formatTRX(incoming.reduce((s, t) => s + t.amount_sun, 0))} TRX`,
        top_senders: senders.slice(0, 10),
    };
}

async function analyzeOutgoing(address, hours) {
    const target = normalize(address);
    const now = Date.now();
    const since = now - hours * 3600 * 1000;

    console.error(`📊 Fetching transactions for ${target} (last ${hours}h)...`);
    const txs = await fetchTransactions(target, since, now);

    const outgoing = [];
    for (const tx of txs) {
        const contract = tx.raw_data?.contract?.[0];
        if (contract?.type !== 'TransferContract') continue;

        const param = contract.parameter.value;
        if (normalize(param.owner_address) !== target) continue;

        outgoing.push({
            to: normalize(param.to_address),
            amount_sun: param.amount,
            amount_trx: formatTRX(param.amount),
            time: new Date(tx.raw_data.timestamp).toISOString(),
            txid: tx.txID,
        });
    }

    const byReceiver = {};
    for (const tx of outgoing) {
        if (!byReceiver[tx.to]) byReceiver[tx.to] = { count: 0, total_sun: 0 };
        byReceiver[tx.to].count++;
        byReceiver[tx.to].total_sun += tx.amount_sun;
    }

    return {
        target,
        period: `${hours}h`,
        outgoing_trx_transfers: outgoing.length,
        total_sent: `${formatTRX(outgoing.reduce((s, t) => s + t.amount_sun, 0))} TRX`,
        top_receivers: Object.entries(byReceiver)
            .map(([addr, data]) => ({ address: addr, count: data.count, total_trx: formatTRX(data.total_sun) }))
            .sort((a, b) => b.total_sun - a.total_sun).slice(0, 10),
    };
}

async function analyzeProfile(address, hours) {
    const target = normalize(address);
    const now = Date.now();
    const since = now - hours * 3600 * 1000;

    console.error(`📊 Fetching profile for ${target} (last ${hours}h)...`);
    const txs = await fetchTransactions(target, since, now);

    const stats = {
        tx_types: {},
        interacted: new Set(),
        hourly: {},
        inTRX: 0,
        outTRX: 0
    };

    for (const tx of txs) {
        const contract = tx.raw_data?.contract?.[0];
        const type = contract?.type || 'Unknown';
        stats.tx_types[type] = (stats.tx_types[type] || 0) + 1;

        const hour = new Date(tx.raw_data.timestamp).getHours();
        stats.hourly[hour] = (stats.hourly[hour] || 0) + 1;

        const param = contract?.parameter?.value;
        if (!param) continue;

        if (type === 'TransferContract') {
            const from = normalize(param.owner_address);
            const to = normalize(param.to_address);
            if (from === target) { stats.outTRX += param.amount; stats.interacted.add(to); }
            if (to === target) { stats.inTRX += param.amount; stats.interacted.add(from); }
        } else if (param.contract_address) {
            stats.interacted.add(normalize(param.contract_address));
        }
    }

    return {
        address: target,
        summary: {
            total_txs: txs.length,
            net_flow_trx: formatTRX(stats.inTRX - stats.outTRX),
            unique_interacted: stats.interacted.size
        },
        type_distribution: stats.tx_types,
        top_interacted: [...stats.interacted].slice(0, 10)
    };
}

async function analyzeTRC20Transfers(contractAddr, address, hours) {
    const target = normalize(address);
    const now = Date.now();
    const since = now - hours * 3600 * 1000;
    const path = `/v1/accounts/${target}/transactions/trc20?limit=200&min_timestamp=${since}&contract_address=${normalize(contractAddr)}`;

    try {
        const data = await apiFetch(path);
        if (!data.data || data.data.length === 0) return { message: 'No transfers found' };

        const transfers = data.data.map(t => ({
            from: normalize(t.from),
            to: normalize(t.to),
            amount: (Number(t.value) / Math.pow(10, t.token_info?.decimals || 0)).toFixed(4),
            symbol: t.token_info?.symbol || '?',
            txid: t.transaction_id
        }));

        return {
            target,
            token: transfers[0]?.symbol,
            incoming: transfers.filter(t => t.to === target).length,
            outgoing: transfers.filter(t => t.from === target).length,
            recent: transfers.slice(0, 5)
        };
    } catch (e) {
        return { error: e.message };
    }
}

// ─── Router ───

const [,, cmd, ...args] = process.argv;
const commands = {
    incoming: () => analyzeIncoming(args[0], parseInt(args[1]) || 24),
    outgoing: () => analyzeOutgoing(args[0], parseInt(args[1]) || 24),
    profile: () => analyzeProfile(args[0], parseInt(args[1]) || 24),
    'trc20-transfers': () => analyzeTRC20Transfers(args[0], args[1], parseInt(args[2]) || 24),
};

if (!cmd || !commands[cmd]) {
    console.log(`Usage: node analyze.js <command> [args...]\n\nCommands: incoming, outgoing, profile, trc20-transfers`);
    process.exit(0);
}

(async () => {
    try {
        const result = await commands[cmd]();
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
})();
