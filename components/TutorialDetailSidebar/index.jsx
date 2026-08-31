"use client";

import { VISIBILITY, VISIBILITY_OPTIONS } from "@/app/(dashboard)/admin/_data/tutorials";
import Checkbox from "@/components/Checkbox";
import CoverImageUpload from "@/components/CoverImageUpload";
import Field from "@/components/Field";
import Image from "@/components/Image";
import SelectDropdown from "@/components/SelectDropdown";
import Tabs from "@/components/Tabs";
import VideoPreview from "@/components/VideoPreview";
import { useGetAllCategories } from "@/hooks/admin/useGetAllCategories";
import { cn } from "@/utils";
import {
  detectVideoSource,
  formatDate,
  formatDuration,
  gradientFromAccent,
  parseDuration,
} from "@/utils/video";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const visibilityOptions = VISIBILITY_OPTIONS.map((v) => ({
  value: v.id,
  label: v.label,
}));

const labelCls =
  "font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase";

// Compact textarea styling for <Field textarea> so it matches the dense admin
// inputs (the Field default is a taller, rounded variant).
const TEXTAREA_CLS =
  "h-auto min-h-[84px] px-[16px] py-3 border-[0.7px] border-[rgba(25,54,63,0.02)] rounded-[8px] bg-[rgba(25,54,63,0.02)] text-[12px] text-[#5E7279] focus:bg-white focus:border-[rgba(25,54,63,0.04)]";

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

// ── CoverThumb ───────────────────────────────────────────────────────────────
// Read-only 16:9 preview of the tutorial cover. Falls back to the on-brand
// gradient (derived from the category accent) when there's no image or it fails.

