"use client";

import { cn } from "@/utils";
import { formatNumber } from "@/utils/format";

/** Above this, the host is answering but slowly enough to be worth noticing. */
const SLOW_MS = 1000;

const ENV_LABELS = { prod: "Producción", staging: "Staging" };

/**
 * One host: a dot, who it is, and how it answered.
 *
 * The whole row carries the URL as its tooltip. It used to be a table column,
 * which cost a sixth of the width to show four near-identical strings — the
 * question this block answers is «is it up», and the URL only matters once the
 * answer is no.
 */
const ServiceRow = ({ service }) => {
  const isUp = service.status === "up";
  const isSlow = isUp && service.latencyMs > SLOW_MS;

  return (
    <div
      title={service.url}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border-[0.7px] px-3 py-2",
        isUp
          ? "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.02)]"
          : "border-red-200 bg-red-50/70"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn("size-[7px] shrink-0 rounded-full", isUp ? "bg-emerald-500" : "bg-red-500")}
        />
        <span className="truncate font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
          {service.name}
          <span className="text-[rgba(25,54,63,0.25)]"> · </span>
          <span className="font-normal text-[rgba(25,54,63,0.55)]">
            {ENV_LABELS[service.env] ?? service.env}
          </span>
        </span>
      </div>

      <span
        className={cn(
          "shrink-0 font-inter text-[10px] tabular-nums tracking-[-0.4px]",
          !isUp
            ? "font-medium text-red-600"
            : isSlow
              ? "text-amber-700"
              : "text-[rgba(25,54,63,0.5)]"
        )}
      >
        {isUp ? (
          <>
            {formatNumber(service.latencyMs)} ms
            {service.httpStatus !== null && (
              <span className="text-[rgba(25,54,63,0.3)]"> · {service.httpStatus}</span>
            )}
          </>
        ) : (
          `caído · ${service.error ?? "sin respuesta"}`
        )}
      </span>
    </div>
  );
};

/**
 * Liveness of the API and the App, staging and production.
 *
 * A 4xx counts as up: these hosts are auth-gated, so being turned away proves
 * the process is answering — which is why a row can read 401 next to a green
 * dot. A 5xx does not, so the status column can also read «caído · HTTP 502».
 *
 * @param {Object} props
 * @param {Array} props.services
 */
const ServiceGrid = ({ services }) => (
  <div className="grid gap-2 sm:grid-cols-2">
    {services.map((service) => (
      <ServiceRow key={`${service.name}-${service.env}`} service={service} />
    ))}
  </div>
);

export default ServiceGrid;
