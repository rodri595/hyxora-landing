import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const simUsers = sqliteTable("sim_users", {
  // Privy DID, e.g. "did:privy:..."
  id: text("id").primaryKey(),
  email: text("email"),
  wallet: text("wallet"),
  // "user" | "admin"
  role: text("role").notNull().default("user"),
  // "active" | "suspended" — the simulator is open to everyone, so new users start
  // active; an admin can still suspend an individual account to revoke access.
  status: text("status").notNull().default("active"),
  // Money stored as integer cents. Default $10,000.
  initialBalanceCents: integer("initial_balance_cents").notNull().default(1000000),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const simTransactions = sqliteTable(
  "sim_transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => simUsers.id),
    // "buy" | "sell" | "deposit" | "withdrawal"
    type: text("type").notNull(),
    // Asset ticker (e.g. "XAUT", "SPY") or opportunity id; null for cash-only deposit/withdrawal.
    symbol: text("symbol"),
    // Token contract address — the UNIQUE position key for tokens (the catalog
    // repeats symbols across chains, e.g. two USDC). Null for vaults/cash-only.
    address: text("address"),
    // Always positive; sign is implied by type (buy/withdrawal subtract cash, sell/deposit add cash).
    amountCents: integer("amount_cents").notNull(),
    // Asset units bought/sold.
    units: real("units"),
    // Unit price at tx time.
    priceUsd: real("price_usd"),
    note: text("note"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdx: index("sim_tx_user_idx").on(table.userId),
  })
);
