"use client";

import ErrorComp from "@/components/Error";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Spinner from "@/components/Spinner";
import { useGetTutorials } from "@/hooks/academy/useGetTutorials";
import { cn } from "@/utils";
import { sortTutorials } from "@/utils/tutorialTitle";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CategoryCarousel from "./_components/CategoryCarousel";
import SearchModal from "./_components/SearchModal";
import VideoTable from "./_components/VideoTable";
import { decorateAcademyTutorial, formatDuration } from "./_lib";

gsap.registerPlugin(useGSAP);

// ─── Toolbar controls ───────────────────────────────────────────────────────

const SearchButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-7.5 items-center gap-1.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white px-2.5",
      "font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)]",
      "shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] transition-colors hover:bg-[rgba(25,54,63,0.03)]",
      "max-md:flex-1"
    )}
  >
    <Icon name="search" className="shrink-0 fill-[rgba(25,54,63,0.4)] size-[16px]" size={20} />

    <span className="hidden sm:inline">Buscar tutoriales</span>
    <span className="sm:hidden">Buscar</span>
    <kbd className="ml-1 hidden rounded-[5px] border-[0.7px] border-[rgba(25,54,63,0.12)] bg-[rgba(25,54,63,0.03)] px-1 py-px font-inter text-[9.5px] font-medium text-[rgba(25,54,63,0.4)] sm:inline max-md:ml-auto">
      ⌘K
    </kbd>
  </button>
);

const ViewToggle = ({ value, onChange }) => {
  const options = [
    {
      id: "grid",
      label: "Cuadrícula",
      icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="5" height="5" rx="1.4" fill="currentColor" />
          <rect x="9" y="2" width="5" height="5" rx="1.4" fill="currentColor" />
          <rect x="2" y="9" width="5" height="5" rx="1.4" fill="currentColor" />
          <rect x="9" y="9" width="5" height="5" rx="1.4" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "list",
      label: "Lista",
      icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="3" height="3" rx="1" fill="currentColor" />
          <rect x="2" y="10" width="3" height="3" rx="1" fill="currentColor" />
          <rect x="7" y="3.75" width="7" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="7" y="10.75" width="7" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white p-0.5 shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          aria-label={opt.label}
          title={opt.label}
          className={cn(
            "flex h-6.5 items-center gap-1.5 rounded-[7px] px-2 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
            value === opt.id
              ? "bg-[#19363F] text-white shadow-[0px_1px_4px_0px_rgba(25,54,63,0.2)]"
              : "text-[rgba(25,54,63,0.5)] hover:bg-[rgba(25,54,63,0.04)] hover:text-[#19363F]"
          )}
        >
          {opt.icon}
          <span className="hidden md:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};

const FeaturedHero = ({ video }) => {
  const [from, to] = video.gradient;
  const coverUrl = video.coverImgUrl;
  return (
    <Link
      href={`/academy/${video.slug}`}
      className="group/hero relative flex min-h-[200px] items-end overflow-hidden rounded-2xl p-5 sm:min-h-[260px] sm:p-7"
      style={{ background: `linear-gradient(120deg, ${from} 0%, ${to} 100%)` }}
    >
      <Image
        src={coverUrl}
        alt=""
        height={260}
        width={460}
        className="pointer-events-none absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/hero:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

      <div className="relative flex max-w-[460px] flex-col gap-2.5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-inter text-[10px] font-semibold uppercase tracking-[0.6px] text-white backdrop-blur-sm ring-1 ring-white/25 max-md:text-[8px]">
          Destacado
        </span>
        <h2 className="font-inter text-[16px] font-bold leading-[1.1] tracking-[-0.8px] text-white sm:text-[28px] ">
          {video.title}
        </h2>
        <p className="line-clamp-2 max-w-[420px] font-inter text-[10.5px] leading-[18px] tracking-[-0.3px] text-white/80">
          {video.description}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-inter text-[12px] font-semibold tracking-[-0.4px] text-[#19363F] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.2)] transition-transform group-hover/hero:scale-[1.03] ">
            <Icon name="chevron" className="size-4 fill-[#19363F] -rotate-90" size={20} />
            Ver ahora
          </span>
          <span className="font-inter text-[11.5px] tracking-[-0.3px] text-white/70">
            {video.category} · {formatDuration(video.durationSec)}
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const TutorialsPage = () => {
  const [view, setView] = useState("grid");
  const [searchOpen, setSearchOpen] = useState(false);
  const viewRef = useRef(null);

  const { data, isLoading, isError } = useGetTutorials();

  // Flat list of decorated tutorials (slug / category label / accent / gradient),
  // in the manual order the admin set — oldest-first for anything unnumbered.
  const allVideos = useMemo(
    () => sortTutorials((data?.tutorials ?? []).map(decorateAcademyTutorial)),
    [data]
  );

  const featured = useMemo(
    () => (data?.featured ? decorateAcademyTutorial(data.featured) : null),
    [data]
  );

  // The API only returns categories that have at least one tutorial; group the
  // decorated tutorials under them for the carousel layout.
  const categoriesWithVideos = useMemo(
    () =>
      (data?.categories ?? [])
        .map((c) => ({
          ...c,
          videos: allVideos.filter((v) => v.categoryId === c.id),
        }))
        .filter((c) => c.videos.length > 0),
    [data, allVideos]
  );

  // Staggered intro per video whenever the active view (grid ↔ list) changes —
  // each card / row fades up in sequence rather than the whole block at once.
  useGSAP(
    () => {
      const items = viewRef.current?.querySelectorAll("[data-stagger-item]");
      if (!items?.length) return;
      gsap.fromTo(
        items,
        // `transition: none` overrides the rows' CSS opacity transition, which
        // would otherwise fight GSAP and make the first rows appear instantly.
        { opacity: 0, y: 12, transition: "none" },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.045,
          // Restore class-driven styling (hover dim / transforms) once done.
          clearProps: "opacity,transform,transition",
        }
      );
    },
    { dependencies: [view] }
  );

  // ⌘K / Ctrl+K to open search.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col p-4" data-lenis-prevent>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white px-4 py-3 shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
        {/* Toolbar */}
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3 max-md:flex-col max-md:items-start">
          <div className="flex flex-col max-md:w-full ">
            <h1 className="font-inter text-[15px] font-bold tracking-[-0.6px] text-[#19363F]">
              Tutoriales
            </h1>
            <p className="hidden font-inter text-[11.5px] tracking-[-0.3px] text-[rgba(25,54,63,0.5)] sm:block">
              {allVideos.length} vídeos para dominar la plataforma
            </p>
          </div>

          <div className="flex items-center gap-2 max-md:w-full max-md:flex-wrap">
            <SearchButton onClick={() => setSearchOpen(true)} />
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="-mr-2 min-h-0 min-w-0 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.2)] scrollbar-thumb-rounded-lg"
          data-lenis-prevent
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center p-4">
              <ErrorComp
                error
                message="No se pudieron cargar los tutoriales."
                className="max-w-sm"
              />
            </div>
          ) : allVideos.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.4)]">
                Aún no hay tutoriales disponibles.
              </p>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-7 pb-2">
              {featured && <FeaturedHero video={featured} />}

              <div key={view} ref={viewRef} className="flex min-w-0 flex-col gap-4">
                {view === "grid" ? (
                  categoriesWithVideos.map((c) => (
                    <CategoryCarousel key={c.id} category={c} videos={c.videos} />
                  ))
                ) : (
                  <VideoTable videos={allVideos} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} videos={allVideos} />
    </section>
  );
};

export default TutorialsPage;
