"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/utils";
import Tabs from "@/components/Tabs";
import Spinner from "@/components/Spinner";
import ErrorComp from "@/components/Error";
import { useEditPoll } from "@/hooks/admin/useEditPoll";
import { useClosePoll } from "@/hooks/admin/useClosePoll";
import { useDeletePoll } from "@/hooks/admin/useDeletePoll";
import { useUploadFile } from "@/hooks/poll/useUploadFile";

gsap.registerPlugin(useGSAP);

// ── FileUploadField ────────────────────────────────────────────────────────────

const FileUploadField = ({
  selectedFile,
  fileName,
  existingUrl,
  isUploading,
  uploadError,
  onSelect,
  onClear,
}) => {
  const inputRef = useRef(null);
  const hasFile = !!selectedFile || !!existingUrl;
  const displayName =
    fileName || (existingUrl ? existingUrl.split("/").pop() : null);

  return (
    <div className="flex flex-col gap-1">
      <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
        Archivo adjunto
      </span>
      {hasFile ? (
        <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-[rgba(25,54,63,0.02)]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-[rgba(25,54,63,0.4)]"
          >
            <path
              d="M9 2H4a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.5L9 2Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M9 2v4.5H13.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          {existingUrl && !selectedFile ? (
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inter text-[11px] tracking-[-0.44px] text-blue-600 hover:underline flex-1 truncate"
            >
              {displayName}
            </a>
          ) : (
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.65)] flex-1 truncate">
              {displayName}
            </span>
          )}
          <button
            type="button"
            onClick={onClear}
            className="size-4 flex items-center justify-center rounded text-[rgba(25,54,63,0.35)] hover:text-red-500 transition-colors shrink-0"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8.5 1.5l-7 7M1.5 1.5l7 7"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 h-8 px-2.5 rounded-lg border-[0.7px] border-dashed border-[rgba(25,54,63,0.2)] text-[rgba(25,54,63,0.45)] hover:border-[rgba(25,54,63,0.4)] hover:text-[#19363F] disabled:opacity-50 transition-colors font-inter text-[11px] tracking-[-0.44px]"
        >
          {isUploading ? (
            <Spinner className="size-3.5" />
          ) : (
            <svg
              width="10"
              height="10"
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
          )}
          {isUploading ? "Subiendo..." : "Subir archivo"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onSelect}
      />
      <ErrorComp
        error={uploadError}
        message={`Error al subir: ${uploadError?.message}`}
      />
    </div>
  );
};

const fmt = (dateStr, opts) =>
  dateStr ? new Date(dateStr).toLocaleDateString(undefined, opts) : "—";

const fmtDatetimeLocal = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED:
    "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.55)] border-[rgba(25,54,63,0.1)]",
};

// ── DetailPanel ────────────────────────────────────────────────────────────────

const DetailPanel = ({ poll }) => {
  const dateOpts = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const statusCls = STATUS_STYLES[poll.status] ?? STATUS_STYLES.CLOSED;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <span className="font-inter text-[10px] font-semibold tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          #{poll.number}
        </span>
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.3px] border",
            statusCls,
          )}
        >
          {poll.status}
        </span>
        <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)]">
          {poll.votes?.length ?? 0} votos
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
          Título
        </span>
        <p className="font-inter text-[12px] tracking-[-0.48px] text-[#19363F] leading-snug">
          {poll.title}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
          Descripción
        </span>
        <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.65)] leading-relaxed whitespace-pre-wrap">
          {poll.description || "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Apertura
          </span>
          <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
            {fmt(poll.startsAt, dateOpts)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Cierre
          </span>
          <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
            {fmt(poll.endsAt, dateOpts)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
          Opciones ({poll.options?.length ?? 0})
        </span>
        {poll.options?.map((opt, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)]"
          >
            <span className="font-inter text-[10px] font-semibold text-[rgba(25,54,63,0.3)] tabular-nums shrink-0 mt-px">
              {i + 1}.
            </span>
            <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)] leading-snug">
              {opt}
            </p>
          </div>
        ))}
      </div>

      {poll.file && (
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Archivo adjunto
          </span>
          <a
            href={poll.file}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter text-[11px] tracking-[-0.44px] text-blue-600 hover:underline truncate"
          >
            Ver archivo →
          </a>
        </div>
      )}
    </div>
  );
};

