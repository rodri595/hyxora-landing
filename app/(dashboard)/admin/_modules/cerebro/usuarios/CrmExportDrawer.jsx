"use client";

import Checkbox from "@/components/Checkbox";
import DataTable from "@/components/DataTable";
import {
  cerebroMembershipGroup,
  cerebroMembershipKey,
  cerebroMembershipLabel,
} from "@/constants/cerebro";
import { useGetAppUsers } from "@/hooks/appApi/useGetAppUsers";
import { SWEEP_MAX_PAGES, useGetUsersSweep } from "@/hooks/cerebro/useGetUsersSweep";
import { cn } from "@/utils";
import { formatNumber, toDayString } from "@/utils/format";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import QueryState from "../../shared/QueryState";
import { firstNumber } from "../../shared/aggregate";
import { indexAppUsers, withAppFields } from "./appUsers";
import { withFounderFields } from "./founders";

/** Wide enough for the column list and a preview of five or six columns. */
export const CRM_EXPORT_DRAWER_WIDTH = 640;

// v2: defaults renamed to the client's Clientify headers; a v1 save would bring
// the old names back.
const STORAGE_KEY = "hx-crm-export-v2";
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
 * Clientify's «Lead scoring» values, picked from the membership group. Only three
 * of its ten apply to what we know; the rest are sales stages the CRM owns.
 */
const LEAD_SCORE = {
  active: "Cliente",
  pipeline: "Cliente",
  lapsed: "Cliente Perdido",
  none: "Lead frío",
};

const PAYMENT_TYPES = { stripe: "Stripe", onchain: "On-chain", manual: "Manual" };

const regionNames = new Intl.DisplayNames(["es"], { type: "region" });

/** "ES" → "España". Anything that isn't a two-letter code goes out as it came. */
const countryName = (code) => {
  if (!code) return null;
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};

/**
 * Every column the CRM file can carry. `header` is the default name — the ones on
 * by default are spelled exactly as the client's Clientify import lists them — and
 * the person exporting can rename any of them. `source` marks a field that comes
 * from app-api's `/admin/users`: if no row carries it the column is flagged as
 * arriving empty, which is what a production backend without #206 looks like.
 */
