import { db, simTransactions } from "@/db";
import { and, eq, isNotNull, sql } from "drizzle-orm";

// Net cash movement from the tx ledger: sell/deposit add cash, buy/withdrawal subtract.
const netCentsExpr = sql`COALESCE(SUM(CASE
  WHEN ${simTransactions.type} IN ('sell', 'deposit') THEN ${simTransactions.amountCents}
  WHEN ${simTransactions.type} IN ('buy', 'withdrawal') THEN -${simTransactions.amountCents}
  ELSE 0 END), 0)`;

/**
 * Cash balance is DERIVED from the tx ledger, never stored.
 * cashBalanceCents = initialBalanceCents + net(ledger).
 * One aggregate query over the user's transactions.
 */
export async function getCashBalanceCents(user) {
  const rows = await db
    .select({ net: netCentsExpr.mapWith(Number) })
    .from(simTransactions)
    .where(eq(simTransactions.userId, user.id));
  return user.initialBalanceCents + Number(rows[0]?.net ?? 0);
}

/**
 * Per-symbol holdings derived by replaying the tx ledger in order.
 * units = Σ(buy units) − Σ(sell units). investedCents is the average cost
 * basis: buys add their amount; sells reduce the basis in proportion to the
 * units sold — NOT by the sale proceeds, which would leak realized profit
 * into the remaining position (e.g. sell-all at a gain then re-buy would
 * show less invested than was actually spent).
 * Positions with units ≤ 1e-9 drop out.
 */
export async function getHoldings(userId) {
  const rows = await db
    .select({
      type: simTransactions.type,
      symbol: simTransactions.symbol,
      units: simTransactions.units,
      amountCents: simTransactions.amountCents,
    })
    .from(simTransactions)
    .where(and(eq(simTransactions.userId, userId), isNotNull(simTransactions.symbol)))
    .orderBy(simTransactions.id);

  const positions = new Map();
  for (const tx of rows) {
    const pos = positions.get(tx.symbol) ?? { units: 0, investedCents: 0 };
    const units = Number(tx.units ?? 0);
    if (tx.type === "buy") {
      pos.units += units;
      pos.investedCents += tx.amountCents;
    } else if (tx.type === "sell") {
      const fraction = pos.units > 1e-9 ? Math.min(units / pos.units, 1) : 1;
      pos.investedCents -= pos.investedCents * fraction;
      pos.units = Math.max(pos.units - units, 0);
    }
    positions.set(tx.symbol, pos);
  }

  return [...positions.entries()]
    .filter(([, pos]) => pos.units > 1e-9)
    .map(([symbol, pos]) => ({
      symbol,
      units: pos.units,
      investedCents: Math.round(pos.investedCents),
    }));
}

// Units currently held for a single symbol (buy units − sell units).
export async function getHeldUnits(userId, symbol) {
  const rows = await db
    .select({
      units: sql`COALESCE(SUM(CASE
        WHEN ${simTransactions.type} = 'buy' THEN ${simTransactions.units}
        WHEN ${simTransactions.type} = 'sell' THEN -${simTransactions.units}
        ELSE 0 END), 0)`.mapWith(Number),
    })
    .from(simTransactions)
    .where(and(eq(simTransactions.userId, userId), eq(simTransactions.symbol, symbol)));
  return Number(rows[0]?.units ?? 0);
}
