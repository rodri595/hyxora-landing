// The tutorial model on the backend only takes plain strings, so anything we
// need per video beyond its name — today the manual `order`, tomorrow whatever
// comes next — travels packed inside `title` as JSON:
//
//   {"title":"Tu primer depósito sin estrés","order":"3"}
//
// Titles written before this exist as plain strings, and so does any title
// saved without an order, so both shapes have to read back cleanly. The rule:
// everything that READS a tutorial goes through `parseTutorialTitle` (the three
// decorators do it once, so components keep using `video.title` unchanged), and
// everything that WRITES one goes through `buildTutorialTitle` (the create and
// edit hooks do it, so callers keep passing a plain `title` + `order`).

/**
 * Coerce an order value — `"3"`, `3`, `""`, `null` — into a number or null.
 * @param {unknown} value
 * @return {number|null}
 */
const toOrder = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

/** Split a decoded payload into the fields we know plus everything else. */
const fromPayload = (payload) => {
  const { title, order, ...meta } = payload;
  return {
    title: typeof title === "string" ? title : "",
    order: toOrder(order),
    meta,
  };
};

/**
 * Whether a stored title carries a JSON payload rather than a plain name.
 * Useful as a guard; `parseTutorialTitle` already handles both on its own.
 *
 * @param {unknown} raw
 * @return {boolean}
 */
export const isPackedTitle = (raw) => {
  if (typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed);
  } catch {
    return false;
  }
};

/**
 * Read a stored title, packed or plain. Never throws: anything that doesn't
 * decode into an object is handed back as the title it looks like, so a legit
 * name that happens to start with "{" survives untouched.
 *
 * @param {unknown} raw - the `title` field exactly as the API sent it.
 * @return {{ title: string, order: number|null, meta: Object }}
 */
export const parseTutorialTitle = (raw) => {
  if (raw == null) return { title: "", order: null, meta: {} };
  // Defensive: if the backend ever stops stringifying, take the object as-is.
  if (typeof raw === "object" && !Array.isArray(raw)) return fromPayload(raw);
  if (typeof raw !== "string") return { title: String(raw), order: null, meta: {} };

  const plain = { title: raw, order: null, meta: {} };
  // Cheap guard so ordinary titles never pay for a try/catch.
  if (!raw.trim().startsWith("{")) return plain;
  try {
    const parsed = JSON.parse(raw.trim());
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return plain;
    return fromPayload(parsed);
  } catch {
    return plain;
  }
};

/**
 * Pack a title plus its metadata back into the single string the backend takes.
 * With nothing worth storing alongside it, the plain title goes through as-is —
 * a tutorial that never gets an order keeps a readable value in the database.
 *
 * @param {{ title?: string, order?: number|string, [key: string]: unknown }} input
 * @return {string}
 */
export const buildTutorialTitle = ({ title = "", order, ...meta } = {}) => {
  const name = String(title ?? "").trim();
  const normalized = toOrder(order);

  // Future fields ride along, but empties are dropped rather than stored blank.
  const extras = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null || value === "") continue;
    extras[key] = value;
  }

  if (normalized === null && Object.keys(extras).length === 0) return name;
  return JSON.stringify({
    title: name,
    order: normalized === null ? "" : String(normalized),
    ...extras,
  });
};

/**
 * The order of a video, whether it's already decorated (`video.order`) or still
 * raw from the API (packed in `video.title`).
 *
 * @param {Object} video
 * @return {number|null}
 */
export const tutorialOrder = (video) => {
  const direct = toOrder(video?.order);
  if (direct !== null) return direct;
  return parseTutorialTitle(video?.title).order;
};

/** Undated videos sink to the bottom instead of leading an oldest-first list. */
const publishedTime = (video) => {
  const t = Date.parse(video?.publishedAt ?? video?.createdAt ?? "");
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
};

/**
 * Sort comparator: manual order first, ascending. Videos with no number yet —
 * and ties between two sharing one — fall back to oldest-first, which is how
 * the academy read before the order field existed.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {number}
 */
export const compareTutorialOrder = (a, b) => {
  const oa = tutorialOrder(a);
  const ob = tutorialOrder(b);
  if (oa !== ob) {
    if (oa === null) return 1;
    if (ob === null) return -1;
    return oa - ob;
  }
  return publishedTime(a) - publishedTime(b);
};

/**
 * Ordered copy of a tutorial list. Copies first — the arrays handed out by
 * React Query are the cache itself, and sorting one in place mutates it.
 *
 * @param {Array} list
 * @return {Array}
 */
export const sortTutorials = (list) => [...(list ?? [])].sort(compareTutorialOrder);
