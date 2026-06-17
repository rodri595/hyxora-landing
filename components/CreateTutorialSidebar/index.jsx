"use client";

import { CATEGORIES, VISIBILITY_OPTIONS } from "@/app/(dashboard)/admin/_data/tutorials";
import SelectDropdown from "@/components/SelectDropdown";
import VideoPreview from "@/components/VideoPreview";
import { cn } from "@/utils";
import { detectVideoSource, formatDuration, parseDuration } from "@/utils/video";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const categoryOptions = CATEGORIES.map((c) => ({ value: c.id, label: c.label }));
const visibilityOptions = VISIBILITY_OPTIONS.map((v) => ({
  value: v.id,
  label: v.label,
}));

const inputCls =
  "w-full px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white font-inter text-[12px] tracking-[-0.48px] text-[#19363F] placeholder:text-[rgba(25,54,63,0.3)] outline-none focus:border-[rgba(25,54,63,0.4)] transition-colors";

const labelCls =
  "font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase";

const CreateTutorialSidebar = ({ onClose, onCreate }) => {
  const panelRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id ?? "");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [visibility, setVisibility] = useState("visible");

  const source = useMemo(() => detectVideoSource(url), [url]);

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
      durationSec: parseDuration(duration),
      visibility,
    });
    onClose?.();
  };

  const canSubmit = title.trim() && url.trim() && source.provider && source.provider !== null;

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
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Título</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(inputCls, "h-8")}
              placeholder="Título del tutorial"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Descripción</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={cn(inputCls, "resize-none py-2")}
              placeholder="Breve descripción del contenido..."
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className={labelCls}>Categoría</span>
              <SelectDropdown
                value={categoryId}
                onChange={setCategoryId}
                options={categoryOptions}
              />
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

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Enlace del video (Vimeo / YouTube)</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={cn(inputCls, "h-8")}
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
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Duración (m:ss)</span>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={cn(inputCls, "h-8 w-28")}
              placeholder="6:52"
              inputMode="numeric"
            />
          </label>

          {/* Preview */}
          <div className="flex flex-col gap-1">
            <span className={labelCls}>Vista previa</span>
            <VideoPreview url={url} onReady={handlePlayerReady} />
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Crear tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTutorialSidebar;
