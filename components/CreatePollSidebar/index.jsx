"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/utils";
import Spinner from "@/components/Spinner";
import ErrorComp from "@/components/Error";
import { useCreatePoll } from "@/hooks/admin/useCreatePoll";
import { useUploadFile } from "@/hooks/poll/useUploadFile";

gsap.registerPlugin(useGSAP);

// ── FileUploadField ────────────────────────────────────────────────────────────

const FileUploadField = ({
  selectedFile,
  fileName,
  uploadError,
  onSelect,
  onClear,
}) => {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-col gap-1">
      <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
        Archivo adjunto
      </span>
      {selectedFile ? (
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
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.65)] flex-1 truncate">
            {fileName}
          </span>
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
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 h-8 px-2.5 rounded-lg border-[0.7px] border-dashed border-[rgba(25,54,63,0.2)] text-[rgba(25,54,63,0.45)] hover:border-[rgba(25,54,63,0.4)] hover:text-[#19363F] transition-colors font-inter text-[11px] tracking-[-0.44px]"
        >
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
          Subir archivo
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

// ──────────────────────────────────────────────────────────────────────────────

const fmtDatetimeLocal = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CreatePollSidebar = ({ nextNumber, onClose }) => {
  const panelRef = useRef(null);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 7);

  const [number, setNumber] = useState(String(nextNumber ?? ""));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([
    { id: "o-0", value: "" },
    { id: "o-1", value: "" },
  ]);
  const [startsAt, setStartsAt] = useState(fmtDatetimeLocal(now));
  const [endsAt, setEndsAt] = useState(fmtDatetimeLocal(tomorrow));

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const { mutate: createPoll, isPending, error, isSuccess } = useCreatePoll();
  const {
    mutate: uploadFile,
    isPending: isUploading,
    error: uploadError,
  } = useUploadFile();

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    setFileName("");
  };

  const addOption = () =>
    setOptions((prev) => [...prev, { id: `o-${Date.now()}`, value: "" }]);
  const removeOption = (id) =>
    setOptions((prev) => prev.filter((o) => o.id !== id));
  const updateOption = (id, val) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, value: val } : o)),
    );

  const handleSubmit = () => {
    const payload = {
      number: Number(number),
      title,
      description,
      options: options.map((o) => o.value).filter(Boolean),
      startsAt: startsAt ? new Date(startsAt).getTime() : undefined,
      endsAt: endsAt ? new Date(endsAt).getTime() : undefined,
    };

    if (selectedFile) {
      uploadFile(selectedFile, {
        onSuccess: (data) =>
          createPoll(
            { ...payload, fileId: data?.fileId },
            { onSuccess: onClose },
          ),
      });
    } else {
      createPoll(payload, { onSuccess: onClose });
    }
  };

  const canSubmit =
    title.trim() && number && options.filter((o) => o.value.trim()).length >= 1;

  const inputCls =
    "w-full px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white font-inter text-[12px] tracking-[-0.48px] text-[#19363F] placeholder:text-[rgba(25,54,63,0.3)] outline-none focus:border-[rgba(25,54,63,0.4)] transition-colors";

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F]">
          Nueva encuesta
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors"
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

      {/* Form */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
        <div className="flex flex-col gap-4 p-4">
          <ErrorComp
            error={error}
            message={`Error al crear: ${error?.message}`}
          />

          {isSuccess && (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="font-inter text-[11px] tracking-[-0.44px] text-emerald-700">
                Encuesta creada correctamente
              </span>
            </div>
          )}

          <div className="grid grid-cols-[72px_1fr] gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
                N.º
              </span>
              <input
                type="number"
                min={1}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className={cn(inputCls, "h-8")}
                placeholder="1"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
                Título
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(inputCls, "h-8")}
                placeholder="Título de la encuesta"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
              Descripción
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className={cn(inputCls, "py-2 resize-none")}
              placeholder="Texto de la encuesta..."
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
                />
                {options.length > 1 && (
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
          </div>

          <FileUploadField
            selectedFile={selectedFile}
            fileName={fileName}
            uploadError={uploadError}
            onSelect={handleFileSelect}
            onClear={handleFileClear}
          />

          <button
            type="button"
            disabled={!canSubmit || isPending || isUploading}
            onClick={handleSubmit}
            className="w-full h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Spinner className="size-3.5" />
                Creando...
              </>
            ) : (
              "Crear encuesta"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePollSidebar;
