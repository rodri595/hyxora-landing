"use client";

import Spinner from "@/components/Spinner";
import { PaymentCard } from "@/components/UserDetailSidebar";
import { useGetAllSimUsers } from "@/hooks/simulator/useGetAllSimUsers";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { cn } from "@/utils";
import { formatNumber, formatUsd, timeAgo, toDayString } from "@/utils/format";
import { DetailField, EmptyBlock, SectionHeader } from "./parts";

const formatDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toDayString(date);
};

const lower = (value) => (typeof value === "string" && value ? value.toLowerCase() : null);

const Loading = () => (
  <div className="flex items-center justify-center py-8">
    <Spinner className="size-6" />
  </div>
);

/**
 * Not `QueryState`'s error: that one explains a 401 as the Cerebro allowlist, and
 * these requests go to the founders backend, which has no such list.
 */
const ErrorBlock = ({ what, error }) => {
  const status = error?.response?.status;
  const reason = error?.response?.data?.message || error?.message;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 font-inter text-[10px] font-medium tracking-[-0.4px] text-red-700">
      No se pudo cargar {what}
      {status ? ` (${status})` : ""}
      {reason ? `: ${reason}` : "."}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  if (!role) return <span className="text-[rgba(25,54,63,0.5)]">—</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.4px]",
        role === "Admin" ? "bg-[#19363F] text-white" : "bg-[rgba(25,54,63,0.06)] text-[#19363F]"
      )}
    >
      {role}
    </span>
  );
};

const SIM_STATUS = {
  active: { label: "Activo", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  suspended: {
    label: "Sin acceso",
    className: "border-[rgba(25,54,63,0.1)] bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.75)]",
  },
};

/**
 * The simulator account, for simulator admins only — the gate that shows the «Sim»
 * columns on `/admin?tab=users`. The simulator keys on the Privy DID, so that is
 * tried first; then email and the founders wallet, the way `UsersModule` matches it.
 *
 * @param {Object} props
 * @param {string} props.privyId
 * @param {Array<string | null | undefined>} props.emails
 * @param {string | null | undefined} props.wallet
 */
const SimBlock = ({ privyId, emails, wallet }) => {
  const { data: simUsers, isLoading, error } = useGetAllSimUsers();

  const list = Array.isArray(simUsers) ? simUsers : [];
  const wantedEmails = new Set(emails.map(lower).filter(Boolean));
  const wantedWallet = lower(wallet);
  const simUser =
    list.find((su) => su?.id && su.id === privyId) ??
    list.find((su) => wantedEmails.has(lower(su?.email))) ??
    (wantedWallet ? list.find((su) => lower(su?.wallet) === wantedWallet) : null) ??
    null;

  const status = SIM_STATUS[simUser?.status] ?? SIM_STATUS.suspended;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Simulador"
        subtitle="Su cuenta en el simulador de inversión: lo mismo que las columnas «Sim» de la pestaña Usuarios."
      />

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorBlock what="las cuentas del simulador" error={error} />
      ) : !simUser ? (
        <EmptyBlock>Aún no ha entrado al simulador.</EmptyBlock>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <DetailField label="Estado">
            <span
              className={cn(
                "inline-flex items-center rounded-[5px] border px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]",
                status.className
              )}
            >
              {SIM_STATUS[simUser.status]?.label ?? simUser.status}
            </span>
          </DetailField>
          {/* The simulator stores money as integer cents. */}
          <DetailField label="Saldo" value={formatUsd((simUser.cashBalanceCents ?? 0) / 100)} />
          <DetailField label="Operaciones" value={formatNumber(simUser.txCount ?? 0)} />
        </div>
      )}
    </section>
  );
};

/**
 * Tab — the founders-site account behind this Cerebro user: what `/admin?tab=users`
 * shows for them, without leaving the drawer.
 *
 * The one tab here that does not read Cerebro. The record comes from the founders
 * backend (`/admin/getAllUsers`, via `apiClient`) and is matched to this row in
 * `usuarios/founders.js` — by email, else by wallet — because the two databases
 * share no id. That is why it renders outside the drawer's Cerebro gate: a
 * `/users/{privyId}` outage must not hide a phone number, nor the reverse.
 *
 * @param {Object} props
 * @param {Object} props.user The merged Cerebro record.
 * @param {import("../founders").FounderMatch | null} props.founder
 * @param {"loading" | "error" | "ready"} props.status
 * @param {Error | null} [props.error]
 */
const FoundersTab = ({ user, founder, status, error }) => {
  const { data: simAccount } = useGetSimAccount();
  const isSimAdmin = simAccount?.user?.role === "admin";

  if (status === "loading") return <Loading />;

  if (status === "error") {
    return (
      <div className="p-4">
        <ErrorBlock what="los usuarios de la web founders" error={error} />
      </div>
    );
  }

  const record = founder?.user ?? null;
  const payments = [...(record?.payments ?? [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const createdDay = formatDay(record?.createdAt);

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Cuenta en la web founders"
          subtitle="La ficha de la pestaña Usuarios del admin. Sale del backend de la web founders, no de Cerebro."
          aside={
            record && (
              <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.68)]">
                {founder.matchedBy === "wallet" ? "Vinculado por wallet" : "Vinculado por correo"}
              </span>
            )
          }
        />

        {record ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DetailField
              label="Email"
              value={record.email || null}
              copy={record.email || undefined}
              hint={
                founder.matchedBy === "wallet"
                  ? "El correo no coincide con el de Cerebro o falta en uno de los dos."
                  : undefined
              }
            />
            <DetailField
              label="Teléfono"
              value={record.phoneNumber || null}
              copy={record.phoneNumber || undefined}
            />
            <DetailField label="Rol">
              <RoleBadge role={record.role} />
            </DetailField>
            <DetailField
              label="Registro"
              value={createdDay}
              hint={record.createdAt ? timeAgo(record.createdAt) : undefined}
            />
            <DetailField
              label="SmartWallet"
              value={record.address || null}
              copy={record.address || undefined}
              mono
              className="col-span-2"
            />
          </div>
        ) : (
          <EmptyBlock>
            No hay ninguna cuenta en la web founders con este correo, ni con su Safe o su firmante
            como wallet.
          </EmptyBlock>
        )}
      </section>

      {record && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Pagos"
            subtitle="Compras en la web founders con su factura, en cualquier estado: el mismo historial que «Pagos» en la pestaña Usuarios."
            aside={
              <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.68)]">
                {payments.length} {payments.length === 1 ? "pago" : "pagos"}
              </span>
            }
          />

          {payments.length === 0 ? (
            <EmptyBlock>Sin pagos registrados.</EmptyBlock>
          ) : (
            <div className="flex flex-col gap-2">
              {payments.map((payment) => (
                <PaymentCard key={payment._id} payment={payment} />
              ))}
            </div>
          )}
        </section>
      )}

      {isSimAdmin && (
        <SimBlock
          privyId={user.privyId}
          emails={[record?.email, user.email]}
          wallet={record?.address}
        />
      )}
    </div>
  );
};

export default FoundersTab;
