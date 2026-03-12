---
name: tron-toolkit
description: TRON blockchain query & analysis toolkit — account info, transaction parsing, event decoding, on-chain analytics via TronWeb SDK
metadata: {"openclaw":{"requires":{"bins":["node", "npm"]},"emoji":"⛓️","homepage":"https://github.com/0xbigapple/tron-toolkit-skill.git"}}
---

# TRON Toolkit ⛓️

Query and analyze the TRON blockchain. Powered by TronWeb SDK.

## Setup

1. Make sure Node.js is installed.
2. Initialize the dependencies in the scripts folder:
```bash
cd {baseDir}/scripts && npm install
```
3. (Optional) Edit `{baseDir}/scripts/config.json` to add your TronGrid API key. If it doesn't exist, you can copy it from `config.example.json`.

## Universal API Wrapper (`api.js`)

Use the universal wrapper to call *any* method on the TronWeb SDK directly. This handles all basic queries, transaction building, and utilities.

```bash
node {baseDir}/scripts/api.js <namespace> <method> [args...]
```

**Common Examples:**

- **Account Info:** `node {baseDir}/scripts/api.js trx getAccount <address>`
- **Balance:** `node {baseDir}/scripts/api.js trx getBalance <address>`
- **Transaction Info:** `node {baseDir}/scripts/api.js trx getTransactionInfo <txid>`
- **Block Info:** `node {baseDir}/scripts/api.js trx getBlock <number|latest>`
- **Contract Info:** `node {baseDir}/scripts/api.js trx getContract <address>`

## Self-Discovery for LLMs

If you (the AI) are not sure which API method to use or what arguments it expects, use the built-in help command:
```bash
# List all namespaces
node {baseDir}/scripts/api.js help

# List all methods in a namespace
node {baseDir}/scripts/api.js trx help
```
This is especially important if you are running on a model with less training data about the TronWeb SDK. Always use `help` before guessing method names.

## On-Chain Analysis (`analyze.js`)

For complex queries involving aggregation over time periods.

### Incoming TRX Transfers
```bash
node {baseDir}/scripts/analyze.js incoming <address> [hours=24]
```
Stats: unique senders, total received, top senders ranked by amount.

### Outgoing TRX Transfers
```bash
node {baseDir}/scripts/analyze.js outgoing <address> [hours=24]
```
Stats: unique receivers, total sent, top receivers.

### Account Behavior Profile
```bash
node {baseDir}/scripts/analyze.js profile <address> [hours=24]
```
Full analysis: transaction type breakdown, TRX flow (in/out/net), hourly activity pattern, peak hours, interacted addresses.

### TRC20 Transfer Records
```bash
node {baseDir}/scripts/analyze.js trc20-transfers <contract_address> <owner_address> [hours=24]
```
Returns: incoming/outgoing TRC20 transfers with amounts and counterparties.

## Field Reference

When interpreting query results, ALWAYS read `{baseDir}/references/field-reference.md` first for accurate field descriptions. Do not guess field meanings.

## Response Guidelines

1. **Always check field-reference.md** before interpreting results
2. **Return human-readable text**, not raw JSON (unless user asks for it)
3. **Decode hex errors**: When encountering hex-encoded error messages (e.g., `resMessage` or `contractResult` in failed transactions), automatically decode them using `Buffer.from(hex, 'hex').toString('utf8')` before presenting the reason to the user.
4. **Complex ABI Decoding**: For highly complex contract payloads (e.g., containing nested `tuple`s or multidimensional arrays like DEX routers), prefer using `ethers.utils.AbiCoder` over native TronWeb methods for guaranteed accuracy. Install `ethers` temporarily if needed.
5. **Convert sun to TRX** (÷ 1,000,000) for display
6. **Highlight anomalies**: unusual amounts, failed transactions, high energy usage
7. **For complex questions** not covered by existing commands: write ad-hoc Node.js scripts using TronWeb.

## Common Addresses

| Address | Description |
|---------|-------------|
| `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` | USDT (Tether USD) |
| `TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz` | USDD (Decentralized USD) |
| `TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5` | sTRX (Staked TRX) |
| `TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S` | SUN |
| `TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9` | JST (JUST) |
| `TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR` | WTRX (Wrapped TRX) |
| `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` | Native TRX Placeholder (e.g. JustLend) / Burn |

## Ad-hoc Scripts

For queries not covered by existing commands, write a one-off script:

```bash
node -e "
const {TronWeb} = require('{baseDir}/scripts/node_modules/tronweb');
const tw = new TronWeb({fullHost:'https://api.trongrid.io'});
tw.setAddress('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'); // IMPORTANT: Always set a default address for read-only contract calls to prevent 'owner_address isn\'t set' errors
// your custom query here
"
```

## Ad-Hoc Script Templates (`examples/`)

If the user asks you to perform complex actions like deploying or transferring tokens, reference the templates in `{baseDir}/scripts/examples/`:
- `compile.js`: How to compile Solidity strings into ABI/Bytecode via `solc`.
- `deploy.js`: How to deploy a contract using `tronWeb.contract().new()`.
- `interact.js`: How to call read-only contract view functions via `contract.method().call()`.
- `transfer_trc20.js`: How to send TRC20 tokens via `contract.transfer().send({ feeLimit })`. Remember to handle token decimals appropriately (e.g. 6 for USDT, 18 for others) and ALWAYS include a `feeLimit` to prevent OUT_OF_ENERGY errors.

Do not modify the examples directly; instead, create temporary scripts in `{baseDir}/scripts/` for the user's specific request, execute them, and report the success.
