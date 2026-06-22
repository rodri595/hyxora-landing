"use client";

import { cn } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import VideoCard from "./VideoCard";

const Arrow = ({ direction, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === "left" ? "Anterior" : "Siguiente"}
    className={cn(
      "flex size-7 items-center justify-center rounded-full border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_1px_4px_0px_rgba(25,54,63,0.1)] transition-all",
      "hover:bg-[rgba(25,54,63,0.03)] disabled:cursor-default disabled:opacity-0"
    )}
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 4L6 8l4 4" : "M6 4l4 4-4 4"}
        stroke="#19363F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

/**
 * Horizontal, snap-scrolling carousel of VideoCards with edge fades and
 * arrow controls — the Apple TV row layout.
 *
 * @param {object} category   – { id, label, description, accent }
 * @param {object[]} videos
 */
const CategoryCarousel = ({ category, videos }) => {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 pr-0.5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3.5 w-1 rounded-full"
              style={{ background: category.accent }}
            />
            <h2 className="font-inter text-[15px] font-bold tracking-[-0.6px] text-[#19363F]">
              {category.label}
            </h2>
          </div>
          {category.description && (
            <p className="pl-3 font-inter text-[11.5px] tracking-[-0.3px] text-[rgba(25,54,63,0.5)]">
              {category.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Arrow direction="left" disabled={!canLeft} onClick={() => scrollBy(-1)} />
          <Arrow direction="right" disabled={!canRight} onClick={() => scrollBy(1)} />
        </div>
      </div>

      <div className="relative">
        {/* edge fades */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent transition-opacity",
            canLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent transition-opacity",
            canRight ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          ref={scrollerRef}
          data-lenis-prevent
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              className="w-[220px] shrink-0 snap-start sm:w-[248px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
