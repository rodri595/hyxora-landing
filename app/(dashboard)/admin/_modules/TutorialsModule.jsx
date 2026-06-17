"use client";

import CategorySidebar from "@/components/CategorySidebar";
import CreateTutorialSidebar from "@/components/CreateTutorialSidebar";
import DataTable from "@/components/DataTable";
import Icon from "@/components/Icon";
import Tabs from "@/components/Tabs";
import TutorialDetailSidebar from "@/components/TutorialDetailSidebar";
import { cn } from "@/utils";
import { formatDate, formatDuration } from "@/utils/video";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";
import { CATEGORY_SEED, MEMBERSHIPS, slugify } from "../_data/categories";
import { TUTORIALS, VISIBILITY, decorateTutorial } from "../_data/tutorials";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 440;

// ── Action icons ─────────────────────────────────────────────────────────────

const EyeIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const PencilIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M11.5 2.5l2 2L6 12l-3 1 1-3 7.5-7.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2.5 4h11M6 4V2.5h4V4M4 4l.5 9h7L12 4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ActionButton = ({ label, onClick, danger, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={cn(
      "flex size-6 items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] transition-colors",
      danger
        ? "hover:bg-red-50 hover:text-red-600"
        : "hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F]",
    )}
  >
    {children}
  </button>
);

// ── Views ────────────────────────────────────────────────────────────────────

const VIEWS = [
  { id: "tutorials", label: "Tutoriales" },
  { id: "categories", label: "Categorías" },
];

// ── Module ───────────────────────────────────────────────────────────────────

let idSeq = 0;
const nextId = () => `t-new-${Date.now()}-${idSeq++}`;

// Ensure a category slug is unique against existing ids.
const uniqueCategoryId = (label, existing) => {
  const base = slugify(label) || "categoria";
  let id = base;
  let n = 2;
  const taken = new Set(existing.map((c) => c.id));
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
};

const TutorialsModule = () => {
  const [view, setView] = useState("tutorials"); // "tutorials" | "categories"
  const [videos, setVideos] = useState(TUTORIALS);
  const [categories, setCategories] = useState(CATEGORY_SEED);

  const [isOpen, setIsOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("detail"); // "detail" | "create"
  const [displayedId, setDisplayedId] = useState(null);
  const [initialTab, setInitialTab] = useState("detail");

  const desktopWrapRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const displayedVideo = useMemo(
    () => videos.find((v) => v.id === displayedId) ?? null,
    [videos, displayedId],
  );
  const displayedCategory = useMemo(
    () => categories.find((c) => c.id === displayedId) ?? null,
    [categories, displayedId],
  );

  // Tutorials assigned to each category (by categoryId).
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const v of videos)
      counts[v.categoryId] = (counts[v.categoryId] ?? 0) + 1;
    return counts;
  }, [videos]);

  const openDetail = useCallback((item, tab = "detail") => {
    setDisplayedId(item.id);
    setInitialTab(tab);
    setSidebarMode("detail");
    setIsOpen(true);
  }, []);

  const onOpenCreate = useCallback(() => {
    setDisplayedId(null);
    setSidebarMode("create");
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  // Switching the table view closes any open panel first.
  const switchView = useCallback(
    (next) => {
      if (next === view) return;
      setIsOpen(false);
      setView(next);
    },
    [view],
  );

  // ── Tutorial CRUD (local mock state) ──
  const handleCreate = useCallback((data) => {
    const now = new Date().toISOString();
    setVideos((prev) => [
      decorateTutorial({
        ...data,
        id: nextId(),
        createdAt: now,
        updatedAt: now,
      }),
      ...prev,
    ]);
  }, []);

  const handleUpdate = useCallback((id, data) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id
          ? decorateTutorial({
              ...v,
              ...data,
              updatedAt: new Date().toISOString(),
            })
          : v,
      ),
    );
  }, []);

  const handleDelete = useCallback(
    (id) => {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (displayedId === id) setIsOpen(false);
    },
    [displayedId],
  );

  // ── Category CRUD (local mock state) ──
  const handleCreateCategory = useCallback((data) => {
    setCategories((prev) => [
      { ...data, id: uniqueCategoryId(data.label, prev) },
      ...prev,
    ]);
  }, []);

  const handleUpdateCategory = useCallback((id, data) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
  }, []);

  const handleDeleteCategory = useCallback(
    (id) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (displayedId === id) setIsOpen(false);
    },
    [displayedId],
  );

  // Desktop (lg+): inline wrapper — GSAP animates its width
  useGSAP(
    () => {
      const el = desktopWrapRef.current;
      if (!el) return;
      if (isOpen) {
        gsap.to(el, {
          width: SIDEBAR_WIDTH,
          marginLeft: 16,
          duration: 0.38,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.to(el, {
          width: 0,
          marginLeft: 0,
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => setDisplayedId(null),
        });
      }
    },
    { dependencies: [isOpen] },
  );

  // Mobile/tablet (<lg): overlay slide + backdrop fade
  useGSAP(
    () => {
      const panel = mobileWrapRef.current;
      const backdrop = backdropRef.current;
      if (!panel || !backdrop) return;
      if (isOpen) {
        gsap.set(backdrop, { pointerEvents: "auto" });
        gsap.to(panel, {
          x: "0%",
          duration: 0.35,
          ease: "power3.out",
          overwrite: true,
        });
        gsap.to(backdrop, { opacity: 1, duration: 0.25, overwrite: true });
      } else {
        gsap.set(backdrop, { pointerEvents: "none" });
        gsap.to(panel, {
          x: "100%",
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => setDisplayedId(null),
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] },
  );

  // ── Tutorial columns ──
  const tutorialColumns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Título",
        cell: (info) => (
          <span className="line-clamp-2 font-inter text-[11px] font-medium leading-snug tracking-[-0.44px] text-[#19363F]">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Categoría",
        size: 130,
        cell: ({ row }) => (
          <span
            className="inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]"
            style={{
              background: `${row.original.accent}14`,
              color: row.original.accent,
            }}
          >
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "durationSec",
        header: "Duración",
        size: 80,
        cell: (info) => (
          <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {formatDuration(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Estado",
        size: 110,
        cell: (info) => {
          const v = VISIBILITY[info.getValue()] ?? VISIBILITY.disabled;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]",
                v.badge,
              )}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: v.dot }}
              />
              {v.label}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Subido",
        size: 100,
        cell: (info) => (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.55)]">
            {formatDate(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Actualizado",
        size: 100,
        cell: (info) => (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.55)]">
            {formatDate(info.getValue())}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        enableSorting: false,
        size: 110,
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <ActionButton
              label="Editar tutorial"
              onClick={() => openDetail(row.original, "edit")}
            >
              <PencilIcon />
            </ActionButton>
            <ActionButton
              label="Ver tutorial"
              onClick={() => openDetail(row.original, "detail")}
            >
              <EyeIcon />
            </ActionButton>
            <ActionButton
              label="Eliminar tutorial"
              danger
              onClick={() => openDetail(row.original, "edit")}
            >
              <TrashIcon />
            </ActionButton>
          </div>
        ),
      },
    ],
    [openDetail],
  );

  // ── Category columns ──
  const categoryColumns = useMemo(
    () => [
      {
        accessorKey: "label",
        header: "Nombre",
        cell: ({ row }) => (
          <span
            className="inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 font-inter text-[11px] font-medium tracking-[-0.3px]"
            style={{
              background: `${row.original.accent}14`,
              color: row.original.accent,
            }}
          >
            {row.original.label}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Descripción",
        cell: (info) => (
          <span className="line-clamp-1 font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {info.getValue() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "membershipType",
        header: "Membresía",
        size: 110,
        cell: (info) => {
          const m = MEMBERSHIPS[info.getValue()] ?? MEMBERSHIPS.all;
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-[5px] px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]",
                m.badge,
              )}
            >
              {m.label}
            </span>
          );
        },
      },
      {
        id: "count",
        header: "Tutoriales",
        size: 90,
        accessorFn: (row) => categoryCounts[row.id] ?? 0,
        cell: (info) => (
          <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {info.getValue()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        enableSorting: false,
        size: 90,
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <ActionButton
              label="Editar categoría"
              onClick={() => openDetail(row.original, "edit")}
            >
              <PencilIcon />
            </ActionButton>
            <ActionButton
              label="Ver categoría"
              onClick={() => openDetail(row.original, "detail")}
            >
              <EyeIcon />
            </ActionButton>
            <ActionButton
              label="Eliminar categoría"
              danger
              onClick={() => openDetail(row.original, "edit")}
            >
              <TrashIcon />
            </ActionButton>
          </div>
        ),
      },
    ],
    [openDetail, categoryCounts],
  );

  // Sidebar content depends on the active view + mode. Shared by desktop & mobile.
  const renderSidebar = () => {
    if (view === "categories") {
      if (sidebarMode === "create") {
        return (
          <CategorySidebar
            onCreate={handleCreateCategory}
            onClose={handleClose}
          />
        );
      }
      return (
        displayedCategory && (
          <CategorySidebar
            key={displayedCategory.id}
            category={displayedCategory}
            tutorialCount={categoryCounts[displayedCategory.id] ?? 0}
            initialTab={initialTab}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            onClose={handleClose}
          />
        )
      );
    }
    if (sidebarMode === "create") {
      return (
        <CreateTutorialSidebar onClose={handleClose} onCreate={handleCreate} />
      );
    }
    return (
      displayedVideo && (
        <TutorialDetailSidebar
          key={displayedVideo.id}
          video={displayedVideo}
          initialTab={initialTab}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      )
    );
  };

  const isCategories = view === "categories";

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden h-full">
      <div className="flex flex-col flex-1 w-0 min-h-0 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] px-4 py-3 overflow-hidden ">
        <Tabs
          tabs={VIEWS}
          value={view}
          onChange={switchView}
          className="mb-3"
        />
        <div className="mb-3 flex shrink-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={onOpenCreate}
            className=" flex h-7.5 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#19363F] px-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-white transition-colors hover:bg-[#0f2228]"
          >
            <Icon name="plus" className="size-[16px] fill-white" />
            {isCategories ? "Nueva categoría" : "Nuevo tutorial"}
          </button>
        </div>
        {isCategories ? (
          <DataTable
            data={categories}
            columns={categoryColumns}
            filename="categorias"
            title="Categorías"
            searchPlaceholder="Buscar categoría..."
          />
        ) : (
          <DataTable
            data={videos}
            columns={tutorialColumns}
            filename="tutoriales"
            title="Tutoriales"
            searchPlaceholder="Buscar por título, categoría..."
          />
        )}
      </div>

      {/* Desktop (lg+): inline wrapper — GSAP animates width */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden shrink-0 overflow-hidden lg:block"
      >
        {renderSidebar()}
      </div>

      {/* Mobile/tablet (<lg): backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        style={{ opacity: 0, pointerEvents: "none" }}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar panel"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") handleClose();
        }}
      />

      {/* Mobile/tablet (<lg): overlay panel */}
      <div
        ref={mobileWrapRef}
        className="fixed inset-y-0 right-0 z-50 w-[min(440px,100vw)] p-2 lg:hidden"
        style={{ transform: "translateX(100%)" }}
      >
        {renderSidebar()}
      </div>
    </div>
  );
};

export default TutorialsModule;
