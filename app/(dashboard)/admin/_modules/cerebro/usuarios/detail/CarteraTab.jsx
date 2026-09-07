"use client";

import DataTable from "@/components/DataTable";
import Spinner from "@/components/Spinner";
import { cerebroVaultProtocolLabel } from "@/constants/cerebro";
import { cn } from "@/utils";
import { formatNumber, formatPercent, formatUsd, formatUsdPrecise } from "@/utils/format";
import { EmptyBlock, Footnote, SectionHeader, SignedUsd } from "./parts";

/**
 * Balances span nine orders of magnitude on this screen — 6,034.98 fUSDC next to
 * 0.002137 SOL — so a fixed precision is wrong for one of them whichever you pick.
 * Same ladder the old dashboard uses.
 *
 * @param {number | null} value
 * @return {string}
 */
const formatBalance = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  if (Math.abs(value) < 0.0001) return value.toExponential(2);
  if (Math.abs(value) < 1) return value.toFixed(6);
  if (Math.abs(value) < 1000) return value.toFixed(4);
  return formatNumber(value, { decimals: 2 });
};

/**
 * Unit price, on the same reasoning as the balance above: SPYx trades at $765 and
 * SOL dust is priced to six decimals.
 *
 * @param {number | null} value
 * @return {string}
 */
const formatPrice = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) return "—";
  if (value < 0.01) return `$${value.toFixed(6)}`;
  if (value < 1) return `$${value.toFixed(4)}`;
  return formatUsd(value, { decimals: 2 });
};

/**
 * Asset cell: icon, then the identity of the position over its ticker.
 *
 * Vault rows lead with the **protocol** ("Morpho") rather than the share token
 * ("gtUSDCp"), because that is what the deposit actually is and the ticker means
 * nothing to a reader; token rows lead with the ticker, because there it is the
 * name. Zerion's icon is used when it sent one and a neutral disc stands in when it
 * didn't, so the column never jumps width between rows.
 */
