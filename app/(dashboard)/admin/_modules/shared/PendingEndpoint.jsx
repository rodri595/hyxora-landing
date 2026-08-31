"use client";

import CopyButton from "@/components/CopyButton";

/**
 * Shown where the ported dashboard has a panel but the Cerebro API (admin.md)
 * exposes no endpoint for it. Deliberately renders nothing that looks like data —
 * these panels carry balances, fees and error counts, and a mocked number here is
 * the kind of thing someone acts on.
 *
 * Doubles as the request to the backend team, so it names the endpoint, the
 * fields, and optionally the expected response shape with a copy button.
 *
 * @param {Object} props
 * @param {string} props.needs One-line summary of the missing data.
 * @param {string[]} [props.fields] Endpoints / params to request.
 * @param {unknown} [props.shape] Example response, rendered as JSON for the dev.
 */
const PendingEndpoint = ({ needs, fields = [], shape }) => {
  const shapeJson = shape ? JSON.stringify(shape, null, 2) : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border-[0.7px] border-dashed border-[rgba(25,54,63,0.15)] bg-[rgba(25,54,63,0.02)] px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-[rgba(25,54,63,0.25)]" />
        <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)]">
          Pendiente de endpoint
        </span>
      </div>

      <p className="font-inter text-[11px] leading-[1.6] tracking-[-0.44px] text-[rgba(25,54,63,0.55)]">
        {needs}
      </p>

      {fields.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {fields.map((field) => (
            <code
              key={field}
              className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.55)] bg-white border-[0.7px] border-[rgba(25,54,63,0.1)] rounded-[5px] px-1.5 py-0.5"
            >
              {field}
            </code>
          ))}
        </div>
      )}

      {shapeJson && (
        <details className="mt-0.5">
          <summary className="cursor-pointer font-inter text-[10px] font-medium text-[rgba(25,54,63,0.45)] hover:text-[#19363F] tracking-[-0.4px] transition-colors list-none">
            Forma esperada de la respuesta
          </summary>
          <div className="relative mt-1.5">
            <div className="absolute top-1.5 right-1.5 z-1">
              <CopyButton text={shapeJson} />
            </div>
            <pre
              data-lenis-prevent
              className="max-h-[260px] overflow-auto overscroll-contain rounded-lg bg-white border-[0.7px] border-[rgba(25,54,63,0.1)] p-2.5 pr-9 font-mono text-[10px] leading-[1.5] text-[rgba(25,54,63,0.65)]"
            >
              {shapeJson}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default PendingEndpoint;
