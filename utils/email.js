// SES rows list the real recipients in `bcc` — `to` is the noreply mailbox the
// message was addressed to. So anything showing "who got this" reads bcc first
// and only falls back to `to` for rows sent without one.
export const toAddressList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

export const emailRecipients = (email) => {
  const bcc = toAddressList(email?.bcc);
  return bcc.length ? bcc : toAddressList(email?.to);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value) => EMAIL_RE.test(String(value ?? "").trim());
