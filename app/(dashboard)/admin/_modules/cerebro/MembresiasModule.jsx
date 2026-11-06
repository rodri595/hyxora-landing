"use client";

import CancellationsPanel from "./membresias/CancellationsPanel";
import ChurnPanel from "./membresias/ChurnPanel";
import RenewalsBillingPanel from "./membresias/RenewalsBillingPanel";
import StatusOverviewPanel from "./membresias/StatusOverviewPanel";
import TenurePanel from "./membresias/TenurePanel";

/**
 * Cerebro API only (see CLAUDE.md) — the `/memberships/*` block (Trello #670).
 *
 * Four requests for the whole tab, each cached 5 minutes upstream and here:
 * `/memberships/overview` feeds the first two panels and is fetched once, then
 * churn, cancellations and tenure one each. Nothing loads until the tab is opened,
 * and the per-user `/users/{privyId}/membership` is only asked for when a pipeline
 * row is expanded.
 *
 * Ordered from «where are we» to «what do I do about it»: the snapshot, the renewal
 * calendar, the trend, the people to call, and how long the ones who stay have
 * stayed. The same per-user history lives in the users table drawer under
 * «Membresía», so it is one click from either side.
 */
const MembresiasModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <StatusOverviewPanel />
    <RenewalsBillingPanel />
    <ChurnPanel />
    <CancellationsPanel />
    <TenurePanel />
  </div>
);

export default MembresiasModule;
