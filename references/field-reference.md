# TRON API Field Reference

> This document serves as a field reference for the TRON toolkit. AI agents should refer to this file when interpreting query results.

## Account

| Field | Meaning |
|------|------|
| \`balance\` | Available TRX balance (in sun, 1 TRX = 1,000,000 sun). |
| \`create_time\` | The timestamp when the account was activated. |
| \`frozenV2\` | Stake 2.0 staking info. Empty type = Bandwidth, ENERGY = Energy, TRON_POWER = Voting Power. |
| \`owner_permission\` | Highest authority, can modify all account settings. |
| \`active_permission\` | Daily operations authority, restricts operation scope. |
| \`active_permission.operations\` | Hex-encoded operations bitmap, each bit corresponds to a contract type. |
| \`active_permission.threshold\` | Multisig threshold. 1 means single signature. |
| \`is_contract\` | Indicates whether the address is a smart contract. |

### Resources

| Field | Meaning |
|------|------|
| \`bandwidth.free_limit\` | Daily free bandwidth quota (600 per account). |
| \`bandwidth.free_used\` | Consumed free bandwidth. |
| \`bandwidth.staked_limit\` | Bandwidth quota obtained by staking TRX. |
| \`bandwidth.staked_used\` | Consumed staked bandwidth. |
| \`energy.limit\` | Energy quota obtained by staking (consumed during contract calls). |
| \`energy.used\` | Consumed energy. |

> Bandwidth: Consumed by regular transfers, regenerates every 24h.
> Energy: Consumed by smart contract calls, regenerates every 24h.
> If resources are insufficient, TRX is automatically burned to pay the fee.

## Transaction

| Field | Meaning |
|------|------|
| \`status\` | SUCCESS = success, REVERT = contract execution reverted, OUT_OF_ENERGY = insufficient energy. |
| \`fee\` | Actual TRX fee consumed. |
| \`energy_used\` | Total energy consumed (includes user + contract owner). |
| \`bandwidth_used\` | Total bandwidth consumed. |
| \`contract_type\` | Type of the transaction. |

### Common contract_type

| Type | Description |
|------|------|
| \`TransferContract\` | TRX transfer |
| \`TransferAssetContract\` | TRC10 token transfer |
| \`TriggerSmartContract\` | Smart contract invocation |
| \`FreezeBalanceV2Contract\` | Stake 2.0 stake |
| \`UnfreezeBalanceV2Contract\` | Stake 2.0 unstake |
| \`DelegateResourceContract\` | Delegate resources to others |
| \`UnDelegateResourceContract\` | Cancel resource delegation |
| \`VoteWitnessContract\` | Vote for Super Representatives |
| \`CreateSmartContract\` | Deploy a smart contract |

## Contract

| Field | Meaning |
|------|------|
| \`origin_energy_limit\` | Max energy covered by the contract creator. |
| \`consume_user_resource_percent\` | Percentage of resources paid by the user (0-100). 0 = creator pays all, 100 = user pays all. |

## Events

### Common Event Signatures

| Topic Hash (first 8 chars) | Event | Description |
|---------|------|------|
| \`ddf252ad\` | Transfer(address,address,uint256) | TRC20 transfer |
| \`8c5be1e5\` | Approval(address,address,uint256) | TRC20 approval |

## TRC20 Tokens

| Field | Meaning |
|------|------|
| \`decimals\` | Decimal precision. USDT = 6, most others = 18. |
| \`raw_balance\` | Raw balance (without precision adjustment). |
| \`balance\` | Human-readable balance (adjusted for precision). |

---

## Common Addresses

| Address | Description |
|---------|-------------|
| \`TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t\` | USDT (Tether USD) |
| \`TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz\` | USDD (Decentralized USD) |
| \`TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5\` | sTRX (Staked TRX) |
| \`TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S\` | SUN |
| \`TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9\` | JST (JUST) |
| \`TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR\` | WTRX (Wrapped TRX) |
| \`T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb\` | Native TRX Placeholder (e.g. JustLend) / Burn |

---
*Last Updated: 2026-03-12 by Claw 🦀*
