"use client";

import { cn } from "@/utils";
import { formatNumber } from "@/utils/format";
import { haptic } from "@/utils/haptics";
import { useEffect, useState } from "react";
import {
  FILTERS,
  SCOPE_OPTIONS,
  SORT_OPTIONS,
  SUGGESTIONS,
  isSuggestionActive,
  optionLabel,
  sortLabel,
} from "./userQuery";

const Sparkle = ({ spinning }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={cn("shrink-0", spinning && "animate-spin motion-reduce:animate-none")}
  >
    <defs>
      <linearGradient id="hx-prompt-sparkle" x1="0" y1="0" x2="16" y2="16">
        <stop offset="0" stopColor="#2D68FF" />
        <stop offset="1" stopColor="#A444F3" />
      </linearGradient>
    </defs>
    <path
      d="M8 1c.4 3.3 1.7 4.6 5 5-3.3.4-4.6 1.7-5 5-.4-3.3-1.7-4.6-5-5 3.3-.4 4.6-1.7 5-5Z"
      fill="url(#hx-prompt-sparkle)"
    />
    <path
      d="M13 10.5c.15 1.2.6 1.65 1.8 1.8-1.2.15-1.65.6-1.8 1.8-.15-1.2-.6-1.65-1.8-1.8 1.2-.15 1.65-.6 1.8-1.8Z"
      fill="url(#hx-prompt-sparkle)"
    />
  </svg>
);