const AssetCell = ({ row, isVault }) => {
  const primary = isVault ? cerebroVaultProtocolLabel(row.protocol) : row.symbol;
  const secondary = isVault ? row.symbol : row.name;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {row.iconUrl ? (
        // A plain <img> on purpose: Zerion serves these off whichever CDN the token
        // issuer uses, so next/image would need every one of those hosts listed in
        // next.config before a single icon rendered — and it would still 404 the
        // first time a new asset turned up. `onError` hides a dead one so the row
        // falls back to the same neutral disc as a token Zerion sent no icon for,
        // rather than a broken-image glyph.
        <img
          src={row.iconUrl}
          alt=""
          loading="lazy"
          className="size-5 shrink-0 rounded-full"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : (
        <div className="size-5 shrink-0 rounded-full bg-[rgba(25,54,63,0.08)]" />
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
          {primary}
        </span>
        {secondary && secondary !== primary && (
          <span className="truncate font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Columns for one positions group.
 *
 * Built per group rather than shared, because the first column means something
 * different in each: a protocol for vaults, a ticker for tokens.
 *
 * @param {boolean} isVault
 */
const positionColumns = (isVault) => [
  {
    id: "asset",
    accessorKey: "symbol",
    header: isVault ? "Vault" : "Activo",
    cell: (info) => <AssetCell row={info.row.original} isVault={isVault} />,
  },
  {
    id: "chain",
    accessorKey: "chainLabel",
    header: "Red",
    cell: (info) => (
      <span className="whitespace-nowrap font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
        {info.getValue()}
      </span>
    ),
  },
  {
    id: "balance",
    accessorKey: "balance",
    header: "Saldo",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[#19363F]">{formatBalance(info.getValue())}</span>
    ),
  },
  {
    id: "price",
    accessorKey: "priceUsd",
    header: "Precio",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.55)]">
        {formatPrice(info.getValue())}
      </span>
    ),
  },
  {
    id: "value",
    accessorKey: "valueUsd",
    header: "Valor",
    meta: { align: "right" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-[#19363F]">
        {formatUsdPrecise(info.getValue())}
      </span>
    ),
  },
];

/**
 * One group of positions — vaults, xStocks or loose tokens.
 *
 * The old page drew a separate table per chain inside each group, which meant five
 * headers to hold two rows apiece. One table with a «Red» column says the same
 * thing, sorts by chain so the networks still group visually, and leaves the
 * numeric columns aligned down the whole list where they can be compared.
 *
 * A holding is a row-level record, so the checkboxes and the export stay on
 * (CLAUDE.md) — pulling one user's vault positions out to compare against another's
 * is exactly what this tab is for. The search box does not: these lists run to a
 * handful of rows and a filter over eight of them is furniture.
 *
 * Each group exports separately because each is a different dataset — a vault row's
 * first column is a protocol and a token row's is a ticker, so one combined file
 * would need a column that means two things.
 */
const PositionsGroup = ({ title, subtitle, rows, totalUsd, isVault, emptyLabel, filename }) => (
  <section className="flex flex-col gap-2.5">
    <SectionHeader
      title={title}
      subtitle={subtitle}
      aside={
        <span className="font-inter text-[12px] font-semibold tabular-nums tracking-[-0.48px] text-[#19363F]">
          {formatUsd(totalUsd, { decimals: 2 })}
        </span>
      }
    />

    {rows.length === 0 ? (
      <EmptyBlock>{emptyLabel}</EmptyBlock>
    ) : (
      <DataTable
        data={rows}
        columns={positionColumns(isVault)}
        filename={filename}
        getRowId={(row) => row.id}
        enableSearch={false}
        showRowCount={false}
        emptyLabel={emptyLabel}
        bare
        dense
      />
    )}
  </section>
);

/**
 * One half of the PnL summary. Renders only when the endpoint actually sent it —
 * a missing half is left out rather than drawn at $0, which on a performance figure
 * would read as "flat" instead of "unknown".
 */
const PnlCard = ({ label, block, note }) => {
  if (!block) return null;

  return (
    <div className="flex min-w-[180px] flex-1 flex-col gap-1 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
          {label}
        </span>
        <SignedUsd value={block.pnlUsd} className="text-[13px]" />
      </div>

      <div className="flex items-baseline justify-between gap-2 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
        <span className="tabular-nums">
          {block.valueUsd === null
            ? "—"
            : `${formatUsd(block.valueUsd, { decimals: 2 })} en cartera`}
        </span>
        {block.pct !== null && (
          <span
            className={cn(
              "tabular-nums",
              block.pct > 0 ? "text-emerald-700" : block.pct < 0 ? "text-red-600" : undefined
            )}
          >
            {block.pct > 0 ? "+" : ""}
            {formatPercent(block.pct)}
          </span>
        )}
      </div>

      {note && (
        <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          {note}
        </span>
      )}
    </div>
  );
};

/**
 * What the user has made — the only performance figure in the whole API, and the
 * one number on this drawer that is about them rather than about us.
 *
 * Comes from `/users/{privyId}/pnl`, whose shape admin.md does not document; when
 * nothing readable arrives the section says so instead of rendering zeros. The
 * percentage is computed against value − ganancia, so it reads as a return on what
 * was actually put in.
 */
const PnlBlock = ({ pnl, vaultPositions, isLoading }) => {
  if (isLoading) {
    return (
      <section className="flex flex-col gap-2.5">
        <SectionHeader title="Rendimiento (PnL)" />
        <div className="flex items-center justify-center py-6">
          <Spinner className="size-5" />
        </div>
      </section>
    );
  }

  if (!pnl) {
    return (
      <section className="flex flex-col gap-2.5">
        <SectionHeader
          title="Rendimiento (PnL)"
          aside={
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
              Fuente: Hyxora
            </span>
          }
        />
        <EmptyBlock>
          <span className="block">
            <code className="rounded bg-[rgba(25,54,63,0.05)] px-1 py-0.5 font-mono text-[10px]">
              /users/&#123;privyId&#125;/pnl
            </code>{" "}
            no devolvió ninguna cifra legible.
          </span>
          <span className="mt-1 block">
            Es el único endpoint que sabe cuánto ha ganado el usuario, y su forma no está
            documentada en admin.md. No inventamos un 0 aquí: sería indistinguible de alguien que ha
            quedado exactamente en tablas.
          </span>
        </EmptyBlock>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2.5">
      <SectionHeader
        title="Rendimiento (PnL)"
        aside={
          <div className="flex items-baseline gap-2">
            <SignedUsd value={pnl.totalPnlUsd} className="text-[14px]" />
            {pnl.totalValueUsd !== null && (
              <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                sobre {formatUsd(pnl.totalValueUsd, { decimals: 0 })}
              </span>
            )}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <PnlCard
          label="EVM (tokens + vaults)"
          block={pnl.evm}
          note={
            pnl.vaults?.pnlUsd !== undefined && pnl.vaults?.pnlUsd !== null
              ? `de los cuales vaults: ${pnl.vaults.pnlUsd > 0 ? "+" : ""}${formatUsdPrecise(pnl.vaults.pnlUsd)}`
              : undefined
          }
        />
        <PnlCard label="xStocks / Solana" block={pnl.solana} />
      </div>

      {vaultPositions && vaultPositions.positions.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)] px-3 py-2.5">
          <span className="font-inter text-[10px] font-medium uppercase tracking-[0.4px] text-[rgba(25,54,63,0.4)]">
            Por vault
          </span>
          {vaultPositions.positions.map((position) => (
            <div key={position.id} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
                {position.name}
                {position.chainLabel !== "—" && (
                  <span className="ml-1.5 text-[10px] text-[rgba(25,54,63,0.35)]">
                    {position.chainLabel}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                {position.assetsUsd !== null && (
                  <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                    {formatUsd(position.assetsUsd, { decimals: 2 })}
                  </span>
                )}
                <SignedUsd value={position.pnlUsd} className="text-[11px]" />
              </span>
            </div>
          ))}
        </div>
      )}

      <Footnote>
        El PnL de vaults ya está contenido en el de EVM — un depósito es una posición EVM más, así
        que sumarlos lo contaría dos veces. El porcentaje usa coste base = valor − ganancia. Cifras
        de Hyxora, no de Zerion: Zerion no guarda precio de entrada y por eso no puede decir qué ha
        ganado una posición, solo cuánto vale.
      </Footnote>
    </section>
  );
};

/**
 * Tab 2 — what the user holds and what it has done for them.
 *
 * PnL leads because it is the question you open a portfolio to ask; the holdings
 * follow, split into the three groups that mean different things. The split is
 * ported from the old dashboard and the reasons are in `normalize.groupPositions`.
 *
 * @param {Object} props
 * @param {ReturnType<import("./normalize").groupPositions>} props.positions
 * @param {ReturnType<import("./normalize").readPnl>} props.pnl
 * @param {ReturnType<import("./normalize").readVaultPositions>} props.vaultPositions
 * @param {boolean} props.isPnlLoading
 * @param {string | null} props.snapshotDate Day the Zerion snapshot is from.
 */
const CarteraTab = ({ positions, pnl, vaultPositions, isPnlLoading, snapshotDate }) => (
  <div className="flex flex-col gap-6 p-4">
    <PnlBlock pnl={pnl} vaultPositions={vaultPositions} isLoading={isPnlLoading} />

    {positions.count === 0 ? (
      <EmptyBlock>
        Todavía no hay ninguna posición registrada para este usuario. Puede ser una cuenta sin saldo
        o una cartera que aún no se ha refrescado.
      </EmptyBlock>
    ) : (
      <>
        <PositionsGroup
          title="Vaults"
          subtitle="Depósitos con rendimiento en distintos protocolos (Fluid, Morpho, Aave…)."
          rows={positions.vaults}
          totalUsd={positions.vaultTotal}
          isVault
          filename="usuario-vaults"
          emptyLabel="Sin depósitos en vaults."
        />

        {positions.xstocks.length > 0 && (
          <PositionsGroup
            title="xStocks"
            subtitle="Acciones tokenizadas (Backed Finance) en la cartera de Solana."
            rows={positions.xstocks}
            totalUsd={positions.xstockTotal}
            filename="usuario-xstocks"
            emptyLabel="Sin posiciones de xStocks."
          />
        )}

        <PositionsGroup
          title="Activos en cartera"
          subtitle="Saldos de tokens en el Safe directamente, sin protocolo."
          rows={positions.wallet}
          totalUsd={positions.walletTotal}
          filename="usuario-activos"
          emptyLabel="Sin saldos sueltos."
        />

        <Footnote>
          Instantánea de Zerion{snapshotDate ? ` del ${snapshotDate}` : ""}, no un valor en vivo.
          Las posiciones de tipo «reward» —polvo de incentivos, casi siempre por debajo de un dólar—
          van con los activos en cartera y no con los vaults: por número encabezarían la lista sin
          aportar nada.
        </Footnote>
      </>
    )}
  </div>
);

export default CarteraTab;
