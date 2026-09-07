"use client";

import CopyButton from "@/components/CopyButton";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { formatNumber, formatUsd, formatUsdPrecise, timeAgo, toDayString } from "@/utils/format";
import AddressLink from "../../../shared/AddressLink";
import StatCard from "../../../shared/StatCard";
import {
  DetailField,
  EmptyBlock,
  Footnote,
  KycBadge,
  MembershipBadge,
  NftChip,
  SectionHeader,
  SignedUsd,
} from "./parts";

const formatDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toDayString(date);
};

const Dash = () => <span className="font-inter text-[11px] text-[rgba(25,54,63,0.3)]">—</span>;

/**
 * Every address the account owns, in one block.
 *
 * The three are not interchangeable and the labels have to say which is which: the
 * **signer** is the EOA that authorises, the **Safes** are what actually hold the
 * EVM balance and are the addresses every cost and fee row joins on, and the
 * **Solana wallet** is a separate keypair holding the xStocks. Looking up the wrong
 * one is the easiest mistake to make on this screen, so each carries an explorer
 * link and a copy button rather than being a string to squint at.
 *
 * Safes are a **list**, as on the old page: `/users` sends only the first, but
 * `safe_addresses` on the detail record is a per-chain map and a user who moved
 * between Safes on one chain has more than one. `readUserRecord` flattens it.
 *
 * The Solana wallet has no source but that same detail record — `getUsersOverview`,
 * which `/users` ports, never selected the column — so when the record is absent
 * the field says that instead of leaving a dash to be read as "no wallet".
 */
const AddressBlock = ({ user, detailLoaded }) => {
  const safes = Array.isArray(user.safeAddresses) ? user.safeAddresses : [];
  const solanaUnavailable = !user.solanaAddress && detailLoaded && !user.hasRecord;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <DetailField label="Privy ID" value={user.privyId} copy={user.privyId} mono />

      <DetailField
        label="Firmante (EOA)"
        copy={user.signerAddress ?? undefined}
        hint="La cuenta que firma. No guarda saldo."
      >
        {user.signerAddress ? (
          <AddressLink address={user.signerAddress} chainId={8453} lead={10} tail={8} />
        ) : (
          <Dash />
        )}
      </DetailField>

      <DetailField
        label={safes.length > 1 ? `Safes (${safes.length})` : "Safe"}
        copy={safes.length === 1 ? safes[0] : undefined}
        hint="Donde vive el saldo EVM. Es la dirección con la que se cruzan costes y comisiones."
      >
        {safes.length === 0 ? (
          <Dash />
        ) : (
          <div className="flex min-w-0 flex-col gap-1">
            {safes.map((safe) => (
              <div key={safe} className="flex min-w-0 items-center gap-1.5">
                <AddressLink address={safe} chainId={8453} lead={10} tail={8} />
                {safes.length > 1 && <CopyButton text={safe} />}
              </div>
            ))}
          </div>
        )}
      </DetailField>

      <DetailField
        label="Cartera Solana"
        copy={user.solanaAddress ?? undefined}
        hint={
          solanaUnavailable
            ? "/users/{privyId} no trajo el registro del usuario, que es lo único que la lleva."
            : "Clave aparte. Aquí están los xStocks."
        }
      >
        {user.solanaAddress ? (
          <AddressLink address={user.solanaAddress} lead={10} tail={8} />
        ) : solanaUnavailable ? (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-amber-700">sin dato</span>
        ) : (
          <Dash />
        )}
      </DetailField>
    </div>
  );
};

/**
 * Who the account is: the two handles, the plan, the membership and the KYC.
 *
 * Privy's `username` and `twitterUsername` are different things — the first is the
 * handle inside the app, the second is only set when they logged in through X — and
 * an account can have either, both or neither, which is why an email-less user is
 * normal rather than a data problem.
 */
