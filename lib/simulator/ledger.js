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
 * Per-symbol holdings aggregated in one grouped query.
 * units = Σ(buy units) − Σ(sell units); investedCents = Σ(buy amount) − Σ(sell amount).
 * Filtered to units > 1e-9 so fully-sold positions drop out.
 */
export async function getHoldings(userId) {
  const unitsExpr = sql`SUM(CASE
    WHEN ${simTransactions.type} = 'buy' THEN ${simTransactions.units}
    WHEN ${simTransactions.type} = 'sell' THEN -${simTransactions.units}
    ELSE 0 END)`;
  const investedExpr = sql`SUM(CASE
    WHEN ${simTransactions.type} = 'buy' THEN ${simTransactions.amountCents}
    WHEN ${simTransactions.type} = 'sell' THEN -${simTransactions.amountCents}
    ELSE 0 END)`;

  return db
    .select({
      symbol: simTransactions.symbol,
      units: sql`COALESCE(${unitsExpr}, 0)`.mapWith(Number),
      investedCents: sql`COALESCE(${investedExpr}, 0)`.mapWith(Number),
    })
    .from(simTransactions)
    .where(and(eq(simTransactions.userId, userId), isNotNull(simTransactions.symbol)))
    .groupBy(simTransactions.symbol)
    .having(sql`${unitsExpr} > 1e-9`);
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
