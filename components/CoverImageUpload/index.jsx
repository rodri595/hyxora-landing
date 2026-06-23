"use client";

import ErrorComp from "@/components/Error";
import Spinner from "@/components/Spinner";
import { useUploadCover } from "@/hooks/admin/useUploadCover";
import { gradientFromAccent } from "@/utils/video";
import { useEffect, useRef, useState } from "react";

const labelCls =
  "font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase";

const UploadGlyph = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 12V4M4 8l4-4 4 4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 14h12"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const IconButton = ({ label, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="flex size-6 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
  >
    {children}
  </button>
);

/**
 * Cover-image picker for a tutorial. Uploads the chosen file through the
 * dedicated cover upload endpoint and reports the returned `fileId` back via
 * `onChange` (the value submitted as the tutorial's `coverId`). While empty it
 * shows the on-brand fallback gradient the member cards use.
 *
 * @param {string}        value     – current cover (the `coverId` fileId, or "").
 * @param {(next: string) => void} onChange – receives the new fileId, or "" when cleared.
 * @param {string}        [accent]  – category accent for the fallback gradient.
 * @param {string}        [currentUrl] – existing cover URL to show by default when
 *   `value` is empty (listings return `coverImgUrl`, not the `coverId` fileId).
 * @param {(uploading: boolean) => void} [onUploadingChange] – lets the parent
 *   disable submit while an upload is in flight.
 * @param {boolean}       [required] – when true the empty-state hint reflects that
 *   a cover is mandatory (the parent still gates submission).
 * @param {string}        [label]
 */
const CoverImageUpload = ({
  value,
  onChange,
  accent,
  currentUrl,
  onUploadingChange,
  required = false,
  label = "Imagen de portada (opcional)",
}) => {
  const inputRef = useRef(null);
  const [from, to] = gradientFromAccent(accent);
  const { mutate: uploadFile, isPending, error, reset } = useUploadCover();

  // Surface the in-flight state without re-running effects on every render.
  const onUploadingChangeRef = useRef(onUploadingChange);
  onUploadingChangeRef.current = onUploadingChange;
  useEffect(() => {
    onUploadingChangeRef.current?.(isPending);
  }, [isPending]);

  // Instant local preview for a freshly picked file — the stored value is a
  // fileId the browser can't resolve on its own, so we keep the blob URL around
  // until the panel closes.
  const [localPreview, setLocalPreview] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);
  // Hides the existing `currentUrl` cover once the user removes it (the parent
  // tracks the actual removal for submission).
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  // The submitted value stays the raw fileId; only the preview gets resolved to
  // a displayable URL. Priority: a fresh blob pick → a set fileId → the existing
  // cover passed in via `currentUrl` (unless the user just removed it).
  const existingSrc = removed ? null : currentUrl || null;
  const previewSrc = localPreview ?? (value ? value : existingSrc);
  const showImg = Boolean(previewSrc) && !imgFailed;

  const pick = () => inputRef.current?.click();

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;
    reset();
    setImgFailed(false);
    setRemoved(false);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    uploadFile(file, {
      onSuccess: (data) => {
        if (data?.fileId) onChange(data.fileId);
      },
    });
  };

  const handleRemove = () => {
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImgFailed(false);
    setRemoved(true);
    reset();
    onChange("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>

      <div
        className="relative aspect-video w-full overflow-hidden rounded-[8px] border-[0.7px] border-[rgba(25,54,63,0.08)]"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        {showImg ? (
          <img
            src={previewSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={pick}
            disabled={isPending}
            className="group/cover absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center disabled:cursor-default"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm transition-transform group-hover/cover:scale-105">
              <UploadGlyph />
            </span>
            <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-white/85">
              Subir portada
            </span>
            <span className="font-inter text-[9.5px] tracking-[-0.3px] text-white/55">
              {required
                ? "Requerida para crear el tutorial"
                : "Si lo dejas vacío se usa este degradado"}
            </span>
          </button>
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
            <Spinner className="size-5" />
          </div>
        )}

        {showImg && !isPending && (
          <div className="absolute right-1.5 top-1.5 flex gap-1">
            <IconButton label="Cambiar portada" onClick={pick}>
              <UploadGlyph />
            </IconButton>
            <IconButton label="Quitar portada" onClick={handleRemove}>
              <svg
                width="9"
                height="9"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8.5 1.5l-7 7M1.5 1.5l7 7"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />

      {error && (
        <ErrorComp
          error={error}
          message={`Error al subir: ${error?.message}`}
        />
      )}
    </div>
  );
};

export default CoverImageUpload;