const CoverThumb = ({ coverImgUrl, accent }) => {
  const [from, to] = gradientFromAccent(accent);
  const coverUrl = coverImgUrl;

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-[8px] border-[0.7px] border-[rgba(25,54,63,0.08)]"
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <Image
        alt="Portada"
        src={coverUrl}
        width={100}
        height={100}
        className="absolute inset-0 size-full object-cover"
        // unoptimized
      />
    </div>
  );
};

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
        {video.order !== null && video.order !== undefined && (
          <span className="inline-flex items-center rounded-[5px] bg-[rgba(25,54,63,0.06)] px-1.5 py-0.5 font-inter text-[10px] font-medium tabular-nums tracking-[-0.3px] text-[rgba(25,54,63,0.6)]">
            Orden {video.order}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Acceso</span>
        <div className="flex flex-wrap items-center gap-2">
          {video.isPublic ? (
            <>
              <span className="inline-flex items-center rounded-[5px] bg-emerald-50 px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px] text-emerald-700">
                Público
              </span>
              <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                Visible sin iniciar sesión
              </span>
            </>
          ) : (
            <span className="inline-flex items-center rounded-[5px] bg-[rgba(25,54,63,0.06)] px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px] text-[rgba(25,54,63,0.6)]">
              Privado
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

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Portada</span>
        <CoverThumb coverImgUrl={video.coverImgUrl} accent={video.accent} />
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
    <CoverThumb coverImgUrl={video.coverImgUrl} accent={video.accent} />

    <VideoPreview url={video.url} cover={video.coverImgUrl} />
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
  const [categoryId, setCategoryId] = useState(video.categoryId ?? categoryOptions[0]?.value ?? "");
  const [url, setUrl] = useState(video.url ?? "");
  const [coverId, setCoverId] = useState(video.coverId ?? "");
  const [duration, setDuration] = useState(formatDuration(video.durationSec));
  // `order` arrives already unpacked from the title by decorateTutorial.
  const [order, setOrder] = useState(
    video.order === null || video.order === undefined ? "" : String(video.order)
  );
  const [visibility, setVisibility] = useState(video.visibility ?? "visible");
  const [isPublic, setIsPublic] = useState(video.isPublic ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Listings return the cover as a URL (`coverImgUrl`), not the `coverId` fileId,
  // so we show it as the current cover and track removal separately — there's no
  // baseline fileId to diff against.
  const currentCoverUrl = video.coverImgUrl;
  const hasExistingCover = Boolean(video.coverImgUrl || video.coverId);
  const [coverRemoved, setCoverRemoved] = useState(false);

  const handleCoverChange = (next) => {
    setCoverId(next);
    setCoverRemoved(!next && hasExistingCover);
  };

  const source = useMemo(() => detectVideoSource(url), [url]);
  // The selected category's accent drives the fallback gradient preview.
  const accent = useMemo(
    () => categoryOptions.find((c) => c.value === categoryId)?.accent ?? video.accent,
    [categoryOptions, categoryId, video.accent]
  );

  const coverChanged = coverId !== (video.coverId ?? "") || (coverRemoved && hasExistingCover);

  const hasChanges =
    title !== (video.title ?? "") ||
    description !== (video.description ?? "") ||
    categoryId !== video.categoryId ||
    url !== (video.url ?? "") ||
    coverChanged ||
    parseDuration(duration) !== video.durationSec ||
    order.trim() !==
      (video.order === null || video.order === undefined ? "" : String(video.order)) ||
    visibility !== video.visibility ||
    isPublic !== (video.isPublic ?? false);

  const handleSave = () => {
    onUpdate?.(video.id, {
      title: title.trim(),
      // Repacked into the title by useEditTutorial; `titleMeta` carries any
      // other keys the payload already held so an edit doesn't drop them.
      order: order.trim(),
      titleMeta: video.titleMeta,
      description: description.trim(),
      categoryId,
      url: url.trim(),
      // Only send coverId when it actually changed: a new fileId moves the temp
      // upload to permanent, "" sends null to remove, and omitting it entirely
      // leaves the existing cover untouched (re-sending a permanent fileId would 400).
      ...(coverChanged && { coverId: coverId || null }),
      durationSec: parseDuration(duration),
      visibility,
      isPublic,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />

      <Field
        label="Descripción"
        textarea
        classInput={TEXTAREA_CLS}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

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
      <div className="flex flex-col gap-1 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] p-2.5">
        <Checkbox
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          label="Público"
          labelClassName="font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]"
        />
        <span className="pl-5.5 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          Visible sin iniciar sesión.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <Field
          label="Enlace del video (Vimeo / YouTube)"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {source.provider === "other" && (
          <span className="font-inter text-[10px] tracking-[-0.4px] text-amber-600">
            Solo Vimeo y YouTube tienen vista previa.
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Duración (m:ss)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          inputMode="numeric"
        />
        <div className="flex flex-col gap-1">
          <Field
            label="Orden"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="1"
            inputMode="numeric"
          />
          <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Posición en el curso. Sin número, va al final por fecha.
          </span>
        </div>
      </div>
      <CoverThumb coverImgUrl={video.coverImgUrl} accent={video.accent} />

      <CoverImageUpload
        value={coverId}
        onChange={handleCoverChange}
        currentUrl={currentCoverUrl}
        onUploadingChange={setCoverUploading}
        accent={accent}
      />

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Vista previa</span>
        <VideoPreview url={url} />
      </div>

      <button
        type="button"
        disabled={!hasChanges || !title.trim() || !url.trim() || coverUploading}
        onClick={handleSave}
        className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {coverUploading ? "Subiendo portada…" : "Guardar cambios"}
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

const TutorialDetailSidebar = ({
  video,
  initialTab = "detail",
  openSignal,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const panelRef = useRef(null);
  const [tab, setTab] = useState(initialTab);

  const { data: categories } = useGetAllCategories();
  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((c) => ({
        value: c.id,
        label: c.label,
        accent: c.accent,
      })),
    [categories]
  );

  // Re-apply the requested tab on every action click (openSignal bumps each time),
  // not just when initialTab's value changes — the sidebar stays mounted across
  // clicks on the same row, so "edit" → "edit" must still snap back to the tab.
  // biome-ignore lint/correctness/useExhaustiveDependencies: openSignal is an intentional re-trigger, not read in the body.
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, openSignal]);

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
