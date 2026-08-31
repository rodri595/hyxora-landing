"use client";

import { VISIBILITY_OPTIONS } from "@/app/(dashboard)/admin/_data/tutorials";
import Checkbox from "@/components/Checkbox";
import CoverImageUpload from "@/components/CoverImageUpload";
import Field from "@/components/Field";
import SelectDropdown from "@/components/SelectDropdown";
import VideoPreview from "@/components/VideoPreview";
import { useGetAllCategories } from "@/hooks/admin/useGetAllCategories";
import { detectVideoSource, formatDuration, parseDuration } from "@/utils/video";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const CreateTutorialSidebar = ({ onClose, onCreate, onCreateCategory }) => {
  const panelRef = useRef(null);

  const { data: categories } = useGetAllCategories();
  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => ({ value: c.id, label: c.label })),
    [categories]
  );
  const hasCategories = categoryOptions.length > 0;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [url, setUrl] = useState("");
  const [coverId, setCoverId] = useState("");
  const [duration, setDuration] = useState("");
  const [order, setOrder] = useState("");
  const [visibility, setVisibility] = useState("visible");
  const [isPublic, setIsPublic] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const source = useMemo(() => detectVideoSource(url), [url]);
  const accent = useMemo(
    () => (categories ?? []).find((c) => c.id === categoryId)?.accent,
    [categories, categoryId]
  );

  // Default to the first category once the list has loaded.
  useEffect(() => {
    if (!categoryId && categoryOptions.length > 0) {
      setCategoryId(categoryOptions[0].value);
    }
  }, [categoryId, categoryOptions]);

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

  // Auto-fill the duration from Vimeo metadata if the admin hasn't typed one.
  const handlePlayerReady = useCallback(({ duration: secs }) => {
    if (!secs) return;
    setDuration((prev) => (prev.trim() ? prev : formatDuration(secs)));
  }, []);

  const handleSubmit = () => {
    onCreate?.({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      url: url.trim(),
      coverId: coverId || null,
      durationSec: parseDuration(duration),
      // Packed into the title by useCreateTutorial — the backend has no column
      // for it (utils/tutorialTitle.js).
      order: order.trim(),
      visibility,
      isPublic,
    });
  };

  const canSubmit = title.trim() && url.trim() && categoryId && source.provider && coverId;

  return (
    <div
      ref={panelRef}
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3">
        <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
          Nuevo tutorial
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] transition-colors hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F]"
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

      {/* Form */}
      <div className="scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <Field
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del tutorial"
          />

          <Field
            label="Descripción"
            textarea
            classInput={TEXTAREA_CLS}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del contenido..."
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className={labelCls}>Categoría</span>
              {hasCategories ? (
                <SelectDropdown
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categoryOptions}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onCreateCategory?.()}
                  className="flex h-8 w-full items-center justify-center gap-1 rounded-lg border-[0.7px] border-dashed border-[rgba(25,54,63,0.25)] font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.55)] transition-colors hover:border-[#19363F] hover:text-[#19363F]"
                >
                  <span className="text-[13px] leading-none">+</span>
                  Crear categoría
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className={labelCls}>Visibilidad</span>
              <SelectDropdown
                value={visibility}
                onChange={setVisibility}
                options={visibilityOptions}
              />
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
              placeholder="https://vimeo.com/123456789"
            />
            {url.trim() && !source.provider && (
              <span className="font-inter text-[10px] tracking-[-0.4px] text-amber-600">
                Enlace no reconocido.
              </span>
            )}
            {source.provider === "other" && (
              <span className="font-inter text-[10px] tracking-[-0.4px] text-amber-600">
                Solo Vimeo y YouTube tienen vista previa.
              </span>
            )}
            {(source.provider === "vimeo" || source.provider === "youtube") && (
              <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                Detectado: {source.provider === "vimeo" ? "Vimeo" : "YouTube"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Duración (m:ss)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="6:52"
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

          <CoverImageUpload
            value={coverId}
            onChange={setCoverId}
            onUploadingChange={setCoverUploading}
            accent={accent}
            label="Imagen de portada"
            required
          />

          {/* Preview */}
          <div className="flex flex-col gap-1">
            <span className={labelCls}>Vista previa</span>
            <VideoPreview url={url} onReady={handlePlayerReady} />
          </div>

          {!hasCategories && (
            <p className="font-inter text-[10px] leading-relaxed tracking-[-0.4px] text-amber-600">
              Necesitas al menos una categoría antes de crear un tutorial.
            </p>
          )}

          <button
            type="button"
            disabled={!canSubmit || coverUploading}
            onClick={handleSubmit}
            className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {coverUploading ? "Subiendo portada…" : "Crear tutorial"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTutorialSidebar;
