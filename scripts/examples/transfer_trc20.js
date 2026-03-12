/**
 * TRC20 Transfer Template
 * Usage for AI: Copy this structure when asked to transfer TRC20 tokens.
 * Remember to handle decimals (e.g., * 10**18 or * 10**6 for USDT) and include feeLimit.
 */
const { TronWeb } = require('tronweb');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
const tronWeb = new TronWeb({
    fullHost: config.fullHost || config.fullNode,
    privateKey: config.privateKey
});

const CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // Example: USDT
const TO_ADDRESS = 'T...';
const AMOUNT = "100000000"; // Example: 100 USDT (6 decimals)

async function main() {
    try {
        console.log(`Sending to ${TO_ADDRESS}...`);
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
        
        // Use .send() for state-changing methods
        const txId = await contract.transfer(TO_ADDRESS, AMOUNT).send({
            feeLimit: 1000000000 // IMPORTANT: Required for state changes on TRON (e.g. 1000 TRX)
        });
        
        console.log("✅ Transfer successful!");
        console.log("Transaction ID:", txId);
    } catch(e) {
        console.error("Transfer failed:", e);
    }
}
main();
