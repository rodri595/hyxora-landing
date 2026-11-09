"use client";

import Checkbox from "@/components/Checkbox";
import DataTable from "@/components/DataTable";
import {
  cerebroMembershipKey,
  cerebroMembershipLabel,
  cerebroPlanLabel,
} from "@/constants/cerebro";
import { SWEEP_MAX_PAGES, useGetUsersSweep } from "@/hooks/cerebro/useGetUsersSweep";
import { cn } from "@/utils";
import { formatNumber, toDayString } from "@/utils/format";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import QueryState from "../../shared/QueryState";
import { firstNumber } from "../../shared/aggregate";
import { withFounderFields } from "./founders";

/** Wide enough for the column list and a preview of five or six columns. */
export const CRM_EXPORT_DRAWER_WIDTH = 640;

const STORAGE_KEY = "hx-crm-export-v1";
const PREVIEW_ROWS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** dd/mm/aaaa as text, so the CRM imports the day it reads and not a serial number. */
const toDate = (value) => {
  const date = parseDate(value);
  return date ? dateFormat.format(date) : null;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysUntil = (value) => {
  const date = parseDate(value);
  if (!date) return null;
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
};

/**
 * When the paid period ends: the cancellation date for someone on their way out,
 * the renewal date for everyone else, nothing for an account with no membership.
 */
const periodEnd = (row) => {
  const status = cerebroMembershipKey(row.membershipStatus);
  if (status === "none") return null;
  if (status === "toCancel" && row.cancelEffectiveDate) return row.cancelEffectiveDate;
  return row.membershipRenewDate;
};

const capitalise = (text) => (text ? text[0].toUpperCase() + text.slice(1) : text);

/**
 * Every column the CRM file can carry. `header` is the default name, which the
 * person exporting can rename to whatever their CRM calls it. `source` marks a
 * field `/users` does not send yet: while no row carries it the column is offered
 * but flagged as arriving empty, and the flag goes away on its own once it lands.
 */
const CRM_FIELDS = [
  {
    id: "name",
    header: "Nombre",
    hint: "Nombre completo; de momento solo lo tiene quien compró en la web founders",
    on: true,
    // `name` is the full name requested from Cerebro in docs/cerebro-users-membership-fields.md.
    value: (row) => row.name || row.founderName,
  },
  {
    id: "email",
    header: "Correo",
    hint: "Con esto el CRM reconoce a los contactos que ya tiene",
    on: true,
    value: (row) => row.email || row.founderEmail,
  },
  {
    id: "phone",
    header: "Teléfono",
    hint: "De la web founders",
    on: true,
    value: (row) => row.founderPhone,
  },
  {
    id: "created",
    header: "Fecha de creación",
    hint: "Día en que se registró",
    on: true,
    value: (row) => toDate(row.createdAt),
  },
  {
    id: "plan",
    header: "Plan",
    on: true,
    value: (row) => (row.plan ? cerebroPlanLabel(row.plan) : null),
  },
  {
    id: "status",
    header: "Membresía",
    hint: "Activa, cancelará, suspendida, sin membresía…",
    on: true,
    value: (row) => capitalise(cerebroMembershipLabel(row.membershipStatus)),
  },
  {
    id: "since",
    header: "Miembro desde",
    hint: "Cuándo empezó su membresía",
    source: "membershipStartDate",
    on: true,
    value: (row) => toDate(row.membershipStartDate),
  },
  {
    id: "renewed",
    header: "Última renovación",
    hint: "Último cobro de la membresía",
    source: "membershipLastRenewedAt",
    on: true,
    value: (row) => toDate(row.membershipLastRenewedAt),
  },
  {
    id: "until",
    header: "Vence",
    hint: "Próxima renovación, o fin si va a cancelar",
    on: true,
    value: (row) => toDate(periodEnd(row)),
  },
  {
    id: "daysLeft",
    header: "Días restantes",
    hint: "Días hasta «Vence»; negativo si ya pasó",
    on: true,
    value: (row) => daysUntil(periodEnd(row)),
  },
  {
    id: "interval",
    header: "Periodicidad",
    hint: "Mensual o anual",
    source: "membershipInterval",
    on: false,
    value: (row) => ({ month: "Mensual", year: "Anual" })[row.membershipInterval] ?? null,
  },
  {
    id: "paymentType",
    header: "Forma de pago",
    source: "membershipPaymentType",
    on: false,
    value: (row) => row.membershipPaymentType,
  },
  {
    id: "username",
    header: "Usuario",
    hint: "Nombre de usuario en la app",
    on: false,
    value: (row) => row.username,
  },
  {
    id: "tvl",
    header: "Saldo (USD)",
    hint: "Dinero que tiene dentro de Hyxora",
    on: false,
    value: (row) => firstNumber(row.tvlUsd),
  },
  {
    id: "privyId",
    header: "ID Hyxora",
    hint: "Identificador interno del usuario",
    on: false,
    value: (row) => row.privyId,
  },
];

const defaultConfig = () =>
  Object.fromEntries(CRM_FIELDS.map((field) => [field.id, { on: field.on, header: field.header }]));

/** The last choice in this browser, so the columns don't have to be set up every time. */
const loadConfig = () => {
  const config = defaultConfig();
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    for (const id of Object.keys(config)) {
      const entry = saved.fields?.[id];
      if (typeof entry?.on === "boolean") config[id].on = entry.on;
      if (typeof entry?.header === "string") config[id].header = entry.header;
    }
    return { fields: config, format: saved.format === "csv" ? "csv" : "xlsx" };
  } catch {
    return { fields: config, format: "xlsx" };
  }
};