const IdentityBlock = ({ user }) => {
  const renewDay = formatDay(user.membershipRenewDate);
  const createdDay = formatDay(user.createdAt);
  const memberSinceDay = formatDay(user.membershipStartDate);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <DetailField label="Usuario" value={user.username ? `@${user.username}` : null} />

      <DetailField
        label="X / Twitter"
        value={user.twitterUsername ? `@${user.twitterUsername}` : null}
      />

      <DetailField label="Plan">
        <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
          {cerebroPlanLabel(user.plan)}
        </span>
        <NftChip balance={user.nftBalance} tokenIds={user.nftTokenIds} />
      </DetailField>

      <DetailField label="KYC">
        <KycBadge status={user.kycStatus} />
      </DetailField>

      <DetailField label="Membresía" hint={renewDay ? `Renueva ${renewDay}` : undefined}>
        <MembershipBadge status={user.membershipStatus} />
      </DetailField>

      <DetailField
        label="Alta"
        value={createdDay}
        hint={user.createdAt ? timeAgo(user.createdAt) : undefined}
      />

      {/* Only `/users/{privyId}` carries these two — they live on the user record,
          not on the `/users` list row — so they appear once the detail resolves and
          are simply absent before that rather than flashing a dash. */}
      {user.membershipPaymentType && (
        <DetailField
          label="Cobro"
          value={user.membershipPaymentType}
          hint={user.membershipPaymentType === "manual" ? "Founder: mint único" : undefined}
        />
      )}

      {memberSinceDay && <DetailField label="Miembro desde" value={memberSinceDay} />}

      {Array.isArray(user.nftTokenIds) && user.nftTokenIds.length > 0 && (
        <DetailField
          label="Founder NFT"
          value={user.nftTokenIds.map((id) => `#${id}`).join(", ")}
          className="col-span-2"
        />
      )}
    </div>
  );
};

/**
 * Hyxora's lifetime margin on this user.
 *
 * The signs are the whole point and they are counter-intuitive at a glance: gas is
 * money we spent, fees are money we took, and a **negative** net means we are
 * subsidising this person. NFT sales are excluded upstream, so a founder who paid
 * for their mint still reads as a cost until they transact — the footnote says so
 * rather than letting the number imply a loss that isn't one.
 */
const MarginBlock = ({ margin }) => (
  <section className="flex flex-col gap-3">
    <SectionHeader
      title="Ingresos y gastos (histórico)"
      subtitle="Lo que este usuario ha dejado en comisiones frente a lo que nos ha costado patrocinarle el gas."
      aside={
        <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          Excluye ventas de NFT
        </span>
      }
    />

    <div className="flex flex-wrap gap-2">
      <StatCard
        value={
          <span className="text-red-600">
            {margin.costUsd === null ? "—" : formatUsdPrecise(margin.costUsd)}
          </span>
        }
        label="Gas patrocinado"
        hint={
          margin.costOps === null ? undefined : `${formatNumber(margin.costOps)} ops patrocinadas`
        }
      />
      <StatCard
        value={
          <span className="text-emerald-700">
            {margin.feesUsd === null ? "—" : formatUsdPrecise(margin.feesUsd)}
          </span>
        }
        label="Comisiones cobradas"
        hint={margin.feeTxs === null ? undefined : `${formatNumber(margin.feeTxs)} comisiones`}
      />
      <StatCard
        value={<SignedUsd value={margin.netUsd} className="font-semibold" />}
        label="Margen"
        tone={margin.netUsd !== null && margin.netUsd < 0 ? "warning" : "neutral"}
        hint={
          margin.recoveryPct
            ? `${margin.recoveryPct}% de recuperación de coste`
            : "Sin actividad suficiente"
        }
      />
    </div>

    <Footnote>
      Margen negativo significa que le estamos subvencionando: el gas que pagamos por él supera lo
      que ha pagado en comisiones. Es lo normal en una cuenta nueva y en cualquier founder que aún
      no haya operado.
    </Footnote>
  </section>
);

/**
 * The subsidy split — how many sponsored ops earned a fee and how many we simply
 * paid for.
 *
 * This is the answer to "why is this user's margin negative" nine times out of ten,
 * which is why it sits directly under it. The bar carries the proportion because
 * that is the reading; the tiles underneath carry the absolute numbers because
 * "83% free" over four ops is not the same finding as over four hundred.
 */
