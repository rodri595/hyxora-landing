"use client";

import CategorySidebar from "@/components/CategorySidebar";
import CreateTutorialSidebar from "@/components/CreateTutorialSidebar";
import DataTable from "@/components/DataTable";
import ErrorComp from "@/components/Error";
import Icon from "@/components/Icon";
import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import TutorialDetailSidebar from "@/components/TutorialDetailSidebar";
import { useCreateCategory } from "@/hooks/admin/useCreateCategory";
import { useCreateTutorial } from "@/hooks/admin/useCreateTutorial";
import { useDeleteCategory } from "@/hooks/admin/useDeleteCategory";
import { useDeleteTutorial } from "@/hooks/admin/useDeleteTutorial";
import { useEditCategory } from "@/hooks/admin/useEditCategory";
import { useEditTutorial } from "@/hooks/admin/useEditTutorial";
import { useGetAllCategories } from "@/hooks/admin/useGetAllCategories";
import { useGetAllTutorials } from "@/hooks/admin/useGetAllTutorials";
import { cn } from "@/utils";
import { formatDate, formatDuration } from "@/utils/video";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { VISIBILITY, decorateTutorial } from "../_data/tutorials";

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

const TutorialsModule = () => {
  const { data: tutorialsData, isLoading, isError } = useGetAllTutorials();
  const { data: categoriesData } = useGetAllCategories();

  // Mutations — each invalidates its list query on success (see the hooks).
  const { mutate: createTutorial } = useCreateTutorial();
  const { mutate: editTutorial } = useEditTutorial();
  const { mutate: deleteTutorial } = useDeleteTutorial();
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: editCategory } = useEditCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [view, setView] = useState("tutorials"); // "tutorials" | "categories"

  // The tables read straight from the queries. On a mutation the list query is
  // invalidated and refetched; React Query keeps the previous data during the
  // background refetch, so the open sidebar (derived from these lists by id) is
  // never unmounted — it just re-renders with fresh values.
  const videos = useMemo(
    () => (tutorialsData ?? []).map(decorateTutorial),
    [tutorialsData],
  );
  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  const [isOpen, setIsOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("detail"); // "detail" | "create"
  const [displayedId, setDisplayedId] = useState(null);
  const [initialTab, setInitialTab] = useState("detail");
  // Bumped on every openDetail. The sidebar stays mounted across action clicks on
  // the same row, so a changing signal is what re-applies the requested tab even
  // when initialTab's value is unchanged (e.g. "edit" → "edit" from the trash icon).
  const [openSignal, setOpenSignal] = useState(0);
  // Bumped each time a create session opens. The create sidebars stay mounted
  // (the wrapper only animates width/transform), so keying on this forces a
  // fresh mount and clears any leftover form input.
  const [createKey, setCreateKey] = useState(0);

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
    setOpenSignal((n) => n + 1);
  }, []);

  const onOpenCreate = useCallback(() => {
    setDisplayedId(null);
    setSidebarMode("create");
    setCreateKey((k) => k + 1);
    setIsOpen(true);
  }, []);

  // From the tutorial-create form when no categories exist yet: swap the open
  // panel over to the category-create form (the panel stays open, just re-renders).
  const onOpenCreateCategory = useCallback(() => {
    setView("categories");
    setDisplayedId(null);
    setSidebarMode("create");
    setCreateKey((k) => k + 1);
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

  // ── Tutorial CRUD ──
  // The create/delete sidebars close themselves (they call onClose after the
  // callback). Update intentionally does NOT close — the panel stays open and
  // re-renders with the freshly invalidated data.
  const handleCreate = useCallback(
    (data) => {
      createTutorial(data, {
        onSuccess: () => {
          toast.success("Tutorial creado");
          // Remount the create form fresh so the next tutorial starts blank
          // (clears all fields plus the cover picker's internal preview state).
          setCreateKey((k) => k + 1);
        },
        onError: () => toast.error("No se pudo crear el tutorial"),
      });
    },
    [createTutorial],
  );

  const handleUpdate = useCallback(
    (id, data) => {
      editTutorial(
        { id, ...data },
        {
          onSuccess: () => toast.success("Cambios guardados"),
          onError: () => toast.error("No se pudieron guardar los cambios"),
        },
      );
    },
    [editTutorial],
  );

  const handleDelete = useCallback(
    (id) => {
      deleteTutorial(
        { id },
        {
          onSuccess: () => toast.success("Tutorial eliminado"),
          onError: () => toast.error("No se pudo eliminar el tutorial"),
        },
      );
    },
    [deleteTutorial],
  );

  // ── Category CRUD ──
  const handleCreateCategory = useCallback(
    (data) => {
      createCategory(data, {
        onSuccess: () => toast.success("Categoría creada"),
        onError: () => toast.error("No se pudo crear la categoría"),
      });
    },
    [createCategory],
  );

  const handleUpdateCategory = useCallback(
    (id, data) => {
      editCategory(
        { id, ...data },
        {
          onSuccess: () => toast.success("Cambios guardados"),
          onError: () => toast.error("No se pudieron guardar los cambios"),
        },
      );
    },
    [editCategory],
  );

  const handleDeleteCategory = useCallback(
    (id) => {
      deleteCategory(
        { id },
        {
          onSuccess: () => toast.success("Categoría eliminada"),
          onError: () => toast.error("No se pudo eliminar la categoría"),
        },
      );
    },
    [deleteCategory],
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
            key={`create-${createKey}`}
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
            openSignal={openSignal}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            onClose={handleClose}
          />
        )
      );
    }
    if (sidebarMode === "create") {
      return (
        <CreateTutorialSidebar
          key={`create-${createKey}`}
          onClose={handleClose}
          onCreate={handleCreate}
          onCreateCategory={onOpenCreateCategory}
        />
      );
    }
    return (
      displayedVideo && (
        <TutorialDetailSidebar
          key={displayedVideo.id}
          video={displayedVideo}
          initialTab={initialTab}
          openSignal={openSignal}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      )
    );
  };

  const isCategories = view === "categories";

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <ErrorComp
          error
          message="Error al cargar los tutoriales."
          className="max-w-sm"
        />
      </div>
    );

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
