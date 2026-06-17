"use client";

import { ACCENT_PRESETS } from "@/app/(dashboard)/admin/_data/categories";
import Tabs from "@/components/Tabs";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const inputCls =
  "w-full px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white font-inter text-[12px] tracking-[-0.48px] text-[#19363F] placeholder:text-[rgba(25,54,63,0.3)] outline-none focus:border-[rgba(25,54,63,0.4)] transition-colors";

const labelCls =
  "font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase";

// ── Accent swatch picker ─────────────────────────────────────────────────────

const AccentPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {ACCENT_PRESETS.map((hex) => (
      <button
        key={hex}
        type="button"
        aria-label={`Color ${hex}`}
        onClick={() => onChange(hex)}
        className={cn(
          "size-6 rounded-full transition-transform",
          value === hex
            ? "ring-2 ring-[#19363F] ring-offset-2 ring-offset-white"
            : "hover:scale-110",
        )}
        style={{ background: hex }}
      />
    ))}
  </div>
);

// ── Shared form fields (create + edit) ───────────────────────────────────────

const CategoryForm = ({
  values,
  setValues,
  submitLabel,
  canSubmit,
  onSubmit,
}) => {
  const set = (key) => (val) => setValues((p) => ({ ...p, [key]: val }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Nombre</span>
        <input
          type="text"
          value={values.label}
          onChange={(e) => set("label")(e.target.value)}
          className={cn(inputCls, "h-8")}
          placeholder="Ej. Primeros pasos"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelCls}>Descripción</span>
        <textarea
          value={values.description}
          onChange={(e) => set("description")(e.target.value)}
          rows={3}
          className={cn(inputCls, "resize-none py-2")}
          placeholder="Breve descripción de la categoría..."
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>Color</span>
        <AccentPicker value={values.accent} onChange={set("accent")} />
      </div>

      {/* Live chip preview */}
      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>Vista previa</span>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]"
            style={{ background: `${values.accent}14`, color: values.accent }}
          >
            {values.label.trim() || "Nombre de categoría"}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </div>
  );
};

// ── ConfirmBlock (matches TutorialDetailSidebar) ─────────────────────────────

const ConfirmBlock = ({ message, confirmLabel, onCancel, onConfirm }) => (
  <div className="flex flex-col gap-2 rounded-lg border-[0.7px] border-red-200 bg-red-50 p-3">
    <div className="flex items-start gap-2">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className="mt-px shrink-0"
        aria-hidden="true"
      >
        <path
          d="M8 2L14.5 13H1.5L8 2Z"
          stroke="#dc2626"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M8 6.5V9.5M8 11v.5"
          stroke="#dc2626"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <p className="font-inter text-[11px] leading-relaxed tracking-[-0.44px] text-red-700">
        {message}
      </p>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="h-7 flex-1 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] bg-white font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.6)] transition-colors hover:bg-[rgba(25,54,63,0.04)]"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="h-7 flex-1 rounded-lg bg-red-600 font-inter text-[11px] font-medium tracking-[-0.44px] text-white transition-colors hover:bg-red-700"
      >
        {confirmLabel}
      </button>
    </div>
  </div>
);

// ── DetailPanel ──────────────────────────────────────────────────────────────

const DetailPanel = ({ category, tutorialCount }) => (
  <div className="flex flex-col gap-4 p-4">
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]"
        style={{ background: `${category.accent}14`, color: category.accent }}
      >
        {category.label}
      </span>
    </div>

    <div className="flex flex-col gap-1">
      <span className={labelCls}>Descripción</span>
      <p className="whitespace-pre-wrap font-inter text-[11px] leading-relaxed tracking-[-0.44px] text-[rgba(25,54,63,0.65)]">
        {category.description || "—"}
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <span className={labelCls}>Tutoriales</span>
        <p className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
          {tutorialCount}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <span className={labelCls}>Identificador</span>
        <p className="truncate font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
          {category.id}
        </p>
      </div>
    </div>
  </div>
);

// ── EditPanel ────────────────────────────────────────────────────────────────