const FreeVsPaidBlock = ({ freeVsPaid }) => {
  if (freeVsPaid.totalOps === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SectionHeader title="Ops gratis frente a ops con comisión" />
        <EmptyBlock>Todavía no hay ninguna operación patrocinada para este usuario.</EmptyBlock>
      </section>
    );
  }

  const paidPct = 100 - freeVsPaid.freePct;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Ops gratis frente a ops con comisión"
        subtitle="«Gratis» es una operación que patrocinamos sin cobrar ninguna comisión de tesorería."
      />

      <div className="flex h-2 overflow-hidden rounded-full bg-[rgba(25,54,63,0.06)]">
        <div
          className="bg-emerald-500"
          style={{ width: `${paidPct}%` }}
          title={`${freeVsPaid.paidOps} ops con comisión`}
        />
        <div
          className="bg-amber-400"
          style={{ width: `${freeVsPaid.freePct}%` }}
          title={`${freeVsPaid.freeOps} ops gratis`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <StatCard value={formatNumber(freeVsPaid.totalOps)} label="Ops totales" />
        <StatCard
          value={<span className="text-emerald-700">{formatNumber(freeVsPaid.paidOps)}</span>}
          label="Con comisión"
          hint={
            freeVsPaid.paidCostUsd === null
              ? `${paidPct}% del total`
              : `${paidPct}% · ${formatUsdPrecise(freeVsPaid.paidCostUsd)} de gas`
          }
        />
        <StatCard
          value={<span className="text-amber-700">{formatNumber(freeVsPaid.freeOps)}</span>}
          label="Gratis"
          tone={freeVsPaid.freePct > 50 ? "warning" : "neutral"}
          hint={`${freeVsPaid.freePct}% del total`}
        />
        <StatCard
          value={
            freeVsPaid.freeCostUsd === null ? (
              "—"
            ) : (
              <span className={freeVsPaid.freeCostUsd > 0 ? "text-amber-700" : undefined}>
                {formatUsdPrecise(freeVsPaid.freeCostUsd)}
              </span>
            )
          }
          label="Subvención"
          hint="Gas que pusimos en ops sin comisión"
        />
      </div>
    </section>
  );
};

/**
 * Tab 1 — who this person is and what they are worth to us.
 *
 * The order is deliberate: identity and addresses first because that is what a
 * support question starts from, then the balance, then our economics on them. What
 * *they* have made is a different question and lives in «Cartera».
 *
 * @param {Object} props
 * @param {Object} props.user The `/users` row the drawer was opened from.
 * @param {ReturnType<import("./normalize").readTvl>} props.tvl
 * @param {ReturnType<import("./normalize").readMargin>} props.margin
 * @param {ReturnType<import("./normalize").readFreeVsPaid>} props.freeVsPaid
 * @param {number} props.positionCount
 * @param {number | null} props.pnlUsd Headline only; the breakdown is in «Cartera».
 * @param {boolean} [props.detailLoaded] The `/users/{privyId}` response arrived. Separates "no
 * Solana wallet" from "the response carried no user record to read one from".
 */
const ResumenTab = ({ user, tvl, margin, freeVsPaid, positionCount, pnlUsd, detailLoaded }) => (
  <div className="flex flex-col gap-6 p-4">
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Cuenta"
        aside={
          tvl.refreshedAt && (
            <span
              className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]"
              title={`Cartera actualizada ${tvl.refreshedAt}`}
            >
              Cartera {timeAgo(tvl.refreshedAt)}
            </span>
          )
        }
      />
      <IdentityBlock user={user} />
      <div className="h-px bg-[rgba(25,54,63,0.06)]" />
      <AddressBlock user={user} detailLoaded={detailLoaded} />
    </section>

    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Saldo"
        subtitle="Instantánea de Zerion en la fecha de arriba, no un valor en vivo."
      />
      <div className="flex flex-wrap gap-2">
        <StatCard
          value={tvl.totalUsd === null ? "—" : formatUsd(tvl.totalUsd, { decimals: 0 })}
          label="Valor de cartera"
          hint="Suma de todas las posiciones"
        />
        <StatCard
          value={tvl.vaultUsd === null ? "—" : formatUsd(tvl.vaultUsd, { decimals: 0 })}
          label="En vaults"
          hint="Depósitos con rendimiento"
        />
        <StatCard
          value={formatNumber(positionCount)}
          label="Posiciones"
          hint="Activos distintos en cartera"
        />
        {pnlUsd !== null && (
          <StatCard
            value={<SignedUsd value={pnlUsd} className="font-semibold" />}
            label="Rendimiento"
            hint="Lo que ha ganado él · desglose en «Cartera»"
          />
        )}
      </div>
    </section>

    <MarginBlock margin={margin} />

    <FreeVsPaidBlock freeVsPaid={freeVsPaid} />
  </div>
);

export default ResumenTab;
