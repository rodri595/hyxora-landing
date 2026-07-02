"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { cn } from "@/utils";

const feeGroups = [
  {
    category: "KYC/KYB",
    rows: [{ concept: "KYC/KYB", values: ["0", "0", "0", "0"] }],
  },
  {
    category: "VIban",
    rows: [{ concept: "VIban - USDC", values: ["1,5 %", "0,5 %", "0", "0"] }],
  },
  {
    category: "Staking",
    rows: [
      { concept: "Entrada Staking", values: ["1 %", "0", "0", "0"] },
      { concept: "Rewards", values: ["1 %", "0", "0", "0"] },
      {
        concept: "Withdraw",
        values: [
          { fee: "0,2 %", note: "Mín $0,5 – Máx $2,25" },
          { fee: "0,1 %", note: "Mín $0,5 – Máx $2,25" },
          { fee: "0,1 %", note: "Máx $1,15" },
          { fee: "0,1 %", note: "Mín $0,5 – Máx $2,25" },
        ],
      },
    ],
  },
  {
    category: "Transferencias",
    rows: [
      {
        concept: "De Hyxora a Wallet",
        values: [
          { fee: "0,5 %", note: "Mín $1,15" },
          "$0,30",
          "$0,10",
          "$0,30",
        ],
      },
      { concept: "De Hyxora a Hyxora", values: ["0", "0", "0", "0"] },
    ],
  },
  {
    category: "Intercambios",
    rows: [
      {
        concept: "Crypto a crypto",
        values: ["0,90 %", "0,50 %", "0,50 %", "0,50 %"],
      },
    ],
  },
  {
    category: "Withdraw a Fiat",
    rows: [{ concept: "Off-Ramp", values: ["1 %", "0,5 %", "0,3 %", "0,5 %"] }],
  },
  {
    category: "ETFs",
    rows: [
      { concept: "Entrada ETF", values: [null, "2 %", "1 %", "2 %"] },
      { concept: "Salida ETF", values: [null, "1 %", "1 %", "1 %"] },
    ],
  },
  {
    category: "Suscripción",
    rows: [
      {
        concept: "Suscripción mensual",
        emphasis: true,
        values: ["1,99 US$", "9,99 US$", "0,00 US$", "24,99 US$"],
      },
      {
        concept: "Suscripción anual",
        values: ["19,00 US$", "96,00 US$", "0,00 US$", "240,00 US$"],
      },
    ],
  },
];

const data = feeGroups.flatMap((group) =>
  group.rows.map((row, rowIndex) => ({
    category: group.category,
    concept: row.concept,
    emphasis: Boolean(row.emphasis),
    isGroupStart: rowIndex === 0,
    isGroupEnd: rowIndex === group.rows.length - 1,
    categoryRowSpan: rowIndex === 0 ? group.rows.length : 0,
    basic: row.values[0],
    premium: row.values[1],
    founders: row.values[2],
    pymes: row.values[3],
  })),
);

const FeeValue = ({ value }) => {
  if (value === null) {
    return (
      <span className="inline-block rounded-md bg-[#19363F] px-2 py-0.5 font-inter font-medium text-[10px] tracking-[-0.4px] text-white">
        No disponible
      </span>
    );
  }
  if (typeof value === "object") {
    return (
      <span className="flex flex-col gap-0.5">
        <span>{value.fee}</span>
        <span className="text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
          {value.note}
        </span>
      </span>
    );
  }
  return value;
};

const planColumn = (key, header) => ({
  accessorKey: key,
  header,
  size: 110,
  cell: (info) => <FeeValue value={info.getValue()} />,
});

const columns = [
  { accessorKey: "category", header: "Base", size: 90 },
  { accessorKey: "concept", header: "Concepto", size: 150 },
  planColumn("basic", "Basic"),
  planColumn("premium", "Premium"),
  planColumn("founders", "Founders"),
  planColumn("pymes", "Pymes"),
];

const getPinnedProps = (column) => {
  if (!column.getIsPinned()) {
    return { className: "", style: { minWidth: column.getSize() } };
  }
  return {
    className: cn(
      "sticky z-10",
      column.getIsLastColumn("left")
        ? "border-r-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[6px_0_12px_-10px_rgba(25,54,63,0.25)]"
        : "border-r-[0.7px] border-[rgba(25,54,63,0.05)]",
    ),
    style: {
      left: column.getStart("left"),
      width: column.getSize(),
      minWidth: column.getSize(),
    },
  };
};

const FeesTable = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnPinning: { left: ["category", "concept"] },
    },
  });

  return (
    <section className="w-full px-4">
      <div className="max-w-[1340px]  mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-[14px] items-center text-center">
          <h2 className="font-medium text-[40px] text-[#19363f] tracking-[-3.2px] leading-normal max-md:text-[26px] max-md:tracking-[-1.2px]">
            Comisiones
          </h2>
          <p className="font-normal text-[16px] text-[rgba(25,54,63,0.65)] tracking-[-0.32px] max-md:text-[13px]">
            Tarifas aplicables según tu plan
          </p>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_1px_4px_0px_rgba(25,54,63,0.04)] scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.2)] scrollbar-thumb-rounded-lg">
          <table className="w-full border-separate border-spacing-0">
            <caption className="sr-only">Tabla de comisiones por plan</caption>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const pinned = getPinnedProps(header.column);
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        style={pinned.style}
                        className={cn(
                          pinned.className,
                          "bg-[#F5F7F9] px-3 py-2 font-inter font-medium text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.55)] whitespace-nowrap select-none border-b-[0.7px] border-[rgba(25,54,63,0.08)]",
                          header.column.getIsPinned()
                            ? "text-left"
                            : "text-center",
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const { isGroupStart, isGroupEnd, categoryRowSpan, emphasis } =
                  row.original;
                const isLastRow = row.index === data.length - 1;
                const zebra = row.index % 2 === 0 ? "bg-white" : "bg-[#FBFCFC]";
                const borderClass = isLastRow
                  ? ""
                  : isGroupEnd
                    ? "border-b-[0.7px] border-[rgba(25,54,63,0.08)]"
                    : "border-b-[0.7px] border-[rgba(25,54,63,0.05)]";

                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const pinned = getPinnedProps(cell.column);

                      if (cell.column.id === "category") {
                        if (!isGroupStart) return null;
                        const groupEndsAtLastRow =
                          row.index + categoryRowSpan === data.length;
                        return (
                          <th
                            key={cell.id}
                            scope="row"
                            rowSpan={categoryRowSpan}
                            style={pinned.style}
                            className={cn(
                              pinned.className,
                              "bg-[#F5F7F9] px-3 py-2.5 text-left align-middle font-inter font-semibold text-[11px] tracking-[-0.44px] text-[#19363F] whitespace-nowrap",
                              !groupEndsAtLastRow &&
                                "border-b-[0.7px] border-[rgba(25,54,63,0.08)]",
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </th>
                        );
                      }

                      if (cell.column.id === "concept") {
                        return (
                          <td
                            key={cell.id}
                            style={pinned.style}
                            className={cn(
                              pinned.className,
                              zebra,
                              borderClass,
                              "px-3 py-2.5 align-middle font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.7)] whitespace-nowrap",
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={cell.id}
                          style={pinned.style}
                          className={cn(
                            zebra,
                            borderClass,
                            "px-3 py-2.5 text-center align-middle font-inter text-[12px] tracking-[-0.48px] text-[#19363F] whitespace-nowrap",
                            emphasis && "font-semibold",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default FeesTable;
