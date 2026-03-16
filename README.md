# TRON Toolkit ⛓️

A comprehensive skill for querying and analyzing the TRON blockchain. Powered by the official TronWeb SDK.

**⚠️ SECURITY WARNING: Never write a private key with mainnet assets into any configuration file.**

## Features
- **Universal API Wrapper**: Access any endpoint of the TronWeb SDK directly from the CLI.
- **On-chain Analysis**: Pre-built scripts for analyzing address behavior, transfer flows, and token records.
- **Smart Contracts**: Direct support for querying contract states, decoding events, and calling methods.

## Installation

This skill requires Node.js.

```bash
cd scripts
npm install
```

## Configuration

Copy `scripts/config.example.json` to `scripts/config.json` and add your TronGrid API key to prevent rate limiting:

```json
{
  "fullHost": "https://api.trongrid.io", 
  "apiKey": "your-trongrid-api-key-here",
  "privateKey": "01"
}
```

## Testnet & Faucets

For development and testing, you can use the TRON testnet.You can obtain test TRX from their official faucets.

- **Nile FullHost**: [https://nile.trongrid.io/](https://nile.trongrid.io/)
- **Nile Faucets**: [https://nileex.io/join/getJoinPage](https://nileex.io/join/getJoinPage)

## Usage

### Universal API Wrapper
The core of the toolkit is `api.js`, which exposes the entire TronWeb SDK.

```bash
# See all available modules
node scripts/api.js help

# See methods inside a module
node scripts/api.js trx help

# Examples
node scripts/api.js trx getBlock latest
node scripts/api.js trx getAccount <address>
node scripts/api.js trx getTransactionInfo <txid>
```

### Analytical Commands
```bash
node scripts/analyze.js profile <address>
node scripts/analyze.js incoming <address> 24
node scripts/analyze.js trc20-transfers <contract> <owner>
```

### Documentation
See `references/field-reference.md` for definitions of TRON's on-chain fields (e.g., energy, bandwidth, permissions, token precision).

### Examples (Smart Contract Deployment)
The `scripts/examples/` directory contains a complete, end-to-end workflow for compiling, deploying, and interacting with a TRC20 Smart Contract on TRON using Node.js:
- \`compile.js\`: Uses \`solc\` to compile Solidity source code into ABI and Bytecode.
- \`deploy.js\`: Uses TronWeb to sign and broadcast the contract deployment transaction.
- \`interact.js\`: Demonstrates how to read contract states (e.g., name, symbol, balance) directly from the blockchain.

*Note: You may need to run \`npm install solc\` in the scripts directory to use the compiler script.*
