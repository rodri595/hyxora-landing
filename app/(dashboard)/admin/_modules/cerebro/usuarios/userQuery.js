import {
  cerebroMembershipGroup,
  cerebroMembershipKey,
  cerebroPlanLabel,
  cerebroPlans,
} from "@/constants/cerebro";
import { FUNDED_USD } from "@/hooks/cerebro/useGetUserActivation";
import { INTERVALS, PAYMENT_TYPES, countryName, daysUntil, periodEnd } from "./appUsers";

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
 * The countries offered by name. Anyone else is «de otro país», so the list never has
 * to be complete to be exact.
 */
const COUNTRY_CODES = ["ES", "MX", "CO", "VE", "AR", "CL", "PE", "EC", "US"];

/** Days from today to a date; between `from` and `to` inclusive. */
const within = (value, from, to) => {
  const days = daysUntil(value);
  return days !== null && days >= from && days <= to;
};

const displayName = (row) =>
  row.fullName || [row.firstName, row.lastName].filter(Boolean).join(" ") || row.founderName;

/**
 * Every membership status, raw or derived, and the option it belongs to. The six
 * buckets after «vigente» split them with no overlap — each user lands in exactly
 * one — and «vigente» is the sum of the first three, the «who has a plan right now»
 * question. Whether a renewal is paid or manual is the «Forma de pago» filter's job,
 * so it isn't repeated here.
 */
const MEMBERSHIP_BUCKETS = {
  upToDate: ["active"],
  permanent: ["founder"],
  endingSoon: ["renewing", "expiring"],
  atRisk: ["toCancel", "toDowngrade", "pendingPayment"],
  overdue: ["notRenewed", "expired"],
  gone: ["cancelled", "suspended"],
  none: ["none"],
};
MEMBERSHIP_BUCKETS.current = [
  ...MEMBERSHIP_BUCKETS.upToDate,
  ...MEMBERSHIP_BUCKETS.permanent,
  ...MEMBERSHIP_BUCKETS.endingSoon,
  ...MEMBERSHIP_BUCKETS.atRisk,
];

const KNOWN_STATUSES = new Set(Object.values(MEMBERSHIP_BUCKETS).flat());

/**
 * The filter bar's sections, in order. Each filter names its group, and the bar and
 * the «¿Qué significa cada filtro?» guide both lay filters out by these.
 */
export const FILTER_GROUPS = [
  { id: "membership", label: "Membresía" },
  { id: "contact", label: "Contacto" },
  { id: "money", label: "Dinero" },
  { id: "account", label: "Cuenta" },
];

/**
 * Each filter reads as a phrase in the sentence: `prefix` in plain text, then the
 * chosen option as the clickable token. `match(row, optionId)` is the whole rule.
 *
 * `description` and each option's `hint` are what the guide and the menus show, in
 * the client's words — written for someone who has never seen the API.
 */
