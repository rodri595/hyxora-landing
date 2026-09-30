import { cerebroPlanLabel, cerebroPlans } from "@/constants/cerebro";
import { FUNDED_USD } from "@/hooks/cerebro/useGetUserActivation";

/**
 * The vocabulary of the users table's prompt: a sentence of clickable tokens that
 * reads back as what the table is showing.
 *
 * Two kinds of token, and the difference is where the work happens:
 *
 * - **Scope and order** are `/users` parameters. The server applies them to every
 *   row, so they are free and exact at any page size.
 * - **Filters** are not. `/users` takes no `plan`, `kyc`, `membership`, balance or
 *   date parameter, so any filter switches the table onto `useGetUsersSweep` and is
 *   tested here, row by row, over the whole population. Never over one page — that
 *   would pass for having filtered the table.
 */

/** Cerebro serialises some numerics as quoted strings, so every figure is coerced. */
const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * `scope=inactive` is `/users`' own notion — close to `last_active_at`, which the
 * deployment op stamps too — so it is not "never used the product". The activation
 * funnel on Sistema is the place for that question.
 */
export const SCOPE_OPTIONS = [
  { id: "all", label: "todos los usuarios" },
  { id: "inactive", label: "los usuarios inactivos" },
];

/**
 * Orders offered in the menu. A header click can land on a combination not listed
 * here — TVL ascending, say — and `sortLabel()` still names it.
 */
export const SORT_OPTIONS = [
  { id: "tvl-desc", sort: "tvl", desc: true, label: "más dinero dentro" },
  { id: "fees-desc", sort: "fees", desc: true, label: "más comisiones pagadas" },
  { id: "cost-desc", sort: "cost", desc: true, label: "más gas patrocinado" },
  { id: "net-asc", sort: "net", desc: false, label: "peor margen" },
  { id: "net-desc", sort: "net", desc: true, label: "mejor margen" },
  { id: "created-desc", sort: "created", desc: true, label: "registro más reciente" },
  { id: "created-asc", sort: "created", desc: false, label: "registro más antiguo" },
];

const SORT_NAMES = {
  tvl: "TVL",
  fees: "ingresos",
  cost: "gastos",
  net: "margen",
  created: "fecha de registro",
  plan: "plan",
};

/** @param {{ id: string, desc: boolean } | undefined} sorting */
export const sortLabel = (sorting) => {
  if (!sorting) return SORT_OPTIONS[0].label;
  const option = SORT_OPTIONS.find((o) => o.sort === sorting.id && o.desc === sorting.desc);
  if (option) return option.label;
  return `${SORT_NAMES[sorting.id] ?? sorting.id} ${sorting.desc ? "de mayor a menor" : "de menor a mayor"}`;
};

