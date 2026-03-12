const { TronWeb } = require('tronweb');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
const tronWeb = new TronWeb({
    fullHost: config.fullHost,
    privateKey: config.privateKey
});

const CONTRACT_ADDRESS = 'TUTCxWXp4GhDPkHz9X6eUakDPzHXA1wjjg';
const MY_ADDRESS = tronWeb.defaultAddress.base58;

async function main() {
    const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
    const name = await contract.name().call();
    const symbol = await contract.symbol().call();
    const decimals = Number(await contract.decimals().call());
    const supply = await contract.totalSupply().call();
    const balance = await contract.balanceOf(MY_ADDRESS).call();

    console.log(`=== Token Info ===`);
    console.log(`Name:`, name);
    console.log(`Symbol:`, symbol);
    console.log(`Decimals:`, decimals);
    console.log(`Total Supply:`, (supply.toString() / (10**decimals)).toString());
    console.log(`My Balance:`, (balance.toString() / (10**decimals)).toString());
}
main();