const saveConfig = (value) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private window or blocked storage: the export still works, it just won't remember.
  }
};

/**
 * Which chosen columns have a name the CRM import would trip on.
 *
 * @return {Record<string, string>} Field id → what is wrong with its name.
 */
const headerProblems = (chosen, fields) => {
  const problems = {};
  const seen = new Map();
  for (const field of chosen) {
    const name = fields[field.id].header.trim();
    if (!name) {
      problems[field.id] = "Ponle un nombre";
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      problems[field.id] = "Este nombre ya lo usa otra columna";
      problems[seen.get(key)] = "Este nombre ya lo usa otra columna";
    } else {
      seen.set(key, field.id);
    }
  }
  return problems;
};

const STEP =
  "font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F] flex items-center gap-1.5";

const StepNumber = ({ children }) => (
  <span className="flex size-4.5 items-center justify-center rounded-full bg-[#19363F] font-inter text-[10px] font-semibold text-white">
    {children}
  </span>
);

/**
 * Every user in one file, with the columns and column names the CRM expects.
 *
 * The table's own export downloads the raw API row — internal field names, English
 * status codes, one page at a time — which is fine for us and useless for an import.
 * This one sweeps every account (the same `/users` sweep the filters use), renders
 * each field the way a person reads it, and lets whoever exports name each column
 * exactly as their CRM does, so the import's column matching pairs them on its own.
 * A preview of the first rows sits under the list, built from the real data with the
 * names as typed, so a mismatch is visible before the file exists.
 *
 * @param {Object} props
 * @param {import("./founders").FounderIndex} props.founderIndex
 * @param {"loading" | "error" | "ready"} props.foundersStatus
 * @param {() => void} props.onClose
 */
