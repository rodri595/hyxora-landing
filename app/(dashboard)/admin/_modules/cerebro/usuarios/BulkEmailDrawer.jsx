"use client";

import CreateEmailSidebar from "@/components/CreateEmailSidebar";
import { findFounderUser } from "./founders";

/** Narrower than the detail drawer: this one holds a form, not a transactions table. */
export const BULK_EMAIL_DRAWER_WIDTH = 420;

/**
 * Who a selection of `/users` rows can actually be written to.
 *
 * A row's own email first, then the founders account it joins to — the same fallback
 * the user drawer's «Email» tab uses, because an X login has no email on Cerebro's
 * side and may well have one on the founders site. Deduplicated case-insensitively:
 * two rows sharing an address must not get the email twice.
 *
 * @param {Object[]} rows Selected `/users` rows.
 * @param {import("./founders").FounderIndex} founderIndex
 * @return {{ emails: string[], selected: number, missing: number }}
 */
export const collectRecipients = (rows, founderIndex) => {
  const seen = new Set();
  const emails = [];
  let missing = 0;

  for (const row of rows) {
    const email = row.email || findFounderUser(founderIndex, row)?.user?.email;
    if (!email) {
      missing += 1;
      continue;
    }
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(email);
  }

  return { emails, selected: rows.length, missing };
};

/**
 * The Emails tab's composer, addressed to the rows ticked in the users table.
 *
 * It runs `embedded` for the same reason the user drawer's does: that drops «Añadir
 * todos», which from a hand-picked selection is one click away from mailing everyone.
 * The recipient list underneath stays editable, so a row can still be dropped or an
 * outside address added before sending.
 *
 * @param {Object} props
 * @param {string[]} props.emails Read once on mount — the caller keys this component
 * per opening so a new selection is a new composer.
 * @param {number} props.selected Rows that were ticked.
 * @param {number} props.missing Of those, how many have no email on either side.
 * @param {() => void} props.onClose
 */
const BulkEmailDrawer = ({ emails, selected, missing, onClose }) => (
  <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
    <div className="flex shrink-0 items-start justify-between gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
          Email a la selección
        </p>
        <p className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.75)]">
          {selected} {selected === 1 ? "usuario marcado" : "usuarios marcados"} · {emails.length}{" "}
          con correo
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar panel"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[rgba(25,54,63,0.68)] transition-colors hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F]"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path
            d="M8.5 1.5l-7 7M1.5 1.5l7 7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>

    {missing > 0 && (
      <p className="shrink-0 border-b-[0.7px] border-amber-200 bg-amber-50/60 px-4 py-2 font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-amber-700">
        {missing === 1
          ? "1 de los marcados no tiene correo ni en Cerebro ni en la web founders y no lo recibirá."
          : `${missing} de los marcados no tienen correo ni en Cerebro ni en la web founders y no lo recibirán.`}
      </p>
    )}

    {/* A modal body over a backdrop: the composer's own scroller must not hand the
        gesture on to the admin page behind it. */}
    <div className="min-h-0 flex-1" data-lenis-prevent>
      <CreateEmailSidebar embedded initialEmails={emails} />
    </div>
  </div>
);

export default BulkEmailDrawer;
