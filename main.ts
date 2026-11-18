// Dip Sniper — a long-only mean-reversion bot for cbBTC (CBBTC/USDC) on the
// agent-fun/bars-replay/v1 protocol.
//
// Idea: cbBTC's 1-minute price tends to snap back after a sharp dip below its
// recent average. The bot watches the 120-bar simple moving average of the
// closes. When the latest close falls at least 1.2% below that average it
// buys with all available cash, betting on the bounce. Once long it sells the
// whole position when the close rises 1.5% above its entry price (take profit)
// or falls 1.0% below it (stop loss, so a dip that keeps falling cannot drag
// the position to the end of the window). It holds at most one position, never
// shorts, never uses leverage, and every decision is pure BigInt arithmetic on
// the bars the harness hands it — no clock, no network, no randomness — so the
// same bars always produce the same orders.
//
// Thresholds as integer comparisons (avoiding any float rounding):
//   buy  when close * 1000 < SMA120 * 988        (close < 98.8% of SMA120)
//   sell when close * 1000 >= entry * 1015      (take profit, +1.5%)
//   sell when close * 1000 <= entry * 990       (stop loss, -1.0%)

import { runBars } from './vendor/makefun-bars.ts';
import type { BarsState, Batch, OrderInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const WINDOW = 120;
const BUY_NUM = 988n; // buy when close < 98.8% of the 120-bar SMA
const TP_NUM = 1015n; // take profit at +1.5% above the entry close
const STOP_NUM = 990n; // stop loss at -1.0% below the entry close
const SCALE = 1000n; // keeps the comparisons in whole integers
const MAX_SLIPPAGE_BPS = 10000;

// Rolling window of the last WINDOW closes and their sum.
const closes: bigint[] = [];
let sum = 0n;
// Close (price scale 5) at which the current position was entered, if any.
let entryClose: bigint | null = null;

function onBatch(state: BarsState, _batch: Batch): OrderInput[] {
  if (state.warmingUp) return [];
  const close = state.close(SYMBOL);
  if (close === null) return [];

  closes.push(close);
  sum += close;
  if (closes.length > WINDOW) {
    sum -= closes.shift()!;
  }
  if (closes.length < WINDOW) return [];

  const qty = state.positions.get(SYMBOL)?.qty ?? 0n;
  const lhs = close * SCALE * BigInt(WINDOW);

  if (qty === 0n) {
    // Flat: buy the dip, all-in, when the close is >= 1.2% below the SMA.
    // Never send a buy the market would refuse as below the minimum notional.
    entryClose = null;
    if (state.cash < BigInt(state.hello.fees.min_notional_quote_units)) return [];
    if (lhs < sum * BUY_NUM) {
      entryClose = close;
      return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: state.cash, max_slippage_bps: MAX_SLIPPAGE_BPS }];
    }
    return [];
  }

  // Long: take profit at +1.5% above entry, or stop out at -1.0% below it.
  // entryClose is set on the buy batch. (A restarted run is replayed over
  // every bar it already saw, so the entry close is always re-derived here;
  // the fallback only guards the type, and with entry == close neither the
  // take-profit nor the stop-loss comparison can fire on that bar.)
  const entry = entryClose ?? close;
  if (close * SCALE >= entry * TP_NUM || close * SCALE <= entry * STOP_NUM) {
    entryClose = null;
    return [{ side: 'sell', symbol: SYMBOL, qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
  }
  return [];
}

await runBars({ onBatch });
