"use client";

import {
  MEMBERSHIPS,
  MEMBERSHIP_OPTIONS,
} from "@/app/(dashboard)/admin/_data/categories";
import {
  VISIBILITY,
  VISIBILITY_OPTIONS,
} from "@/app/(dashboard)/admin/_data/tutorials";
import SelectDropdown from "@/components/SelectDropdown";
import Tabs from "@/components/Tabs";
import VideoPreview from "@/components/VideoPreview";
import { useGetAllCategories } from "@/hooks/admin/useGetAllCategories";
import { cn } from "@/utils";
import { detectVideoSource, formatDate, formatDuration, parseDuration } from "@/utils/video";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const visibilityOptions = VISIBILITY_OPTIONS.map((v) => ({
  value: v.id,
  label: v.label,
}));
const membershipOptions = MEMBERSHIP_OPTIONS;

const inputCls =
  "w-full px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white font-inter text-[12px] tracking-[-0.48px] text-[#19363F] placeholder:text-[rgba(25,54,63,0.3)] outline-none focus:border-[rgba(25,54,63,0.4)] transition-colors";

const labelCls =
  "font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase";

const fmtDateTime = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const VisibilityBadge = ({ visibility }) => {
  const v = VISIBILITY[visibility] ?? VISIBILITY.disabled;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]",
        v.badge
      )}
    >
      <span className="size-1.5 rounded-full" style={{ background: v.dot }} />
      {v.label}
    </span>
  );
};

const MembershipBadge = ({ membershipType }) => {
  const m = MEMBERSHIPS[membershipType] ?? MEMBERSHIPS.all;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]",
        m.badge
      )}
    >
      {m.label}
    </span>
  );
};

// Small switch for the "public" flag (watchable without login).
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative h-5 w-9 shrink-0 rounded-full transition-colors",
      checked ? "bg-[#19363F]" : "bg-[rgba(25,54,63,0.15)]"
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-4.5" : "translate-x-0.5"
      )}
    />
  </button>
);

// ── DetailPanel ──────────────────────────────────────────────────────────────