const CrmExportDrawer = ({ founderIndex, foundersStatus, onClose }) => {
  const [config, setConfig] = useState(loadConfig);
  const sweep = useGetUsersSweep({ sort: "created", dir: "desc" });

  const users = useMemo(
    () => (sweep.data?.rows ?? []).map((user) => withFounderFields(founderIndex, user)),
    [sweep.data, founderIndex]
  );

  const pending = useMemo(() => {
    const ids = new Set();
    if (users.length === 0) return ids;
    for (const field of CRM_FIELDS) {
      if (field.source && !users.some((user) => user[field.source] != null)) ids.add(field.id);
    }
    return ids;
  }, [users]);

  const examples = useMemo(() => {
    const out = {};
    for (const field of CRM_FIELDS) {
      const user = users.find((row) => {
        const value = field.value(row);
        return value !== null && value !== undefined && value !== "";
      });
      if (user) out[field.id] = field.value(user);
    }
    return out;
  }, [users]);

  const chosen = CRM_FIELDS.filter((field) => config.fields[field.id].on);
  const problems = headerProblems(chosen, config.fields);
  const hasProblems = Object.keys(problems).length > 0;

  const update = (next) => {
    setConfig(next);
    saveConfig(next);
  };

  const setField = (id, patch) =>
    update({
      ...config,
      fields: { ...config.fields, [id]: { ...config.fields[id], ...patch } },
    });

  const previewColumns = chosen.map((field) => ({
    id: field.id,
    accessorKey: field.id,
    header: config.fields[field.id].header.trim() || "(sin nombre)",
    enableSorting: false,
    cell: (info) => {
      const value = info.getValue();
      return value === null || value === undefined || value === "" ? (
        <span className="text-[rgba(25,54,63,0.5)]">vacío</span>
      ) : (
        <span className="whitespace-nowrap text-[rgba(25,54,63,0.85)]">{String(value)}</span>
      );
    },
  }));

  const previewRows = users
    .slice(0, PREVIEW_ROWS)
    .map((user) => Object.fromEntries(chosen.map((field) => [field.id, field.value(user)])));

  const ready = users.length > 0 && foundersStatus !== "loading";
  const canDownload = ready && chosen.length > 0 && !hasProblems;

  const handleDownload = () => {
    const sheet = [
      chosen.map((field) => config.fields[field.id].header.trim()),
      ...users.map((user) => chosen.map((field) => field.value(user) ?? "")),
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheet), "Contactos");
    XLSX.writeFile(workbook, `hyxora-usuarios-crm-${toDayString(new Date())}.${config.format}`, {
      bookType: config.format,
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
            Exportar para CRM
          </p>
          <p className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.75)]">
            {sweep.isLoading
              ? "Leyendo todos los usuarios…"
              : `${formatNumber(users.length)} usuarios · todos, no solo la página de la tabla`}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[rgba(25,54,63,0.68)] transition-colors hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F]"
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

      {/* A modal body over a backdrop: its scroll must not hand on to the page behind. */}
      <div
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
        data-lenis-prevent
      >
        <section className="flex flex-col gap-2">
          <h3 className={STEP}>
            <StepNumber>1</StepNumber>
            Marca las columnas y escríbeles el nombre que tienen en tu CRM
          </h3>
          <p className="font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]">
            Si el nombre es exactamente el mismo que en el CRM (por ejemplo «Correo»), al importar
            las columnas se emparejan solas. Lo que elijas aquí se queda guardado para la próxima
            vez.
          </p>

          <ul className="flex flex-col divide-y-[0.7px] divide-[rgba(25,54,63,0.08)] rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)]">
            {CRM_FIELDS.map((field) => {
              const entry = config.fields[field.id];
              const problem = entry.on ? problems[field.id] : null;
              const example = examples[field.id];

              return (
                <li
                  key={field.id}
                  className={cn(
                    "flex items-start gap-2.5 px-2.5 py-2",
                    !entry.on && "bg-[rgba(25,54,63,0.02)]"
                  )}
                >
                  <div className="pt-1.5">
                    <Checkbox
                      checked={entry.on}
                      onChange={(event) => setField(field.id, { on: event.target.checked })}
                      aria-label={`Incluir ${field.header}`}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <input
                      type="text"
                      value={entry.header}
                      onChange={(event) => setField(field.id, { header: event.target.value })}
                      disabled={!entry.on}
                      aria-label={`Nombre de la columna ${field.header}`}
                      aria-invalid={Boolean(problem)}
                      className={cn(
                        "h-7.5 w-full rounded-md border-[0.7px] bg-white px-2 font-inter text-[12px] tracking-[-0.44px] text-[#19363F] outline-none transition-colors focus:border-[#2D68FF] disabled:cursor-not-allowed disabled:text-[rgba(25,54,63,0.5)]",
                        problem ? "border-red-400" : "border-[rgba(25,54,63,0.2)]"
                      )}
                    />
                    <p className="font-inter text-[10px] leading-[1.4] tracking-[-0.36px] text-[rgba(25,54,63,0.68)]">
                      {field.hint ?? field.header}
                      {example !== undefined && entry.on && (
                        <>
                          {" · ej. "}
                          <span className="text-[rgba(25,54,63,0.85)]">{String(example)}</span>
                        </>
                      )}
                    </p>
                    {problem && (
                      <p className="font-inter text-[10px] tracking-[-0.36px] text-red-600">
                        {problem}
                      </p>
                    )}
                    {pending.has(field.id) && entry.on && (
                      <p className="font-inter text-[10px] tracking-[-0.36px] text-amber-700">
                        Este dato todavía no llega del servidor: la columna saldrá vacía.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => update({ ...config, fields: defaultConfig() })}
            className="self-start font-inter text-[11px] tracking-[-0.44px] text-[#2D68FF] hover:underline"
          >
            Volver a las columnas y nombres de origen
          </button>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className={STEP}>
            <StepNumber>2</StepNumber>
            Comprueba cómo queda
          </h3>
          <p className="font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]">
            Los primeros {PREVIEW_ROWS} usuarios, tal como saldrán en el archivo.
          </p>

          {foundersStatus === "error" && (
            <p className="rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-amber-700">
              No se pudo leer la web founders: nombre y teléfono saldrán vacíos.
            </p>
          )}
          {sweep.data?.truncated && (
            <p className="rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-amber-700">
              La lectura paró en {SWEEP_MAX_PAGES} páginas con {formatNumber(users.length)}{" "}
              usuarios: puede faltar gente en el archivo.
            </p>
          )}

          <QueryState isLoading={sweep.isLoading} error={sweep.error}>
            {chosen.length === 0 ? (
              <p className="font-inter text-[11px] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]">
                Marca al menos una columna.
              </p>
            ) : (
              <DataTable
                data={previewRows}
                columns={previewColumns}
                enableSelection={false}
                enableSearch={false}
                enableExport={false}
                showRowCount={false}
                bare
                dense
              />
            )}
          </QueryState>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className={STEP}>
            <StepNumber>3</StepNumber>
            Descarga el archivo
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "xlsx", label: "Excel (.xlsx)" },
              { id: "csv", label: "CSV (.csv)" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={config.format === option.id}
                onClick={() => update({ ...config, format: option.id })}
                className={cn(
                  "h-7.5 rounded-lg border-[0.7px] px-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
                  config.format === option.id
                    ? "border-[#19363F] bg-[#19363F] text-white"
                    : "border-[rgba(25,54,63,0.2)] bg-white text-[rgba(25,54,63,0.85)] hover:border-[rgba(25,54,63,0.4)]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 border-t-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3">
        {hasProblems && (
          <p className="font-inter text-[11px] tracking-[-0.4px] text-red-600">
            Revisa los nombres marcados en rojo antes de descargar.
          </p>
        )}
        {foundersStatus === "loading" && (
          <p className="font-inter text-[11px] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]">
            Cargando nombres y teléfonos de la web founders…
          </p>
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={!canDownload}
          className="flex h-9 w-full items-center justify-center rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.44px] text-white transition-colors hover:bg-[#0f2228] disabled:cursor-not-allowed disabled:bg-[rgba(25,54,63,0.3)]"
        >
          {sweep.error
            ? "No se pudieron leer los usuarios"
            : ready
              ? `Descargar ${formatNumber(users.length)} usuarios · ${chosen.length} columnas`
              : "Preparando…"}
        </button>
      </div>
    </div>
  );
};

export default CrmExportDrawer;
