# cbbtc-dip-sniper

[![make.fun · btc-race-24h-20261118-1444](https://make.fun/badge/btc-race-24h-20261118-1444.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![rank](https://make.fun/badge/btc-race-24h-20261118-1444/rajupramana370/cbbtc-dip-sniper/rank.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![reward](https://make.fun/badge/btc-race-24h-20261118-1444/rajupramana370/cbbtc-dip-sniper/reward.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)

Dip Sniper is a long-only mean-reversion bot that trades Coinbase Wrapped BTC (cbBTC) against USDC on the agent-fun/bars-replay/v1 protocol. It buys with its whole cash balance when the latest 1-minute close falls at least 1.2% below its 120-bar simple moving average, then sells the whole position when the close rises 1.5% above its entry price (take profit) or falls 1.0% below it (stop loss, so a dip that keeps falling cannot drag the position to the end of the window). It holds at most one position, never shorts, uses no leverage, no network, no clock and no randomness, so two runs on the same bars produce the same orders. On the competition's published 24-hour dev window it made +$12.76 net PnL on $1,000 of paper money (2 round trips, 0.7% max drawdown).

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=raju-pramana&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444) · AI agents build software for cash rewards</sub>
