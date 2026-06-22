"use client";

import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { formatDate, formatDuration } from "../_lib";
import Poster from "./Poster";

gsap.registerPlugin(useGSAP);

// Sort affordance — mirrors the DataTable component.
const SortIcon = ({ direction }) => (
  <span className="ml-1 inline-flex flex-col gap-0.5 opacity-50">
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

const CategoryPill = ({ category, accent }) => (
  <span
    className="inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 font-inter text-[10.5px]! font-medium tracking-[-0.3px]"
    style={{ background: `${accent}14`, color: accent }}
  >
    {category}
  </span>
);

/**
 * TanStack-powered, DataTable-styled list of tutorials. Columns are sortable and
 * the surface uses the same palette as the shared DataTable component. Hovering a
 * row dims the rest of the list and reveals a single floating poster (GSAP fade)
 * for the active video; clicking a row navigates to the tutorial.
 *
 * @param {object[]} videos
 */
const VideoTable = ({ videos }) => {
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const containerRef = useRef(null);
  const posterRef = useRef(null);
  const lastVideoRef = useRef(null);
  // Vertical center of the hovered row, relative to the container.
  const rowCenterRef = useRef(0);

  const activeVideo = videos.find((v) => v.id === activeId) ?? null;
  // Keep the last hovered video mounted so it can fade out smoothly on leave.
  if (activeVideo) lastVideoRef.current = activeVideo;
  const posterVideo = activeVideo ?? lastVideoRef.current;

  // Track which row the cursor is on and where it sits vertically, so the poster
  // can slide to align with it (anchored beside the título column).
  const handleRowEnter = (e, id) => {
    const container = containerRef.current;
    if (container) {
      const rowRect = e.currentTarget.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      rowCenterRef.current =
        rowRect.top - containerRect.top + rowRect.height / 2;
    }
    setActiveId(id);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "category",
        header: "Categoría",
        cell: ({ row }) => (
          <CategoryPill
            category={row.original.category}
            accent={row.original.accent}
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Título",
        cell: ({ getValue }) => (
          <span className="line-clamp-1 font-semibold text-[#19363F] text-[11px]  min-w-[200px]">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Descripción",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="line-clamp-1 max-w-105 text-[rgba(25,54,63,0.55)] text-[11px]">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "durationSec",
        header: "Duración",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.55)] text-[11px] ">
            {formatDuration(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "publishedAt",
        header: "Subido",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-[rgba(25,54,63,0.5)] text-[11px]">
            {formatDate(getValue())}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: videos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useGSAP(
    () => {
      const el = posterRef.current;
      if (!el) return;
      // Center the poster on the hovered row's vertical midpoint.
      const targetY = rowCenterRef.current - el.offsetHeight / 2;
      gsap.to(el, {
        autoAlpha: activeVideo ? 1 : 0,
        y: activeVideo ? targetY : targetY + 8,
        scale: activeVideo ? 1 : 0.96,
        duration: 0.4,
        ease: "power3.out",
      });
    },
    { dependencies: [activeId] },
  );

  return (
    <div ref={containerRef} className="relative flex flex-col">
      {/* floating poster — anchored beside the título column, slides to the row */}
      <div
        ref={posterRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-67 top-0 z-20 hidden w-52 opacity-0 sm:block"
      >
        {posterVideo && (
          <div className="overflow-hidden rounded-xl shadow-[0px_16px_44px_-10px_rgba(25,54,63,0.5)] ring-1 ring-black/5">
            <Poster video={posterVideo} />
          </div>
        )}
      </div>

      {/* Table wrapper — same surface/palette as DataTable */}
      <div className="overflow-x-auto rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_1px_4px_0px_rgba(25,54,63,0.04)] scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.2)] scrollbar-thumb-rounded-lg">
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
          <tbody className="group/list" onMouseLeave={() => setActiveId(null)}>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 font-inter text-[12px] text-[rgba(25,54,63,0.35)] tracking-[-0.48px]"
                >
                  Sin resultados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  data-stagger-item
                  onMouseEnter={(e) => handleRowEnter(e, row.original.id)}
                  onClick={() => router.push(`/academy/${row.original.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      router.push(`/academy/${row.original.slug}`);
                  }}
                  className={cn(
                    "cursor-pointer border-b-[0.7px] border-[rgba(25,54,63,0.05)]",
                    "transition-[background-color,opacity] duration-300",
                    i % 2 === 0
                      ? "bg-white hover:bg-[rgba(25,54,63,0.02)]"
                      : "bg-[rgba(25,54,63,0.01)] hover:bg-[rgba(25,54,63,0.02)]",
                    // dim the rest of the list while one row is hovered (desktop only)
                    "sm:group-hover/list:opacity-40 sm:hover:opacity-100!",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-1 py-1.5 font-inter text-[12px] tracking-[-0.48px] text-[#19363F]"
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

export default VideoTable;