const CRM_FIELDS = [
  {
    id: "firstName",
    header: "Nombre",
    hint: "Del perfil de la app. Si no está separado, va aquí el nombre completo; si no tiene ninguno, el que puso al comprar en la web founders",
    source: "firstName",
    on: true,
    // Without the split, the whole name goes here rather than nowhere.
    value: (row) => row.firstName || (row.lastName ? null : row.fullName || row.founderName),
  },
  {
    id: "lastName",
    header: "Apellidos",
    hint: "Del perfil de la app",
    source: "lastName",
    on: true,
    value: (row) => row.lastName,
  },
  {
    id: "country",
    header: "País 1",
    hint: "Del perfil de la app, con su nombre en español",
    source: "country",
    on: true,
    value: (row) => countryName(row.country),
  },
  {
    id: "leadScore",
    header: "Lead scoring",
    hint: "Membresía activa o pendiente de cancelar → Cliente · cancelada o suspendida → Cliente Perdido · sin membresía → Lead frío",
    on: true,
    value: (row) => LEAD_SCORE[cerebroMembershipGroup(row.membershipStatus)] ?? null,
  },
  {
    id: "email",
    header: "Correo electrónico",
    hint: "Con esto el CRM reconoce a los contactos que ya tiene",
    on: true,
    value: (row) => row.email || row.founderEmail,
  },
  {
    id: "phone",
    header: "Teléfono",
    hint: "De la web founders: solo quien tiene cuenta allí",
    on: true,
    value: (row) => row.founderPhone,
  },
  {
    id: "countryList",
    header: "País desplegable",
    hint: "El mismo país, para el desplegable del CRM. Si el CRM lo pide como código (ES), usa «Código de país» en su lugar",
    source: "country",
    on: true,
    value: (row) => countryName(row.country),
  },
  {
    id: "plan",
    header: "Membresía Tipo",
    hint: "El plan que tiene ahora",
    on: true,
    value: (row) => row.planName,
  },
  {
    id: "since",
    header: "Inicio Membresía",
    hint: "Cuándo empezó su membresía actual",
    source: "membershipStartDate",
    on: true,
    value: (row) => toDate(row.membershipStartDate),
  },
  {
    id: "until",
    header: "Final Membresía",
    hint: "Próxima renovación, o el día que termina si va a cancelar",
    on: true,
    value: (row) => toDate(periodEnd(row)),
  },
  {
    id: "fullName",
    header: "Nombre completo",
    hint: "Nombre y apellidos juntos",
    on: false,
    value: (row) => row.fullName || row.founderName,
  },
  {
    id: "status",
    header: "Estado membresía",
    hint: "Activa, cancelará, suspendida, sin membresía…",
    on: false,
    value: (row) => capitalise(cerebroMembershipLabel(row.membershipStatus)),
  },
  {
    id: "renewed",
    header: "Última renovación",
    // No `source`: app-api sends the field, it is just null for everyone who hasn't
    // paid since #206 — there is no Stripe backfill.
    hint: "Último cobro. Solo se registra desde el 10/11/2026: quien no ha pagado desde entonces sale vacío",
    on: false,
    value: (row) => toDate(row.membershipLastRenewedAt),
  },
  {
    id: "daysLeft",
    header: "Días restantes",
    hint: "Días hasta «Final Membresía»; negativo si ya pasó. Cambia cada día",
    on: false,
    value: (row) => daysUntil(periodEnd(row)),
  },
  {
    id: "created",
    header: "Fecha de registro",
    hint: "Día en que se registró en la app",
    on: false,
    value: (row) => toDate(row.createdAt),
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
    hint: "Stripe, on-chain o manual",
    source: "membershipPaymentType",
    on: false,
    value: (row) => PAYMENT_TYPES[row.membershipPaymentType] ?? row.membershipPaymentType ?? null,
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
  {
    id: "countryCode",
    header: "Código de país",
    hint: "El país como código (ES, MX…), por si el CRM lo pide así",
    source: "country",
    on: false,
    value: (row) => row.country,
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
 * This one sweeps every account (the same `/users` sweep the filters use), lays
 * app-api's `/admin/users` over it for names and live membership dates, renders
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
  const app = useGetAppUsers();

  const users = useMemo(() => {
    const appIndex = indexAppUsers(app.data?.users);
    return (sweep.data?.rows ?? []).map((user) =>
      withAppFields(appIndex, withFounderFields(founderIndex, user))
    );
  }, [sweep.data, app.data, founderIndex]);

  const appMatched = users.filter((user) => user.appMatch).length;

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

  const ready = users.length > 0 && foundersStatus !== "loading" && !app.isLoading;
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
              : `${formatNumber(users.length)} usuarios · todos, no solo la página de la tabla${
                  app.data ? ` · ${formatNumber(appMatched)} con ficha en la app` : ""
                }`}
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
              No se pudo leer la web founders: el teléfono saldrá vacío.
            </p>
          )}
          {app.error && (
            <p className="rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-amber-700">
              No se pudo leer la lista de usuarios de la app ({app.error.message}): nombre,
              apellidos e inicio de membresía saldrán vacíos, y la membresía será la copia de
              Cerebro, que puede ir hasta 2 horas por detrás.
            </p>
          )}
          {app.data?.truncated && (
            <p className="rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-amber-700">
              La lista de la app paró en {formatNumber(app.data.users.length)} usuarios: a quien
              falte le saldrán vacíos el nombre y las fechas.
            </p>
          )}
          {sweep.data?.truncated && (
            <p className="rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-amber-700">
              La lectura de usuarios se cortó con {formatNumber(users.length)} (tope de{" "}
              {SWEEP_MAX_PAGES} páginas o una página repetida): puede faltar gente en el archivo.
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
            Cargando teléfonos de la web founders…
          </p>
        )}
        {app.isLoading && (
          <p className="font-inter text-[11px] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]">
            Cargando nombres y membresías de la app…
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
