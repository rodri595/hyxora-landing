"use client";

import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDuration } from "../_lib";
import Poster from "./Poster";

gsap.registerPlugin(useGSAP);

const norm = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/**
 * Global search overlay (⌘K / Ctrl+K). Filters across title, description,
 * category and level; arrow keys navigate, Enter opens.
 */
const SearchModal = ({ open, onClose, videos = [] }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return videos.slice(0, 6);
    return videos.filter((v) => {
      const haystack = norm(
        `${v.title} ${v.description} ${v.category} ${v.level ?? ""}`,
      );
      return q.split(/\s+/).every((token) => haystack.includes(token));
    });
  }, [query, videos]);

  // Reset state & focus when opened.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Open / close animation.
  useGSAP(
    () => {
      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      if (!backdrop || !panel) return;
      if (open) {
        gsap.set(backdrop, { display: "flex" });
        gsap.to(backdrop, { opacity: 1, duration: 0.2, overwrite: true });
        gsap.fromTo(
          panel,
          { opacity: 0, y: -12, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.28,
            ease: "power3.out",
            overwrite: true,
          },
        );
      } else {
        gsap.to(backdrop, {
          opacity: 0,
          duration: 0.16,
          overwrite: true,
          onComplete: () => gsap.set(backdrop, { display: "none" }),
        });
        gsap.to(panel, {
          opacity: 0,
          y: -8,
          scale: 0.98,
          duration: 0.16,
          overwrite: true,
        });
      }
    },
    { dependencies: [open] },
  );

  const go = (video) => {
    onClose();
    router.push(`/academy/${video.slug}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  // Keep the active row in view.
  useEffect(() => {
    const node = listRef.current?.querySelector(`[data-idx="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] hidden items-start justify-center bg-[rgba(13,22,26,0.45)] px-4 pt-[12vh] opacity-0 backdrop-blur-sm"
      role="button"
      tabIndex={-1}
      aria-label="Cerrar búsqueda"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        className="flex max-h-[68vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border-[0.7px] border-[rgba(25,54,63,0.1)] bg-white shadow-[0px_24px_64px_0px_rgba(13,22,26,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar tutoriales"
      >
        {/* search field */}
        <div className="flex items-center gap-2.5 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
              stroke="rgba(25,54,63,0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Busca tutoriales, temas, categorías..."
            className="flex-1 bg-transparent font-inter text-[14px] tracking-[-0.4px] text-[#19363F] outline-none placeholder:text-[rgba(25,54,63,0.35)]"
          />
          <kbd className="rounded-[5px] border-[0.7px] border-[rgba(25,54,63,0.12)] bg-[rgba(25,54,63,0.03)] px-1.5 py-0.5 font-inter text-[10px] font-medium text-[rgba(25,54,63,0.45)]">
            Esc
          </kbd>
        </div>

        {/* results */}
        <div
          ref={listRef}
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto p-2"
        >
          {!query.trim() && (
            <p className="px-2 pb-1.5 pt-1 font-inter text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[rgba(25,54,63,0.35)]">
              Sugeridos
            </p>
          )}

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-12 text-center">
              <p className="font-inter text-[13px] font-medium tracking-[-0.4px] text-[#19363F]">
                Sin resultados para “{query}”
              </p>
              <p className="font-inter text-[11.5px] tracking-[-0.3px] text-[rgba(25,54,63,0.45)]">
                Prueba con otro término o explora por categorías.
              </p>
            </div>
          ) : (
            results.map((v, i) => (
              <button
                key={v.id}
                type="button"
                data-idx={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(v)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
                  i === active
                    ? "bg-[rgba(25,54,63,0.05)]"
                    : "hover:bg-[rgba(25,54,63,0.03)]",
                )}
              >
                <div className="w-[88px] shrink-0 overflow-hidden rounded-lg">
                  <Poster video={v} rounded={false} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="line-clamp-1 font-inter text-[12.5px] font-semibold tracking-[-0.44px] text-[#19363F]">
                    {v.title}
                  </span>
                  <span className="flex items-center gap-1.5 font-inter text-[11px] tracking-[-0.3px] text-[rgba(25,54,63,0.5)]">
                    <span
                      className="inline-block size-1.5 shrink-0 rounded-full"
                      style={{ background: v.accent }}
                    />
                    <span className="truncate">{v.category}</span>
                    <span className="text-[rgba(25,54,63,0.3)]">·</span>
                    <span className="tabular-nums">
                      {formatDuration(v.durationSec)}
                    </span>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* footer hint */}
        <div className="flex items-center justify-between border-t-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-2 font-inter text-[10.5px] tracking-[-0.2px] text-[rgba(25,54,63,0.4)]">
          <span className="tabular-nums">
            {results.length} {results.length === 1 ? "resultado" : "resultados"}
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="rounded-[4px] border-[0.7px] border-[rgba(25,54,63,0.12)] bg-[rgba(25,54,63,0.03)] px-1 py-px">
                ↑↓
              </kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-[4px] border-[0.7px] border-[rgba(25,54,63,0.12)] bg-[rgba(25,54,63,0.03)] px-1 py-px">
                ↵
              </kbd>
              abrir
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
