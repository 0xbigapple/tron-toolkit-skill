const { TronWeb } = require('tronweb');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
const build = JSON.parse(fs.readFileSync(path.join(__dirname, 'build.json'), 'utf8'));

const tronWeb = new TronWeb({
    fullHost: config.fullHost,
    privateKey: config.privateKey
});

async function main() {
    try {
        const address = tronWeb.defaultAddress.base58;
        console.log("Deploying from address:", address);
        
        const balance = await tronWeb.trx.getBalance(address);
        console.log("Balance:", balance / 1e6, "TRX");

        if (balance === 0) {
            console.error("❌ Cannot deploy: Account has 0 TRX. Please send Nile testnet TRX to", address);
            return;
        }

        console.log("Deploying AppleToken...");
        const contract = await tronWeb.contract().new({
            abi: build.abi,
            bytecode: build.bytecode,
            feeLimit: 1000000000,
            callValue: 0,
            userFeePercentage: 100,
            originEnergyLimit: 10000000,
            parameters: [1000000] // 1 million initial supply
        });

        console.log("✅ Contract deployed successfully!");
        console.log("Contract Address:", contract.address);
    } catch (e) {
        console.error("Deploy failed:", e);
    }
}
main();
