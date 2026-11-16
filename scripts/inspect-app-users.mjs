// What app-api's GET /admin/users actually returns, field by field.
//
//   node --env-file=.env scripts/inspect-app-users.mjs            every user
//   node --env-file=.env scripts/inspect-app-users.mjs --limit 20 just 20
//
// Calls the gateway's /app/admin/users with the bot token, exactly as
// app/api/app-api/[...path]/route.js does, but WITHOUT that route's field projection
// — so this shows everything the backend sends, including what the browser never sees.
// Personal fields are masked on screen; the full raw JSON goes to the OS temp dir,
// outside the repo, so it can't be committed by accident.

import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const gateway = process.env.NEXT_PUBLIC_HYXORA_API?.replace(/\/+$/, "");
const token = process.env.HYXORA_BOT_TOKEN;
if (!gateway || !token) {
  console.error("Falta NEXT_PUBLIC_HYXORA_API o HYXORA_BOT_TOKEN. Ejecuta con --env-file=.env");
  process.exit(1);
}

const limitArg = process.argv.indexOf("--limit");
const sample = limitArg > -1 ? Number(process.argv[limitArg + 1]) : null;
const PAGE = sample ?? 1000;

/** Shown masked: they identify a person. */
const PERSONAL = new Set([
  "_id",
  "privyId",
  "email",
  "username",
  "firstName",
  "lastName",
  "name",
  "wallet",
  "signer",
  "solana",
  "kycId",
  "refCode",
]);

/** Shown as a full value count: they are categories, not people. */
const CATEGORY = new Set([
  "role",
  "kycStatus",
  "country",
  "membership.name",
  "membership.tier",
  "membershipStatus",
  "membershipPaymentType",
  "membershipInterval",
  "membershipAccessMode",
  "downgradeTarget",
]);

const mask = (value) => {
  const text = String(value);
  if (text.includes("@")) {
    const [user, domain] = text.split("@");
    return `${user.slice(0, 2)}***@${domain}`;
  }
  return text.length <= 4 ? "***" : `${text.slice(0, 4)}***`;
};

const fetchPage = async (offset) => {
  const url = `${gateway}/app/admin/users?limit=${PAGE}&offset=${offset}`;
  const response = await fetch(url, { headers: { Authorization: `Bot ${token}` } });
  const body = await response.text();
  if (!response.ok) {
    console.error(`HTTP ${response.status} en ${url}\n${body.slice(0, 500)}`);
    process.exit(1);
  }
  return JSON.parse(body);
};

const users = [];
let total = null;
for (let page = 0; page < 20; page += 1) {
  const body = await fetchPage(users.length);
  const rows = Array.isArray(body?.data?.users) ? body.data.users : [];
  total = body?.data?.total ?? total;
  users.push(...rows);
  if (rows.length === 0 || sample) break;
}

// One level of flattening, so `membership: { name, tier }` reads as two fields.
const flatten = (row) => {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [sub, subValue] of Object.entries(value)) out[`${key}.${sub}`] = subValue;
      out[key] = "[objeto]";
    } else {
      out[key] = value;
    }
  }
  return out;
};

const flat = users.map(flatten);
const stats = new Map();
for (const row of flat) {
  for (const [key, value] of Object.entries(row)) {
    const entry = stats.get(key) ?? { present: 0, filled: 0, types: new Set(), values: new Map() };
    entry.present += 1;
    const empty = value === null || value === undefined || value === "";
    if (!empty) {
      entry.filled += 1;
      entry.types.add(Array.isArray(value) ? "array" : typeof value);
      const shown = PERSONAL.has(key) ? mask(value) : String(value);
      entry.values.set(shown, (entry.values.get(shown) ?? 0) + 1);
    } else {
      entry.types.add(value === null ? "null" : "vacío");
    }
    stats.set(key, entry);
  }
}

const pct = (n) => `${Math.round((n / users.length) * 100)}%`.padStart(4);

console.log(`\n${gateway}/app/admin/users`);
console.log(`total que dice el backend: ${total ?? "—"} · filas recibidas: ${users.length}\n`);
console.log(
  `${"campo".padEnd(28)} ${"viene".padStart(6)} ${"relleno".padStart(12)}  tipos               ejemplos`
);
console.log("─".repeat(110));

for (const [key, entry] of [...stats].sort(([a], [b]) => a.localeCompare(b))) {
  let examples;
  if (CATEGORY.has(key)) {
    examples = [...entry.values]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => `${value} ×${count}`)
      .join(", ");
  } else {
    examples = [...entry.values.keys()].slice(0, 3).join(" | ");
  }
  console.log(
    `${key.padEnd(28)} ${pct(entry.present).padStart(6)} ${`${entry.filled} (${pct(entry.filled)})`.padStart(12)}  ${[...entry.types].join("/").padEnd(18)}  ${examples.slice(0, 80)}`
  );
}

const file = join(tmpdir(), `hyxora-app-users-${new Date().toISOString().slice(0, 10)}.json`);
writeFileSync(file, JSON.stringify(users, null, 2));
console.log("\n«viene» = filas que traen la clave · «relleno» = no null ni vacío");
console.log(`JSON completo sin enmascarar (fuera del repo): ${file}\n`);