export const FILTERS = [
  {
    id: "membership",
    group: "membership",
    label: "Estado de la membresía",
    prefix: "con membresía",
    description:
      "En qué punto está su plan. Cada usuario cae en una sola opción, salvo «vigente», que suma las cuatro siguientes.",
    options: [
      {
        id: "current",
        label: "vigente",
        hint: "Tiene un plan en curso ahora mismo: al día, founder, terminando pronto o en riesgo.",
      },
      {
        id: "upToDate",
        label: "al día",
        hint: "Plan activo, y su renovación o fin queda a más de 10 días.",
      },
      {
        id: "permanent",
        label: "founder permanente",
        hint: "Tiene el NFT founder: su plan no caduca mientras lo conserve.",
      },
      {
        id: "endingSoon",
        label: "que termina pronto",
        hint: "Plan activo que acaba en los próximos 10 días: si es de pago se renueva; si es manual, caduca.",
      },
      {
        id: "atRisk",
        label: "en riesgo",
        hint: "Sigue dentro de lo que pagó, pero ha pedido cancelar o bajar de plan, o tiene un pago pendiente.",
      },
      {
        id: "overdue",
        label: "vencida",
        hint: "La fecha ya pasó: de pago y sin cobro registrado, o manual y caducada (la app ya le pide mejorar el plan). Incluye founders que transfirieron el NFT.",
      },
      {
        id: "gone",
        label: "cancelada o suspendida",
        hint: "La membresía terminó, o el backend la suspendió.",
      },
      { id: "none", label: "ninguna", hint: "Nunca ha tenido un plan de pago." },
    ],
    match: (row, value) => {
      const key = cerebroMembershipKey(row.membershipStatus);
      if (MEMBERSHIP_BUCKETS[value]?.includes(key)) return true;
      // A status this file doesn't know yet is read as lapsed, like everywhere else.
      return (
        value === "gone" &&
        !KNOWN_STATUSES.has(key) &&
        cerebroMembershipGroup(row.membershipStatus) === "lapsed"
      );
    },
  },
  {
    id: "plan",
    group: "membership",
    label: "Plan",
    prefix: "con plan",
    description: "El plan que tiene ahora: el de la app y, si la app no lo da, el de Cerebro.",
    options: cerebroPlans.map((plan) => ({ id: plan, label: cerebroPlanLabel(plan) })),
    // The plan the column shows: app-api's live one, Cerebro's when the app has none.
    match: (row, value) => String(row.planName ?? row.plan ?? "").toLowerCase() === value,
  },
  {
    id: "trial",
    group: "membership",
    label: "Prueba gratuita",
    prefix: "",
    description: "Separa a quien está probando gratis de quien paga.",
    // app-api's `isTrial` (#223). «De pago» keeps everyone not flagged as a trial —
    // including rows from before the field ships, where it is still unknown.
    options: [
      {
        id: "paid",
        label: "de pago (sin prueba gratuita)",
        hint: "Todos menos los que están en la prueba gratuita.",
      },
      {
        id: "yes",
        label: "en prueba gratuita",
        hint: "Probando sin pagar. Su prueba termina en «Final membresía».",
      },
    ],
    match: (row, value) => (value === "yes" ? row.isTrial === true : row.isTrial !== true),
  },
  {
    id: "ending",
    group: "membership",
    label: "Final de membresía",
    prefix: "",
    description:
      "Cuándo termina su periodo actual: la próxima renovación o, si va a cancelar, el día de la baja.",
    // «Final membresía» as the column has it: the cancellation date for someone
    // leaving or on a trial, the renewal date for everyone else.
    options: [
      { id: "7", label: "que terminan en 7 días", hint: "Acaba esta semana." },
      { id: "30", label: "que terminan en 30 días", hint: "Acaba en el próximo mes." },
      { id: "past", label: "con la fecha de fin pasada", hint: "La fecha ya pasó." },
      {
        id: "none",
        label: "sin fecha de fin",
        hint: "No tiene plan, es founder permanente, o la app no da la fecha.",
      },
    ],
    match: (row, value) => {
      const end = periodEnd(row);
      if (value === "none") return daysUntil(end) === null;
      if (value === "past") return (daysUntil(end) ?? 0) < 0;
      return within(end, 0, Number(value));
    },
  },
  {
    id: "renewed",
    group: "membership",
    label: "Última renovación",
    prefix: "",
    description: "El último cobro registrado del plan. Solo se registra desde el 10/11/2026.",
    options: [
      {
        id: "30",
        label: "que renovaron en los últimos 30 días",
        hint: "Pagó su plan en el último mes.",
      },
      {
        id: "none",
        label: "sin renovación registrada",
        hint: "Ningún cobro desde el 10/11/2026. No significa que no haya pagado nunca.",
      },
    ],
    match: (row, value) =>
      value === "none"
        ? !row.membershipLastRenewedAt
        : within(row.membershipLastRenewedAt, -Number(value), 0),
  },
  {
    id: "payment",
    group: "membership",
    label: "Forma de pago",
    prefix: "con forma de pago",
    description: "Cómo se paga el plan.",
    // app-api's `membershipPaymentType`, joined onto the row before filtering. A
    // value outside these three matches none of them rather than the wrong one.
    options: [
      { id: "stripe", label: PAYMENT_TYPES.stripe, hint: "Tarjeta: se cobra sola cada periodo." },
      { id: "onchain", label: PAYMENT_TYPES.onchain, hint: "Pago con cripto desde la app." },
      {
        id: "manual",
        label: PAYMENT_TYPES.manual,
        hint: "Alta a mano o founder: no se cobra sola. Una alta a mano caduca en su fecha; un founder con el NFT, nunca.",
      },
      { id: "none", label: "ninguna", hint: "Sin plan de pago." },
    ],
    match: (row, value) => String(row.membershipPaymentType || "none").toLowerCase() === value,
  },
  {
    id: "interval",
    group: "membership",
    label: "Periodicidad",
    prefix: "",
    description: "Cada cuánto se renueva el plan.",
    options: [
      ...Object.entries(INTERVALS).map(([id, label]) => ({
        id,
        label: `de pago ${label.toLowerCase()}`,
      })),
      {
        id: "none",
        label: "sin periodicidad",
        hint: "Lo normal en manuales y founders, que no se renuevan.",
      },
    ],
    match: (row, value) => (row.membershipInterval || "none") === value,
  },
  {
    id: "country",
    group: "contact",
    label: "País",
    prefix: "",
    description: "El país de su perfil en la app. La mayoría aún no lo ha rellenado.",
    options: [
      ...COUNTRY_CODES.map((code) => ({ id: code, label: `de ${countryName(code)}` })),
      { id: "other", label: "de otro país", hint: "Un país que no está en esta lista." },
      { id: "none", label: "sin país indicado", hint: "No ha puesto país en su perfil." },
    ],
    match: (row, value) => {
      const code = String(row.country ?? "").toUpperCase();
      if (value === "none") return !code;
      if (value === "other") return Boolean(code) && !COUNTRY_CODES.includes(code);
      return code === value;
    },
  },
  {
    id: "contact",
    group: "contact",
    label: "Datos para el CRM",
    prefix: "",
    description: "Lo que le falta a un contacto antes de importarlo al CRM.",
    // Phone comes from the founders site; name and the app record from app-api.
    options: [
      { id: "phone", label: "con teléfono", hint: "Tiene teléfono (de la web founders)." },
      { id: "noPhone", label: "sin teléfono", hint: "No hay teléfono en la web founders." },
      {
        id: "noName",
        label: "sin nombre",
        hint: "Sin nombre ni en la app ni en la web founders.",
      },
      {
        id: "noApp",
        label: "sin ficha en la app",
        hint: "No aparece en la lista de usuarios de la app, así que le faltan nombre, país y fechas.",
      },
    ],
    match: (row, value) => {
      if (value === "phone") return Boolean(row.founderPhone);
      if (value === "noPhone") return !row.founderPhone;
      if (value === "noName") return !displayName(row);
      return !row.appMatch;
    },
  },
  {
    id: "balance",
    group: "money",
    label: "Saldo",
    prefix: "",
    description: "Si tiene dinero dentro de Hyxora.",
    options: [
      { id: "funded", label: "con saldo", hint: "Más de $0,50 dentro." },
      { id: "empty", label: "sin saldo", hint: "$0,50 o menos." },
    ],
    match: (row, value) => num(row.tvlUsd) > FUNDED_USD === (value === "funded"),
  },
  {
    id: "margin",
    group: "money",
    label: "Margen",
    prefix: "",
    description:
      "Lo que nos deja en comisiones menos lo que nos cuesta pagarle el gas de sus operaciones.",
    options: [
      {
        id: "negative",
        label: "que nos cuestan dinero",
        hint: "Le pagamos más gas del que nos deja en comisiones.",
      },
      {
        id: "positive",
        label: "que nos dejan margen",
        hint: "Nos deja más en comisiones de lo que cuesta su gas.",
      },
    ],
    match: (row, value) => (value === "negative" ? num(row.netUsd) < 0 : num(row.netUsd) > 0),
  },
  {
    id: "nft",
    group: "money",
    label: "NFT founder",
    prefix: "",
    description: "Si tiene el NFT de founder, que le da el plan founder para siempre.",
    options: [
      { id: "yes", label: "con NFT founder", hint: "Su plan founder es permanente." },
      {
        id: "no",
        label: "sin NFT founder",
        hint: "Con plan founder, quiere decir que transfirió el NFT y su plan ya puede caducar.",
      },
    ],
    match: (row, value) => num(row.nftBalance) > 0 === (value === "yes"),
  },
  {
    id: "kyc",
    group: "account",
    label: "KYC",
    prefix: "con KYC",
    description: "La verificación de identidad.",
    options: [
      { id: "approved", label: "aprobado", hint: "Identidad verificada." },
      { id: "review", label: "en revisión", hint: "Esperando la revisión del proveedor." },
      { id: "rejected", label: "rechazado", hint: "El proveedor la rechazó." },
      { id: "none", label: "sin empezar", hint: "Nunca la ha empezado." },
    ],
    match: (row, value) => kycBucket(row.kycStatus) === value,
  },
  {
    id: "signup",
    group: "account",
    label: "Registro",
    prefix: "registrados en",
    description: "Cuándo creó su cuenta.",
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

/** Every text field the search box looks in, on a row already joined to founders and app-api. */
const searchableText = (row) => [
  row.email,
  row.founderEmail,
  row.username,
  row.twitterUsername,
  row.fullName,
  [row.firstName, row.lastName].filter(Boolean).join(" "),
  row.founderName,
  row.founderPhone,
  row.privyId,
  row.safeAddress,
  row.signerAddress,
  row.solanaAddress,
];

const digits = (value) => String(value ?? "").replace(/\D/g, "");

/**
 * The search box, as exact text: case-insensitive "contains", over identity, names,
 * phone and every wallet.
 *
 * Not `/users`' own `search`, on purpose. Cerebro ported the old dashboard's
 * `userSearchFilter`, which ORs a `word_similarity(…) > 0.3` fuzzy match onto the
 * LIKE — and pg_trgm splits an email on its punctuation, so a full address like
 * `ana.123@hotmail.com` shares enough trigrams with any `…@gmail.com` to clear 0.3.
 * Typing a whole email returned nearly everyone. It also never saw the name, which
 * only app-api has. So searching runs over the full sweep, here.
 *
 * A query with three or more digits also matches a phone digit-for-digit, so
 * "600112233" finds "+34 600 11 22 33".
 *
 * @param {Object} row
 * @param {string | undefined} search
 */
export const matchesSearch = (row, search) => {
  const query = String(search ?? "")
    .trim()
    .toLowerCase();
  if (!query) return true;
  if (
    searchableText(row).some(
      (value) => typeof value === "string" && value.toLowerCase().includes(query)
    )
  ) {
    return true;
  }
  const queryDigits = digits(query);
  return queryDigits.length >= 3 && digits(row.founderPhone).includes(queryDigits);
};

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
    label: "Membresías vencidas",
    query: { scope: "all", sort: "tvl", desc: true, filters: { membership: "overdue" } },
  },
  {
    id: "paying",
    label: "Miembros de pago",
    query: {
      scope: "all",
      sort: "tvl",
      desc: true,
      filters: { membership: "current", trial: "paid" },
    },
  },
  {
    id: "ending-month",
    label: "¿Qué membresías terminan este mes?",
    query: { scope: "all", sort: "tvl", desc: true, filters: { ending: "30" } },
  },
  {
    id: "expiring-manual",
    label: "Manuales a punto de caducar",
    query: {
      scope: "all",
      sort: "tvl",
      desc: true,
      filters: { membership: "endingSoon", payment: "manual" },
    },
  },
  {
    // A founder's plan is permanent while they hold the NFT, so the founders worth a
    // look are the ones still on the plan without it.
    id: "founders-transferred",
    label: "Founders que transfirieron el NFT",
    query: {
      scope: "all",
      sort: "tvl",
      desc: true,
      filters: { plan: "founder", nft: "no" },
    },
  },
  {
    id: "trials",
    label: "Pruebas gratuitas",
    query: { scope: "all", sort: "created", desc: true, filters: { trial: "yes" } },
  },
  {
    id: "renewed-month",
    label: "Renovaron este mes",
    query: { scope: "all", sort: "tvl", desc: true, filters: { renewed: "30" } },
  },
  {
    id: "no-phone",
    label: "¿A quién le falta el teléfono?",
    query: { scope: "all", sort: "tvl", desc: true, filters: { contact: "noPhone" } },
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