const emptyValues = {
  label: "",
  description: "",
  accent: ACCENT_PRESETS[0],
};

const toValues = (category) => ({
  label: category.label ?? "",
  description: category.description ?? "",
  accent: category.accent ?? ACCENT_PRESETS[0],
});

const EditPanel = ({
  category,
  tutorialCount,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [values, setValues] = useState(() => toValues(category));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasChanges =
    values.label !== (category.label ?? "") ||
    values.description !== (category.description ?? "") ||
    values.accent !== category.accent;

  const canSubmit = hasChanges && values.label.trim();

  return (
    <>
      <CategoryForm
        values={values}
        setValues={setValues}
        submitLabel="Guardar cambios"
        canSubmit={canSubmit}
        onSubmit={() =>
          onUpdate?.(category.id, {
            label: values.label.trim(),
            description: values.description.trim(),
            accent: values.accent,
          })
        }
      />

      {/* ── Danger zone ── */}
      <div className="flex flex-col gap-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)] px-4 pt-3 pb-4">
        {confirmDelete ? (
          <ConfirmBlock
            message={
              tutorialCount > 0
                ? `Esta categoría tiene ${tutorialCount} tutorial(es). Al eliminarla quedarán sin categoría. ¿Continuar?`
                : "¿Confirmas que quieres eliminar esta categoría? Esta acción es permanente."
            }
            confirmLabel="Sí, eliminar"
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              onDelete?.(category.id);
              onClose?.();
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="h-8 w-full rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] font-inter text-[12px] font-medium tracking-[-0.48px] text-[rgba(25,54,63,0.5)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Eliminar categoría
          </button>
        )}
      </div>
    </>
  );
};

// ── CreatePanel ──────────────────────────────────────────────────────────────

const CreatePanel = ({ onCreate, onClose }) => {
  const [values, setValues] = useState(emptyValues);
  const canSubmit = !!values.label.trim();

  return (
    <CategoryForm
      values={values}
      setValues={setValues}
      submitLabel="Crear categoría"
      canSubmit={canSubmit}
      onSubmit={() => {
        onCreate?.({
          label: values.label.trim(),
          description: values.description.trim(),
          accent: values.accent,
        });
        onClose?.();
      }}
    />
  );
};

// ── CategorySidebar ──────────────────────────────────────────────────────────

const DETAIL_TABS = [
  { id: "detail", label: "Detalle" },
  { id: "edit", label: "Editar" },
];

/**
 * CategorySidebar — handles both create (no `category`) and detail/edit modes.
 *
 * @param {object|null} category      - the category to view/edit; null = create
 * @param {number}      tutorialCount - tutorials assigned to this category
 * @param {string}      initialTab    - "detail" | "edit" (detail mode only)
 */
const CategorySidebar = ({
  category = null,
  tutorialCount = 0,
  initialTab = "detail",
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const panelRef = useRef(null);
  const isCreate = !category;
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useGSAP(
    () => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, delay: 0.14, ease: "power2.out" },
      );
    },
    { scope: panelRef },
  );

  const header = useMemo(() => {
    if (isCreate) return { title: "Nueva categoría", sub: null };
    return { title: category.label, sub: category.description || null };
  }, [isCreate, category, tutorialCount]);

  return (
    <div
      ref={panelRef}
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
            {header.title}
          </p>
          {header.sub && (
            <p className="truncate font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
              {header?.sub}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] transition-colors hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F]"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8.5 1.5l-7 7M1.5 1.5l7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Tabs (detail mode only) */}
      {!isCreate && (
        <Tabs
          tabs={DETAIL_TABS}
          value={tab}
          onChange={setTab}
          className="px-4"
        />
      )}

      {/* Content */}
      <div className="scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent flex-1 overflow-y-auto">
        {isCreate ? (
          <CreatePanel onCreate={onCreate} onClose={onClose} />
        ) : tab === "detail" ? (
          <DetailPanel category={category} tutorialCount={tutorialCount} />
        ) : (
          <EditPanel
            category={category}
            tutorialCount={tutorialCount}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;