const Chevron = () => (
  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Check = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path
      d="M2 5l2.5 2.5L8 3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TOKEN =
  "inline-flex items-center gap-1 rounded-md px-1.5 py-px font-medium text-blue-700 bg-blue-50 ring-1 ring-inset ring-blue-200 transition-[background-color,color,scale] duration-150 hover:bg-blue-100 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500";

/**
 * One clickable word in the sentence, with the options it can take.
 *
 * Follows `SelectDropdown`: a fixed click-outside layer under an absolute panel. The
 * panel scales in from the token it belongs to — it is anchored there, so growing out
 * of the middle would read as coming from nowhere. Keyed by label so a changed answer
 * fades in and the eye catches which word moved.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.ariaLabel
 * @param {Array<{ heading?: string, options: Array<{ id: string, label: string, selected?: boolean, onSelect: () => void }> }>} props.sections
 * @param {() => void} [props.onRemove] Adds a × and a «Quitar filtro» row.
 * @param {"token" | "add"} [props.variant]
 */
const TokenMenu = ({ label, ariaLabel, sections, onRemove, variant = "token" }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const choose = (onSelect) => {
    haptic("selection");
    onSelect();
    setOpen(false);
  };

  return (
    <span className="relative inline-flex items-center align-baseline">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          variant === "add"
            ? "inline-flex items-center gap-1 rounded-md border border-dashed border-[rgba(25,54,63,0.3)] px-1.5 font-medium text-[rgba(25,54,63,0.75)] transition-[background-color,color,scale] duration-150 hover:bg-[rgba(25,54,63,0.04)] hover:text-[#19363F] active:scale-[0.97]"
            : TOKEN,
          onRemove && "rounded-r-none pr-1"
        )}
      >
        <span key={label} className="transition-opacity duration-200 starting:opacity-0">
          {label}
        </span>
        {variant === "token" && <Chevron />}
      </button>

      {onRemove && (
        <button
          type="button"
          aria-label={`Quitar filtro: ${label}`}
          onClick={() => {
            haptic("selection");
            onRemove();
          }}
          className="inline-flex items-center self-stretch rounded-r-md bg-blue-50 px-1 text-blue-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-100"
        >
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M2 2l6 6M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            role="button"
            tabIndex={-1}
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
          />
          {/* data-lenis-prevent: the list scrolls inside itself, and Lenis would
              otherwise take the wheel for the page. */}
          <div
            data-lenis-prevent
            className="absolute left-0 top-[calc(100%+6px)] z-40 flex max-h-72 w-max min-w-44 max-w-[min(18rem,calc(100vw-2rem))] origin-top-left flex-col overflow-y-auto overscroll-contain rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.1)] bg-white p-1 shadow-[0px_6px_20px_0px_rgba(25,54,63,0.12)] transition-[opacity,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] starting:scale-95 starting:opacity-0"
          >
            {sections.map((section, index) => (
              <div
                key={section.heading ?? index}
                className={cn(
                  index > 0 && "mt-1 border-t-[0.7px] border-[rgba(25,54,63,0.08)] pt-1"
                )}
              >
                {section.heading && (
                  <p className="px-2.5 pt-1 pb-0.5 font-inter text-[10px] font-semibold uppercase tracking-[0.5px] text-[rgba(25,54,63,0.68)]">
                    {section.heading}
                  </p>
                )}
                {section.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={Boolean(option.selected)}
                    onClick={() => choose(option.onSelect)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-left font-inter text-[12px] font-medium tracking-[-0.44px] text-[#19363F] transition-colors hover:bg-[rgba(25,54,63,0.05)]",
                      option.selected && "bg-blue-50 text-blue-700 hover:bg-blue-50"
                    )}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {option.selected && (
                      <span className="ml-auto shrink-0">
                        <Check />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {onRemove && (
              <button
                type="button"
                onClick={() => choose(onRemove)}
                className="mt-1 flex w-full items-center rounded-[7px] border-t-[0.7px] border-[rgba(25,54,63,0.08)] px-2.5 py-1.5 text-left font-inter text-[12px] font-medium tracking-[-0.44px] text-red-700 transition-colors hover:bg-red-50"
              >
                Quitar filtro
              </button>
            )}
          </div>
        </>
      )}
    </span>
  );
};

/**
 * The users table, asked in words.
 *
 * Everything the table can do reads as one sentence — «Muéstrame los usuarios
 * inactivos con plan Premium, ordenados por más dinero dentro» — and every blue word
 * is a menu. Nothing is typed and nothing is interpreted: each word is a control that
 * maps to one `/users` parameter or one filter in `userQuery.js`, so the sentence can
 * never claim something the table isn't doing. The suggestions underneath set the
 * whole sentence at once for the questions people actually come here with.
 *
 * It looks like an AI prompt on purpose — that is the affordance people already know
 * for "ask this in plain language" — but there is no model and no latency added for
 * effect. The sparkle turns only while a real request is in flight.
 *
 * @param {Object} props
 * @param {"all" | "inactive"} props.scope
 * @param {{ id: string, desc: boolean } | undefined} props.sorting
 * @param {Record<string, string>} props.filters
 * @param {string} props.search
 * @param {(next: { scope?: string, sorting?: { id: string, desc: boolean }, filters?: Record<string, string> }) => void} props.onChange
 * @param {() => void} props.onClearSearch
 * @param {() => void} props.onReset
 * @param {boolean} props.isDefault
 * @param {{ count: number | null, population: number | null, isLoading: boolean, isFetching: boolean, isError: boolean }} props.result
 * `count` null once loaded means the total is unknown, not zero.
 */
const UserQueryPrompt = ({
  scope,
  sorting,
  filters,
  search,
  onChange,
  onClearSearch,
  onReset,
  isDefault,
  result,
}) => {
  const activeFilters = FILTERS.filter((filter) => filters[filter.id]);
  const inactiveFilters = FILTERS.filter((filter) => !filters[filter.id]);
  const refined = activeFilters.length > 0;

  const setFilter = (id, value) => {
    const next = { ...filters };
    if (value) next[id] = value;
    else delete next[id];
    onChange({ filters: next });
  };

  const scopeLabel = SCOPE_OPTIONS.find((option) => option.id === scope)?.label ?? scope;

  return (
    <div className="mb-3 flex flex-col gap-2">
      {/* Gradient hairline via two backgrounds: white on the padding box, the
          blue→violet on the border box showing through a transparent border. */}
      <div className="rounded-xl border border-transparent shadow-prompt-input [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(120deg,rgba(45,104,255,0.45),rgba(164,68,243,0.45))_border-box]">
        <div className="flex items-start gap-2.5 px-3 pt-2.5 pb-2">
          <span className="mt-[5px]">
            <Sparkle spinning={result.isFetching} />
          </span>

          {/* A div, not a <p>: each token carries its menu, and a block popover
              inside a paragraph is invalid nesting React warns about. */}
          <div className="min-w-0 flex-1 font-inter text-[13px] leading-[26px] tracking-[-0.3px] text-[#19363F]">
            <span className="text-[rgba(25,54,63,0.75)]">Muéstrame </span>
            <TokenMenu
              label={scopeLabel}
              ariaLabel={`Quién: ${scopeLabel}`}
              sections={[
                {
                  options: SCOPE_OPTIONS.map((option) => ({
                    id: option.id,
                    label: option.label,
                    selected: option.id === scope,
                    onSelect: () => onChange({ scope: option.id }),
                  })),
                },
              ]}
            />

            {search && (
              <>
                {" "}
                <span className="text-[rgba(25,54,63,0.75)]">que coincidan con </span>
                <span className="inline-flex items-center align-baseline">
                  <span className="rounded-l-md bg-blue-50 px-1.5 py-px font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                    «{search}»
                  </span>
                  <button
                    type="button"
                    aria-label="Quitar búsqueda"
                    onClick={onClearSearch}
                    className="inline-flex items-center self-stretch rounded-r-md bg-blue-50 px-1 text-blue-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-100"
                  >
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path
                        d="M2 2l6 6M8 2L2 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </span>
              </>
            )}

            {activeFilters.map((filter, index) => (
              <span key={filter.id}>
                <span className="text-[rgba(25,54,63,0.75)]">
                  {index === 0 ? " " : ", "}
                  {filter.prefix ? `${filter.prefix} ` : ""}
                </span>
                <TokenMenu
                  label={optionLabel(filter.id, filters[filter.id])}
                  ariaLabel={`${filter.label}: ${optionLabel(filter.id, filters[filter.id])}`}
                  onRemove={() => setFilter(filter.id, null)}
                  sections={[
                    {
                      heading: filter.label,
                      options: filter.options.map((option) => ({
                        id: option.id,
                        label: option.label,
                        selected: option.id === filters[filter.id],
                        onSelect: () => setFilter(filter.id, option.id),
                      })),
                    },
                  ]}
                />
              </span>
            ))}

            <span className="text-[rgba(25,54,63,0.75)]">{refined ? ", " : " "}ordenados por </span>
            <TokenMenu
              label={sortLabel(sorting)}
              ariaLabel={`Orden: ${sortLabel(sorting)}`}
              sections={[
                {
                  options: SORT_OPTIONS.map((option) => ({
                    id: option.id,
                    label: option.label,
                    selected: option.sort === sorting?.id && option.desc === sorting?.desc,
                    onSelect: () => onChange({ sorting: { id: option.sort, desc: option.desc } }),
                  })),
                },
              ]}
            />

            {inactiveFilters.length > 0 && (
              <>
                {" "}
                <TokenMenu
                  variant="add"
                  label="+ filtro"
                  ariaLabel="Añadir filtro"
                  sections={inactiveFilters.map((filter) => ({
                    heading: filter.label,
                    options: filter.options.map((option) => ({
                      id: option.id,
                      label: option.label,
                      onSelect: () => setFilter(filter.id, option.id),
                    })),
                  }))}
                />
              </>
            )}
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-[15px] w-[1.5px] translate-y-[3px] bg-[#2D68FF] animate-pulse motion-reduce:animate-none"
            />
          </div>
        </div>

        <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t-[0.7px] border-[rgba(25,54,63,0.08)] px-3 py-1.5">
          <p
            aria-live="polite"
            className="font-inter text-[12px] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]"
          >
            {result.isError ? (
              <span className="text-red-700">/users no respondió — el detalle está abajo.</span>
            ) : result.isLoading ? (
              refined ? (
                "Leyendo todos los usuarios para filtrar…"
              ) : (
                "Buscando…"
              )
            ) : result.count === null ? (
              // Paged, and /users sent no total worth believing: say so rather than
              // print the length of one page as if it were the answer.
              "/users no da un total fiable para esta consulta; el paginador avanza mientras haya más."
            ) : (
              <>
                <span className="font-semibold tabular-nums text-[#19363F]">
                  {formatNumber(result.count)}
                </span>{" "}
                {result.count === 1 ? "usuario" : "usuarios"}
                {refined && result.population !== null && (
                  <span className="text-[rgba(25,54,63,0.68)]">
                    {" "}
                    de {formatNumber(result.population)} cumplen todo
                  </span>
                )}
              </>
            )}
          </p>

          {!isDefault && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md px-1.5 py-0.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.75)] transition-colors hover:bg-[rgba(25,54,63,0.05)] hover:text-[#19363F]"
            >
              Empezar de nuevo
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.68)]">
          Prueba con
        </span>
        {SUGGESTIONS.map((suggestion) => {
          const active = isSuggestionActive(suggestion, { scope, sorting, filters });
          return (
            <button
              key={suggestion.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                haptic("selection");
                const { query } = suggestion;
                onChange({
                  scope: query.scope,
                  sorting: { id: query.sort, desc: query.desc },
                  filters: query.filters,
                });
              }}
              className={cn(
                "rounded-full border-[0.7px] px-2.5 py-1 font-inter text-[11px] font-medium tracking-[-0.44px] transition-[background-color,border-color,color,scale] duration-150 active:scale-[0.97]",
                active
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-[rgba(25,54,63,0.15)] bg-white text-[rgba(25,54,63,0.85)] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              )}
            >
              {suggestion.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UserQueryPrompt;
