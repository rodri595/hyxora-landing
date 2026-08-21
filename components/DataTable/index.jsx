"use client";

import Checkbox from "@/components/Checkbox";
import Field from "@/components/Field";
import { cn } from "@/utils";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

// ─── Export helpers ───────────────────────────────────────────────────────────

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToCSV = (rows, filename) => {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const body = rows
    .map((row) =>
      keys
        .map((k) => {
          const val = String(row[k] ?? "").replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, `${filename}.csv`);
};

const exportToJSON = (rows, filename) => {
  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, `${filename}.json`);
};

const exportToExcel = (rows, filename) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const SortIcon = ({ direction }) => (
  <span className="inline-flex flex-col gap-0.5 ml-1 opacity-50">
    <svg
      width="6"
      height="4"
      viewBox="0 0 6 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("transition-opacity", direction === "asc" ? "opacity-100" : "opacity-30")}
    >
      <path d="M3 0L6 4H0L3 0Z" fill="#19363F" />
    </svg>
    <svg
      width="6"
      height="4"
      viewBox="0 0 6 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("transition-opacity", direction === "desc" ? "opacity-100" : "opacity-30")}
    >
      <path d="M3 4L0 0H6L3 4Z" fill="#19363F" />
    </svg>
  </span>
);

const SearchIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
      stroke="rgba(25,54,63,0.4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="rgba(25,54,63,0.6)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Row checkbox cell ─────────────────────────────────────────────────────────

const RowCheckbox = ({ checked, indeterminate, onChange }) => (
  <div
    className="flex items-center justify-center"
    onClick={(e) => e.stopPropagation()}
    onKeyDown={() => {}}
  >
    <Checkbox checked={checked} indeterminate={indeterminate} onChange={onChange} stopPropagation />
  </div>
);

// ─── Export dropdown ──────────────────────────────────────────────────────────

const ExportDropdown = ({ onExport, count }) => {
  const [open, setOpen] = useState(false);

  const formats = [
    { id: "csv", label: "CSV" },
    { id: "excel", label: "Excel (.xlsx)" },
    { id: "json", label: "JSON" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white",
          "font-inter font-medium text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]",
          "hover:bg-[rgba(25,54,63,0.03)] transition-colors",
          "shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]"
        )}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M14 10v2.667A1.333 1.333 0 0 1 12.667 14H3.333A1.333 1.333 0 0 1 2 12.667V10M5.333 6.667L8 9.333l2.667-2.666M8 9.333V2"
            stroke="rgba(25,54,63,0.6)"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Exportar{count > 0 ? ` (${count})` : ""}
        <ChevronIcon />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            role="button"
            tabIndex={-1}
            aria-label="Close"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <div className="absolute right-0 top-[calc(100%+4px)] z-20 bg-white border-[0.7px] border-[rgba(25,54,63,0.08)] rounded-[10px] shadow-[0px_4px_16px_0px_rgba(25,54,63,0.1)] p-1 min-w-35">
            {formats.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  onExport(f.id);
                  setOpen(false);
                }}
                className="w-full flex items-center px-2.5 py-1.5 rounded-[7px] hover:bg-[rgba(25,54,63,0.04)] font-inter font-medium text-[11px] tracking-[-0.44px] text-[#19363F] transition-colors text-left"
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Column visibility dropdown ───────────────────────────────────────────────

const columnLabel = (column) => {
  const header = column.columnDef.header;
  if (column.columnDef.meta?.label) return column.columnDef.meta.label;
  return typeof header === "string" && header ? header : column.id;
};

const ColumnToggle = ({ table }) => {
  const [open, setOpen] = useState(false);
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.id !== "select" && column.getCanHide());

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white",
          "font-inter font-medium text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]",
          "hover:bg-[rgba(25,54,63,0.03)] transition-colors",
          "shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]"
        )}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 4h12M2 8h12M2 12h7"
            stroke="rgba(25,54,63,0.6)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        Columnas
        <ChevronIcon />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            role="button"
            tabIndex={-1}
            aria-label="Close"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <div className="absolute right-0 top-[calc(100%+4px)] z-20 max-h-72 overflow-y-auto bg-white border-[0.7px] border-[rgba(25,54,63,0.08)] rounded-[10px] shadow-[0px_4px_16px_0px_rgba(25,54,63,0.1)] p-1 min-w-44">
            {columns.map((column) => (
              <button
                key={column.id}
                type="button"
                onClick={() => column.toggleVisibility()}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[7px] hover:bg-[rgba(25,54,63,0.04)] font-inter font-medium text-[11px] tracking-[-0.44px] text-[#19363F] transition-colors text-left"
              >
                <span
                  className={cn(
                    "size-3 shrink-0 rounded-[3px] border-[0.7px] flex items-center justify-center",
                    column.getIsVisible()
                      ? "bg-[#19363F] border-[#19363F]"
                      : "border-[rgba(25,54,63,0.25)]"
                  )}
                >
                  {column.getIsVisible() && (
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 6.2 4.8 8.5 9.5 3.8"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {columnLabel(column)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main DataTable ───────────────────────────────────────────────────────────

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * Generic DataTable — client-side sorting, search, selection and export.
 *
 * Every flag defaults to the original behaviour, so existing tables keep the
 * checkbox column and full toolbar without changes. The opt-outs exist for
 * tables embedded in a card that already provides its own title and actions
 * (the Cerebro panels).
 *
 * Per-column extras go through TanStack's `meta`:
 *   { meta: { align: "right", label: "Comisiones" } }
 * `align` right-aligns the header and cells; `label` names the column in the
 * visibility menu when the header isn't a plain string.
 *
 * @param {object[]} data                    - Row data
 * @param {ColumnDef[]} columns              - TanStack column definitions
 * @param {string} [filename]                - Base filename for exports (no extension)
 * @param {string} [title]                   - Table title shown in the toolbar
 * @param {string} [searchPlaceholder]
 * @param {boolean} [enableSelection]        - Checkbox column. Default true.
 * @param {boolean} [enableSearch]           - Toolbar search field. Default true.
 * @param {boolean} [enableExport]           - Export dropdown. Default true.
 * @param {boolean} [showRowCount]           - "N filas" counter. Default true.
 * @param {boolean} [enableColumnToggle]     - Column visibility menu. Default false.
 * @param {boolean} [enableFooter]           - Render <tfoot> from each column's
 *   `footer` definition — used for totals rows. Default false.
 * @param {boolean} [bare]                   - Drop the outer border/shadow and the
 *   flex-fill sizing so the table sits inside an existing card. Default false.
 * @param {boolean} [dense]                  - Tighter rows for data-heavy tables.
 * @param {SortingState} [initialSorting]    - e.g. [{ id: "tvlUsd", desc: true }]
 * @param {string} [emptyLabel]
 * @param {number} [maxHeight]               - Max body height in px before scrolling.
 *   Only meaningful with `bare`; otherwise the table flex-fills its parent.
 * @param {React.ReactNode} [toolbarExtra]   - Extra controls, rendered left of Export.
 * @param {string} [className]
 */
const DataTable = ({
  data = [],
  columns = [],
  filename = "export",
  title,
  searchPlaceholder = "Buscar...",
  enableSelection = true,
  enableSearch = true,
  enableExport = true,
  showRowCount = true,
  enableColumnToggle = false,
  enableFooter = false,
  bare = false,
  dense = false,
  initialSorting = [],
  emptyLabel = "Sin resultados",
  maxHeight,
  toolbarExtra,
  className,
}) => {
  const [sorting, setSorting] = useState(initialSorting);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const tableColumns = useMemo(() => {
    if (!enableSelection) return columns;

    return [
      {
        id: "select",
        size: 36,
        enableHiding: false,
        header: ({ table }) => (
          <RowCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <RowCheckbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      ...columns,
    ];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter, rowSelection, columnVisibility },
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const exportRows =
    selectedRows.length > 0
      ? selectedRows
      : table.getFilteredRowModel().rows.map((r) => r.original);

  const handleExport = (format) => {
    if (format === "csv") exportToCSV(exportRows, filename);
    else if (format === "json") exportToJSON(exportRows, filename);
    else if (format === "excel") exportToExcel(exportRows, filename);
  };

  const selectedCount = Object.keys(rowSelection).length;
  const totalRows = table.getFilteredRowModel().rows.length;

  const showToolbar =
    Boolean(title) ||
    enableSearch ||
    enableExport ||
    showRowCount ||
    enableColumnToggle ||
    Boolean(toolbarExtra);

  const headerPad = dense ? "px-2.5 py-1.5" : "px-3 py-2";
  const cellPad = dense ? "px-2.5 py-2 text-[11px]" : "px-3 py-2.5 text-[12px]";

  return (
    <div
      className={cn(
        "flex flex-col w-full",
        // Flex-fill mode expects a sized parent; bare mode sizes to content.
        !bare && "flex-1 min-h-0",
        className
      )}
    >
      {showToolbar && (
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          {title && (
            <h2 className="font-inter font-semibold text-[14px] tracking-[-0.56px] text-[#19363F] mr-auto">
              {title}
            </h2>
          )}

          {enableSearch && (
            <Field
              className={cn("flex-1 min-w-40 max-w-70", !title && "mr-auto")}
              classInput="h-[30px] pl-9 text-[11px] tracking-[-0.44px]"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              validated={Boolean(globalFilter)}
              icon="close-small"
              iconFill="rgba(25,54,63,0.4)"
              iconHandler={() => setGlobalFilter("")}
              iconClassName="size-[16px] cursor-pointer hover:opacity-60 transition-opacity"
            >
              <span className="absolute left-3 top-1/2 z-1 -translate-y-1/2 pointer-events-none">
                <SearchIcon />
              </span>
            </Field>
          )}

          <div className="flex items-center gap-2">
            {showRowCount && (
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)] whitespace-nowrap">
                {selectedCount > 0 ? `${selectedCount} seleccionados` : `${totalRows} filas`}
              </span>
            )}
            {toolbarExtra}
            {enableColumnToggle && <ColumnToggle table={table} />}
            {enableExport && <ExportDropdown onExport={handleExport} count={selectedCount} />}
          </div>
        </div>
      )}

      {/* Table wrapper */}
      <div
        style={maxHeight ? { maxHeight } : undefined}
        className={cn(
          "overflow-auto",
          bare
            ? "rounded-lg border-[0.7px] border-[rgba(25,54,63,0.06)]"
            : "flex-1 min-h-0 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_1px_4px_0px_rgba(25,54,63,0.04)]"
        )}
      >
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="bg-[#F5F7F9] border-b-[0.7px] border-[rgba(25,54,63,0.08)]"
              >
                {hg.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align ?? "left";
                  return (
                    <th
                      key={header.id}
                      style={{
                        width:
                          header.column.getSize() !== 150 ? header.column.getSize() : undefined,
                      }}
                      className={cn(
                        headerPad,
                        ALIGN_CLASS[align],
                        "font-inter font-medium text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.55)] whitespace-nowrap select-none",
                        header.column.getCanSort() &&
                          "cursor-pointer hover:text-[#19363F] transition-colors"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") header.column.getToggleSortingHandler()?.(e);
                      }}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center",
                          align === "right" && "flex-row-reverse"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIcon direction={header.column.getIsSorted() || null} />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="text-center py-10 font-inter text-[12px] text-[rgba(25,54,63,0.35)] tracking-[-0.48px]"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") row.getToggleSelectedHandler()(e);
                  }}
                  className={cn(
                    "border-b-[0.7px] border-[rgba(25,54,63,0.05)] transition-colors",
                    enableSelection && "cursor-pointer",
                    row.getIsSelected()
                      ? "bg-[rgba(25,54,63,0.03)]"
                      : i % 2 === 0
                        ? "bg-white hover:bg-[rgba(25,54,63,0.02)]"
                        : "bg-[rgba(25,54,63,0.01)] hover:bg-[rgba(25,54,63,0.02)]"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        cellPad,
                        ALIGN_CLASS[cell.column.columnDef.meta?.align ?? "left"],
                        "font-inter tracking-[-0.48px] text-[#19363F] whitespace-nowrap"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {enableFooter && table.getRowModel().rows.length > 0 && (
            <tfoot className="sticky bottom-0">
              {table.getFooterGroups().map((fg) => (
                <tr
                  key={fg.id}
                  className="bg-[#F5F7F9] border-t-[0.7px] border-[rgba(25,54,63,0.08)]"
                >
                  {fg.headers.map((header) => (
                    <td
                      key={header.id}
                      className={cn(
                        cellPad,
                        ALIGN_CLASS[header.column.columnDef.meta?.align ?? "left"],
                        "font-inter font-semibold tracking-[-0.48px] text-[#19363F] whitespace-nowrap"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.footer, header.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default DataTable;