// ── ResultsPanel ───────────────────────────────────────────────────────────────

const ResultsPanel = ({ poll }) => {
  const votes = poll.votes ?? [];
  const total = votes.length;

  const counts = (poll.options ?? []).reduce((acc, opt) => {
    acc[opt] = votes.filter((v) => v.option === opt).length;
    return acc;
  }, {});

  const comments = votes.filter((v) => v.message?.trim());

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <span className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
          {total}
        </span>
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)]">
          voto{total !== 1 ? "s" : ""} en total
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {(poll.options ?? []).map((opt, i) => {
          const count = counts[opt] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)] leading-snug flex-1">
                  {opt}
                </p>
                <span className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F] tabular-nums shrink-0">
                  {count}{" "}
                  <span className="text-[rgba(25,54,63,0.35)] font-normal">
                    ({pct}%)
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(25,54,63,0.07)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#19363F] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {comments.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)]">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Comentarios ({comments.length})
          </span>
          {comments.map((v) => (
            <div
              key={v._id}
              className="flex flex-col gap-1 p-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)]"
            >
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.65)] leading-relaxed whitespace-pre-wrap">
                {v.message}
              </p>
              <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.3)]">
                {fmt(v.votedAt, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── ConfirmBlock ───────────────────────────────────────────────────────────────

const ConfirmBlock = ({
  message,
  confirmLabel,
  isPending,
  error,
  onCancel,
  onConfirm,
  pendingLabel,
}) => (
  <div className="flex flex-col gap-2 p-3 rounded-lg border-[0.7px] border-red-200 bg-red-50">
    <div className="flex items-start gap-2">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 mt-px"
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
      <p className="font-inter text-[11px] tracking-[-0.44px] text-red-700 leading-relaxed">
        {message}
      </p>
    </div>
    <ErrorComp error={error} message={error?.message} />
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-7 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] bg-white text-[rgba(25,54,63,0.6)] font-inter text-[11px] font-medium tracking-[-0.44px] hover:bg-[rgba(25,54,63,0.04)] transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={onConfirm}
        className="flex-1 h-7 rounded-lg bg-red-600 text-white font-inter text-[11px] font-medium tracking-[-0.44px] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
      >
        {isPending ? (
          <>
            <Spinner className="size-3" />
            {pendingLabel}
          </>
        ) : (
          confirmLabel
        )}
      </button>
    </div>
  </div>
);

// ── EditPanel ──────────────────────────────────────────────────────────────────

const EditPanel = ({ poll, onClose }) => {
  const [title, setTitle] = useState(poll.title ?? "");
  const [description, setDescription] = useState(poll.description ?? "");
  const [options, setOptions] = useState(
    (poll.options ?? [""]).map((v, i) => ({ id: `${i}-${v}`, value: v })),
  );
  const [startsAt, setStartsAt] = useState(fmtDatetimeLocal(poll.startsAt));
  const [endsAt, setEndsAt] = useState(fmtDatetimeLocal(poll.endsAt));
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [removedExistingFile, setRemovedExistingFile] = useState(false);

  const {
    mutate: editPoll,
    isPending: isSaving,
    error: saveError,
    isSuccess: isSaveSuccess,
  } = useEditPoll();
  const {
    mutate: closePoll,
    isPending: isClosing,
    error: closeError,
    isSuccess: isCloseSuccess,
  } = useClosePoll();
  const {
    mutate: deletePoll,
    isPending: isDeleting,
    error: deleteError,
    isSuccess: isDeleteSuccess,
  } = useDeletePoll();
  const {
    mutate: uploadFile,
    isPending: isUploading,
    error: uploadError,
  } = useUploadFile();

  const optionValues = options.map((o) => o.value);

  const hasChanges =
    title !== (poll.title ?? "") ||
    description !== (poll.description ?? "") ||
    JSON.stringify(optionValues) !== JSON.stringify(poll.options ?? []) ||
    startsAt !== fmtDatetimeLocal(poll.startsAt) ||
    endsAt !== fmtDatetimeLocal(poll.endsAt) ||
    selectedFile !== null ||
    removedExistingFile;

  const handleSave = () => {
    const payload = {
      number: poll.number,
      title,
      description,
      options: optionValues,
      startsAt: startsAt ? new Date(startsAt).getTime() : undefined,
      endsAt: endsAt ? new Date(endsAt).getTime() : undefined,
    };
    if (selectedFile) {
      uploadFile(selectedFile, {
        onSuccess: (data) => editPoll({ ...payload, fileId: data?.fileId }),
      });
    } else {
      editPoll({ ...payload, fileId: removedExistingFile ? "" : undefined });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemovedExistingFile(false);
    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleFileClear = () => {
    if (!selectedFile && poll.file) setRemovedExistingFile(true);
    setSelectedFile(null);
    setFileName("");
  };

  const handleClosePoll = () => {
    closePoll({ number: poll.number });
  };

  const handleDelete = () => {
    deletePoll({ number: poll.number });
  };

  const addOption = () =>
    setOptions((prev) => [...prev, { id: `new-${Date.now()}`, value: "" }]);
  const removeOption = (id) =>
    setOptions((prev) => prev.filter((o) => o.id !== id));
  const updateOption = (id, val) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, value: val } : o)),
    );

  const inputCls =
    "w-full px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white font-inter text-[12px] tracking-[-0.48px] text-[#19363F] placeholder:text-[rgba(25,54,63,0.3)] outline-none focus:border-[rgba(25,54,63,0.4)] transition-colors";

  const isClosed = poll.status === "CLOSED";

  if (isDeleteSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 h-full text-center">
        <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F]">
            Encuesta eliminada
          </p>
          <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)]">
            La encuesta ha sido eliminada correctamente.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 px-4 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] text-[rgba(25,54,63,0.6)] font-inter text-[11px] font-medium tracking-[-0.44px] hover:bg-[rgba(25,54,63,0.04)] transition-colors"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {isSaveSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-inter text-[11px] tracking-[-0.44px] text-emerald-700">
            Cambios guardados correctamente
          </span>
        </div>
      )}

      {isCloseSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-inter text-[11px] tracking-[-0.44px] text-emerald-700">
            Encuesta cerrada correctamente
          </span>
        </div>
      )}

      {isClosed && !isCloseSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 2L14.5 13H1.5L8 2Z"
              stroke="#d97706"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M8 6.5V9.5M8 11v.5"
              stroke="#d97706"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-inter text-[11px] tracking-[-0.44px] text-amber-700">
            Esta encuesta está cerrada
          </span>
        </div>
      )}

      <ErrorComp
        error={saveError}
        message={`Error al guardar: ${saveError?.message}`}
      />

      <label className="flex flex-col gap-1">
        <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
          Título
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(inputCls, "h-8")}
          disabled={isClosed}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
          Descripción
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={cn(inputCls, "py-2 resize-none")}
          disabled={isClosed}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Apertura
          </span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={cn(inputCls, "h-8")}
            disabled={isClosed}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Cierre
          </span>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={cn(inputCls, "h-8")}
            disabled={isClosed}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
          Opciones
        </span>
        {options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-1.5">
            <span className="font-inter text-[10px] font-semibold text-[rgba(25,54,63,0.3)] tabular-nums w-4 shrink-0 text-right">
              {i + 1}.
            </span>
            <input
              type="text"
              value={opt.value}
              onChange={(e) => updateOption(opt.id, e.target.value)}
              className={cn(inputCls, "h-7 flex-1 text-[11px]")}
              placeholder={`Opción ${i + 1}`}
              disabled={isClosed}
            />
            {!isClosed && options.length > 1 && (
              <button
                type="button"
                onClick={() => removeOption(opt.id)}
                className="size-5 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.35)] hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
              >
                <svg
                  width="8"
                  height="8"
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
            )}
          </div>
        ))}
        {!isClosed && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 h-7 px-2 rounded-lg border-[0.7px] border-dashed border-[rgba(25,54,63,0.2)] text-[rgba(25,54,63,0.45)] hover:border-[rgba(25,54,63,0.4)] hover:text-[#19363F] transition-colors font-inter text-[11px] tracking-[-0.44px]"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 1v8M1 5h8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            Añadir opción
          </button>
        )}
      </div>

      <FileUploadField
        selectedFile={selectedFile}
        fileName={fileName}
        existingUrl={removedExistingFile ? null : poll.file}
        isUploading={isUploading}
        uploadError={uploadError}
        onSelect={handleFileSelect}
        onClear={handleFileClear}
      />

      {!isClosed && (
        <button
          type="button"
          disabled={!hasChanges || isSaving || isUploading}
          onClick={handleSave}
          className="w-full h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Spinner className="size-3.5" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
      )}

      {/* ── Danger zone ── */}
      <div className="flex flex-col gap-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)] pt-3">
        {!isClosed &&
          (confirmClose ? (
            <ConfirmBlock
              message="¿Confirmas que quieres cerrar esta encuesta? Esta acción no se puede deshacer y los Founders ya no podrán votar."
              confirmLabel="Sí, cerrar"
              pendingLabel="Cerrando..."
              isPending={isClosing}
              error={closeError}
              onCancel={() => setConfirmClose(false)}
              onConfirm={handleClosePoll}
            />
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClose(true)}
              className="w-full h-8 rounded-lg border-[0.7px] border-red-200 bg-red-50 text-red-600 font-inter text-[12px] font-medium tracking-[-0.48px] hover:bg-red-100 transition-colors"
            >
              Cerrar encuesta
            </button>
          ))}

        {confirmDelete ? (
          <ConfirmBlock
            message="¿Confirmas que quieres eliminar esta encuesta? Esta acción es permanente y no se puede deshacer."
            confirmLabel="Sí, eliminar"
            pendingLabel="Eliminando..."
            isPending={isDeleting}
            error={deleteError}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
          />
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full h-8 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] text-[rgba(25,54,63,0.5)] font-inter text-[12px] font-medium tracking-[-0.48px] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Eliminar encuesta
          </button>
        )}
      </div>
    </div>
  );
};

// ── PollDetailSidebar ──────────────────────────────────────────────────────────

const SIDEBAR_TABS = [
  { id: "detail", label: "Detalle" },
  { id: "results", label: "Resultados" },
  { id: "edit", label: "Editar" },
];

const PollDetailSidebar = ({ poll, onClose }) => {
  const panelRef = useRef(null);
  const [tab, setTab] = useState("detail");

  useEffect(() => {
    setTab("detail");
  }, [poll._id]);

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

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] truncate">
            Encuesta #{poll.number}
          </p>
          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] truncate">
            {poll.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors mt-0.5"
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

      {/* Tabs */}
      <Tabs
        tabs={SIDEBAR_TABS}
        value={tab}
        onChange={setTab}
        className="px-4"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
        {tab === "detail" && <DetailPanel poll={poll} />}
        {tab === "results" && <ResultsPanel poll={poll} />}
        {tab === "edit" && <EditPanel poll={poll} onClose={onClose} />}
      </div>
    </div>
  );
};

export default PollDetailSidebar;
