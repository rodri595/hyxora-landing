"use client";

import Spinner from "@/components/Spinner";
import { cn } from "@/utils";

const RefreshIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M14 8a6 6 0 1 1-1.76-4.24M14 2v4h-4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Refresh button used in the panel headers.
 *
 * @param {Object} props
 * @param {() => void} props.onClick
 * @param {boolean} [props.isLoading]
 * @param {string} [props.label]
 */
export const RefreshButton = ({ onClick, isLoading = false, label = "Actualizar" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    className={cn(
      "flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg border-[0.7px] font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
      isLoading
        ? "border-[rgba(25,54,63,0.08)] text-[rgba(25,54,63,0.35)] cursor-not-allowed"
        : "border-[rgba(25,54,63,0.12)] text-[#19363F] hover:bg-[rgba(25,54,63,0.04)]"
    )}
  >
    {isLoading ? <Spinner className="size-3" /> : <RefreshIcon />}
    {label}
  </button>
);

/**
 * Card shell shared by every Sistema panel.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} [props.meta] Muted qualifier next to the title — the date
 * window a panel is scoped to, typically. Sits on the heading line so it reads as part
 * of the title rather than as prose the eye skips.
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.action] Rendered top-right, typically a RefreshButton.
 * Below `sm` the header stacks and this row goes full-width, so a filter dropdown
 * beside the button drops onto its own line instead of forcing the panel wider than
 * the viewport — which is what made whole tabs scroll sideways on a phone. The
 * `[&>div]` rules reach into the wrapper each caller passes, because they all pass a
 * `flex` row and rewriting twenty of them to wrap is the same fix twenty times.
 * @param {"neutral" | "warning"} [props.tone] Tints the border when something needs attention.
 * @param {React.ReactNode} [props.children]
 */
const Panel = ({ title, meta, description, action, tone = "neutral", children }) => (
  <section
    className={cn(
      "flex min-w-0 flex-col rounded-xl border-[0.7px] bg-white px-2.5 py-2.5 sm:px-4 sm:py-3.5",
      tone === "warning"
        ? "border-red-200 shadow-[0px_2px_12px_0px_rgba(220,38,38,0.06)]"
        : "border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.06)]"
    )}
  >
    <div className="flex flex-col gap-2 mb-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <h3 className="flex min-w-0 flex-wrap items-baseline gap-x-2 font-inter text-[13px] font-semibold text-[#19363F] tracking-[-0.52px]">
        {title}
        {meta && (
          <span className="font-normal tabular-nums text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.4)]">
            {meta}
          </span>
        )}
      </h3>
      {action && (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end [&>div]:max-sm:w-full [&>div]:max-sm:flex-wrap">
          {action}
        </div>
      )}
    </div>

    {description && (
      <p className="font-inter text-[11px] leading-[1.6] text-[rgba(25,54,63,0.5)] tracking-[-0.44px] max-w-[820px]">
        {description}
      </p>
    )}

    {children && <div className="mt-3.5">{children}</div>}
  </section>
);

export default Panel;