const DetailPanel = ({ video }) => {
  const source = detectVideoSource(video.url);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <VisibilityBadge visibility={video.visibility} />
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]"
          style={{ background: `${video.accent}14`, color: video.accent }}
        >
          {video.category}
        </span>
        <span className="font-inter text-[10px] tracking-[-0.4px] tabular-nums text-[rgba(25,54,63,0.4)]">
          {formatDuration(video.durationSec)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Acceso</span>
        <div className="flex flex-wrap items-center gap-2">
          {video.isPublic && (
            <span className="inline-flex items-center rounded-[5px] bg-emerald-50 px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px] text-emerald-700">
              Público
            </span>
          )}
          <MembershipBadge membershipType={video.membershipType} />
          {video.isPublic && (
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
              Visible sin iniciar sesión
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Título</span>
        <p className="font-inter text-[12px] leading-snug tracking-[-0.48px] text-[#19363F]">
          {video.title}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Descripción</span>
        <p className="whitespace-pre-wrap font-inter text-[11px] leading-relaxed tracking-[-0.44px] text-[rgba(25,54,63,0.65)]">
          {video.description || "—"}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Enlace{source.provider ? ` · ${source.provider}` : ""}</span>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate font-inter text-[11px] tracking-[-0.44px] text-blue-600 hover:underline"
        >
          {video.url}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className={labelCls}>Subido</span>
          <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
            {fmtDateTime(video.createdAt)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <span className={labelCls}>Actualizado</span>
          <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
            {fmtDateTime(video.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── PreviewPanel ─────────────────────────────────────────────────────────────

const PreviewPanel = ({ video }) => (
  <div className="flex flex-col gap-3 p-4">
    <VideoPreview url={video.url} />
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="truncate font-inter text-[11px] tracking-[-0.44px] text-blue-600 hover:underline"
    >
      Abrir enlace original →
    </a>
  </div>
);

// ── ConfirmBlock ─────────────────────────────────────────────────────────────

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
        <path d="M8 2L14.5 13H1.5L8 2Z" stroke="#dc2626" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 6.5V9.5M8 11v.5" stroke="#dc2626" strokeWidth="1.3" strokeLinecap="round" />
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

// ── EditPanel ────────────────────────────────────────────────────────────────

const EditPanel = ({ video, categoryOptions, onUpdate, onDelete, onClose }) => {
  const [title, setTitle] = useState(video.title ?? "");
  const [description, setDescription] = useState(video.description ?? "");
  const [categoryId, setCategoryId] = useState(
    video.categoryId ?? categoryOptions[0]?.value ?? "",
  );
  const [url, setUrl] = useState(video.url ?? "");
  const [duration, setDuration] = useState(formatDuration(video.durationSec));
  const [visibility, setVisibility] = useState(video.visibility ?? "visible");
  const [membershipType, setMembershipType] = useState(video.membershipType ?? "all");
  const [isPublic, setIsPublic] = useState(video.isPublic ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const source = useMemo(() => detectVideoSource(url), [url]);

  const hasChanges =
    title !== (video.title ?? "") ||
    description !== (video.description ?? "") ||
    categoryId !== video.categoryId ||
    url !== (video.url ?? "") ||
    parseDuration(duration) !== video.durationSec ||
    visibility !== video.visibility ||
    membershipType !== (video.membershipType ?? "all") ||
    isPublic !== (video.isPublic ?? false);

  const handleSave = () => {
    onUpdate?.(video.id, {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      url: url.trim(),
      durationSec: parseDuration(duration),
      visibility,
      membershipType,
      isPublic,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Título</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(inputCls, "h-8")}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelCls}>Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={cn(inputCls, "resize-none py-2")}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className={labelCls}>Categoría</span>
          <SelectDropdown value={categoryId} onChange={setCategoryId} options={categoryOptions} />
        </div>
        <div className="flex flex-col gap-1">
          <span className={labelCls}>Visibilidad</span>
          <SelectDropdown value={visibility} onChange={setVisibility} options={visibilityOptions} />
        </div>
      </div>

      {/* ── Acceso ── */}
      <div className="flex items-start justify-between gap-3 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] p-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
            Público
          </span>
          <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Visible sin iniciar sesión. Ignora la membresía.
          </span>
        </div>
        <Toggle checked={isPublic} onChange={setIsPublic} />
      </div>

      <div
        className={cn(
          "flex flex-col gap-1 transition-opacity",
          isPublic && "pointer-events-none opacity-40"
        )}
      >
        <span className={labelCls}>Membresía requerida</span>
        <SelectDropdown
          value={membershipType}
          onChange={setMembershipType}
          options={membershipOptions}
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className={labelCls}>Enlace del video (Vimeo / YouTube)</span>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={cn(inputCls, "h-8")}
        />
        {source.provider === "other" && (
          <span className="font-inter text-[10px] tracking-[-0.4px] text-amber-600">
            Solo Vimeo y YouTube tienen vista previa.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelCls}>Duración (m:ss)</span>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={cn(inputCls, "h-8 w-28")}
          inputMode="numeric"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Vista previa</span>
        <VideoPreview url={url} />
      </div>

      <button
        type="button"
        disabled={!hasChanges || !title.trim() || !url.trim()}
        onClick={handleSave}
        className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Guardar cambios
      </button>

      {/* ── Danger zone ── */}
      <div className="flex flex-col gap-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)] pt-3">
        {confirmDelete ? (
          <ConfirmBlock
            message="¿Confirmas que quieres eliminar este tutorial? Esta acción es permanente."
            confirmLabel="Sí, eliminar"
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              onDelete?.(video.id);
              onClose?.();
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="h-8 w-full rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] font-inter text-[12px] font-medium tracking-[-0.48px] text-[rgba(25,54,63,0.5)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Eliminar tutorial
          </button>
        )}
      </div>
    </div>
  );
};

// ── TutorialDetailSidebar ────────────────────────────────────────────────────

const SIDEBAR_TABS = [
  { id: "detail", label: "Detalle" },
  { id: "preview", label: "Vista previa" },
  { id: "edit", label: "Editar" },
];

const TutorialDetailSidebar = ({ video, initialTab = "detail", onUpdate, onDelete, onClose }) => {
  const panelRef = useRef(null);
  const [tab, setTab] = useState(initialTab);

  const { data: categories } = useGetAllCategories();
  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => ({ value: c.id, label: c.label })),
    [categories],
  );

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useGSAP(
    () => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, delay: 0.14, ease: "power2.out" }
      );
    },
    { scope: panelRef }
  );

  return (
    <div
      ref={panelRef}
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
            {video.title}
          </p>
          <p className="truncate font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            {video.category} · {formatDate(video.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] transition-colors hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M8.5 1.5l-7 7M1.5 1.5l7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={SIDEBAR_TABS} value={tab} onChange={setTab} className="px-4" />

      {/* Content */}
      <div className="scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent flex-1 overflow-y-auto">
        {tab === "detail" && <DetailPanel video={video} />}
        {tab === "preview" && <PreviewPanel video={video} />}
        {tab === "edit" && (
          <EditPanel
            video={video}
            categoryOptions={categoryOptions}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default TutorialDetailSidebar;
