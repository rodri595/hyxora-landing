"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useState, useMemo, useRef } from "react";
import { cn } from "@/utils";
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
        .join(","),
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
      className={cn(
        "transition-opacity",
        direction === "asc" ? "opacity-100" : "opacity-30",
      )}
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
      className={cn(
        "transition-opacity",
        direction === "desc" ? "opacity-100" : "opacity-30",
      )}
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

const RowCheckbox = ({ checked, indeterminate, onChange }) => {
  const ref = useRef(null);

  if (ref.current) {
    ref.current.indeterminate = indeterminate;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    onChange(e);
  };

  return (
    <div
      className="flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={() => {}}
    >
      <label className="relative flex items-center justify-center cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleClick}
          className="sr-only"
        />
        <span
          className={cn(
            "size-3.5 rounded-[3px] border border-solid transition-all flex items-center justify-center shrink-0 pointer-events-none",
            checked || indeterminate
              ? "bg-[#19363F] border-[#19363F]"
              : "bg-white border-[rgba(25,54,63,0.2)]",
          )}
        >
          {indeterminate && !checked ? (
            <svg
              width="8"
              height="2"
              viewBox="0 0 8 2"
              fill="none"
              aria-hidden="true"
            >
              <rect x="0" y="0.5" width="8" height="1" rx="0.5" fill="white" />
            </svg>
          ) : checked ? (
            <svg
              width="8"
              height="6"
              viewBox="0 0 8 6"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 3l2 2 4-4"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </label>
    </div>
  );
};

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
          "shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]",
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

// ─── Main DataTable ───────────────────────────────────────────────────────────

/**
 * Generic DataTable
 *
 * @param {object[]} data          - Row data
 * @param {ColumnDef[]} columns    - TanStack column definitions (accessorKey / header)
 * @param {string} filename        - Base filename for exports (no extension)
 * @param {string} title           - Optional table title shown above toolbar
 * @param {string} searchPlaceholder
 */
const DataTable = ({
  data = [],
  columns = [],
  filename = "export",
  title,
  searchPlaceholder = "Buscar...",
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  // Prepend checkbox column
  const tableColumns = useMemo(
    () => [
      {
        id: "select",
        size: 36,
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
    ],
    [columns],
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
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

  return (
    <div className="flex flex-col w-full h-full gap-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        {title && (
          <h2 className="font-inter font-semibold text-[14px] tracking-[-0.56px] text-[#19363F] mr-auto">
            {title}
          </h2>
        )}
        {/* Search */}
        <div className="flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] flex-1 min-w-40 max-w-70">
          <SearchIcon />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none font-inter text-[11px] tracking-[-0.44px] text-[#19363F] placeholder:text-[rgba(25,54,63,0.35)]"
          />
          {globalFilter && (
            <button
              type="button"
              onClick={() => setGlobalFilter("")}
              className="text-[rgba(25,54,63,0.35)] hover:text-[#19363F] transition-colors"
              aria-label="Clear search"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7.5 2.5l-5 5M2.5 2.5l5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Row count */}
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)] whitespace-nowrap">
            {selectedCount > 0
              ? `${selectedCount} seleccionados`
              : `${totalRows} filas`}
          </span>
          <ExportDropdown onExport={handleExport} count={selectedCount} />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="flex-1 overflow-auto rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_1px_4px_0px_rgba(25,54,63,0.04)]">
        <table className="w-full border-collapse table-auto">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="bg-[#F5F7F9] border-b-[0.7px] border-[rgba(25,54,63,0.08)]"
              >
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width:
                        header.column.getSize() !== 150
                          ? header.column.getSize()
                          : undefined,
                    }}
                    className={cn(
                      "px-3 py-2 text-left font-inter font-medium text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.55)] whitespace-nowrap select-none",
                      header.column.getCanSort() &&
                        "cursor-pointer hover:text-[#19363F] transition-colors",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        header.column.getToggleSortingHandler()?.(e);
                    }}
                  >
                    <span className="inline-flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && (
                        <SortIcon
                          direction={header.column.getIsSorted() || null}
                        />
                      )}
                    </span>
                  </th>
                ))}
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
                  Sin resultados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={row.getToggleSelectedHandler()}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter")
                      row.getToggleSelectedHandler()(e);
                  }}
                  className={cn(
                    "border-b-[0.7px] border-[rgba(25,54,63,0.05)] cursor-pointer transition-colors",
                    row.getIsSelected()
                      ? "bg-[rgba(25,54,63,0.03)]"
                      : i % 2 === 0
                        ? "bg-white hover:bg-[rgba(25,54,63,0.02)]"
                        : "bg-[rgba(25,54,63,0.01)] hover:bg-[rgba(25,54,63,0.02)]",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2.5 font-inter text-[12px] tracking-[-0.48px] text-[#19363F] whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