const kycBucket = (status) => {
  const upper = String(status ?? "").toUpperCase();
  if (!upper || upper === "NOT_AVAILABLE" || upper === "NONE") return "none";
  if (upper === "APPROVED") return "approved";
  if (upper === "REJECTED" || upper === "FAILED") return "rejected";
  if (["PENDING", "IN_PROGRESS", "IN_REVIEW", "NEW"].includes(upper)) return "review";
  // A provider state we don't recognise matches none of the options rather than
  // being filed under the wrong one.
  return "other";
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Each filter reads as a phrase in the sentence: `prefix` in plain text, then the
 * chosen option as the clickable token. `match(row, optionId)` is the whole rule.
 */
export const FILTERS = [
  {
    id: "plan",
    label: "Plan",
    prefix: "con plan",
    options: cerebroPlans.map((plan) => ({ id: plan, label: cerebroPlanLabel(plan) })),
    match: (row, value) => String(row.plan ?? "").toLowerCase() === value,
  },
  {
    id: "membership",
    label: "Membresía",
    prefix: "con membresía",
    options: [
      { id: "active", label: "activa" },
      { id: "lapsed", label: "caducada o cancelada" },
      { id: "none", label: "ninguna" },
    ],
    match: (row, value) => {
      const status = String(row.membershipStatus ?? "").toLowerCase();
      if (value === "none") return !status;
      if (value === "active") return status === "active";
      return Boolean(status) && status !== "active";
    },
  },
  {
    id: "kyc",
    label: "KYC",
    prefix: "con KYC",
    options: [
      { id: "approved", label: "aprobado" },
      { id: "review", label: "en revisión" },
      { id: "rejected", label: "rechazado" },
      { id: "none", label: "sin empezar" },
    ],
    match: (row, value) => kycBucket(row.kycStatus) === value,
  },
  {
    id: "balance",
    label: "Saldo",
    prefix: "",
    options: [
      { id: "funded", label: "con saldo" },
      { id: "empty", label: "sin saldo" },
    ],
    match: (row, value) => num(row.tvlUsd) > FUNDED_USD === (value === "funded"),
  },
  {
    id: "margin",
    label: "Margen",
    prefix: "",
    options: [
      { id: "negative", label: "que nos cuestan dinero" },
      { id: "positive", label: "que nos dejan margen" },
    ],
    match: (row, value) => (value === "negative" ? num(row.netUsd) < 0 : num(row.netUsd) > 0),
  },
  {
    id: "nft",
    label: "NFT founder",
    prefix: "",
    options: [
      { id: "yes", label: "con NFT founder" },
      { id: "no", label: "sin NFT founder" },
    ],
    match: (row, value) => num(row.nftBalance) > 0 === (value === "yes"),
  },
  {
    id: "signup",
    label: "Registro",
    prefix: "registrados en",
    options: [
      { id: "7", label: "los últimos 7 días" },
      { id: "30", label: "los últimos 30 días" },
      { id: "90", label: "los últimos 90 días" },
    ],
    match: (row, value) => {
      const created = new Date(row.createdAt).getTime();
      return Number.isFinite(created) && Date.now() - created <= Number(value) * DAY_MS;
    },
  },
];

const FILTERS_BY_ID = Object.fromEntries(FILTERS.map((filter) => [filter.id, filter]));

export const optionLabel = (filterId, optionId) =>
  FILTERS_BY_ID[filterId]?.options.find((option) => option.id === optionId)?.label ?? optionId;

/**
 * @param {Object} row A `/users` row.
 * @param {Record<string, string>} filters Filter id → option id.
 */
export const matchesFilters = (row, filters) =>
  Object.entries(filters).every(([id, value]) => FILTERS_BY_ID[id]?.match(row, value) ?? true);

/**
 * Questions that set the whole sentence at once. Phrased the way the question gets
 * asked, because the point is that nobody has to know which column answers it.
 */
export const SUGGESTIONS = [
  {
    id: "richest",
    label: "¿Quién tiene más dinero dentro?",
    query: { scope: "all", sort: "tvl", desc: true, filters: {} },
  },
  {
    id: "top-fees",
    label: "¿Quién nos deja más comisiones?",
    query: { scope: "all", sort: "fees", desc: true, filters: {} },
  },
  {
    id: "costly",
    label: "¿Quién nos cuesta más de lo que paga?",
    query: { scope: "all", sort: "net", desc: false, filters: { margin: "negative" } },
  },
  {
    id: "new",
    label: "Nuevos de este mes",
    query: { scope: "all", sort: "created", desc: true, filters: { signup: "30" } },
  },
  {
    id: "kyc-review",
    label: "KYC esperando revisión",
    query: { scope: "all", sort: "created", desc: true, filters: { kyc: "review" } },
  },
  {
    id: "lapsed",
    label: "Membresías que renovar",
    query: { scope: "all", sort: "tvl", desc: true, filters: { membership: "lapsed" } },
  },
];

/** Whether the table's current state is exactly this suggestion. */
export const isSuggestionActive = (suggestion, { scope, sorting, filters }) => {
  const { query } = suggestion;
  const keys = Object.keys(query.filters);
  return (
    query.scope === scope &&
    query.sort === sorting?.id &&
    query.desc === sorting?.desc &&
    keys.length === Object.keys(filters).length &&
    keys.every((key) => filters[key] === query.filters[key])
  );
};
