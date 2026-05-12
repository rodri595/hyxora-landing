"use client";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import Error from "@/components/Error";
import Icon from "@/components/Icon";
import { useMemo, useState } from "react";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetAllPolls } from "@/hooks/poll/useGetAllPolls";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import Topic from "./Topic";
import VoteModal from "./VoteModal";
import ResultsModal from "./ResultsModal";
import { cn } from "@/utils";

const StatsCard = ({
  icon,
  iconClassName,
  title,
  subtitle,
  count,
  dark,
  badge,
}) => (
  <div
    className={cn(
      "flex flex-col gap-[16px] min-w-[200px] h-[128px] flex-1 rounded-[8px] border p-4 overflow-hidden relative",
      dark ? "border-[#1E2A38]" : "bg-white border-[#E4E9EF]",
    )}
    style={
      dark
        ? {
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.20) 100%), radial-gradient(79.3% 79.3% at 50.16% 96.09%, #2C66EF 0%, #091A1F 100%)",
          }
        : undefined
    }
  >
    <div className="flex w-full justify-between items-start">
      <div className="relative flex items-center justify-center size-[24px] shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="absolute"
        >
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="23"
            rx="2.83333"
            stroke={`url(#grad-${icon})`}
            strokeOpacity="0.6"
          />
          <defs>
            <radialGradient
              id={`grad-${icon}`}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(15 8) rotate(132.614) scale(16.9853)"
            >
              <stop stopColor="#1B5FFD" />
              <stop offset="1" stopColor="#1B5FFD" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <Icon
          name={icon}
          size={20}
          className={cn("size-[16px]", iconClassName)}
          fill={dark ? "white" : undefined}
        />
      </div>
      {badge ? (
        <span
          className={cn(
            "rounded-full font-inter text-[11px] font-medium px-[8px] py-[2px]",
            dark ? "bg-white/10 text-white" : "bg-[#DCFCE7] text-[#16A34A]",
          )}
        >
          {badge}
        </span>
      ) : null}
      <span
        className={cn(
          "font-inter font-bold text-[24px] leading-none",
          dark ? "text-[#FFD970]" : "text-[#0D1117]",
        )}
      >
        {count}
      </span>
    </div>
    <div className="flex flex-col gap-[2px]">
      <span
        className={cn(
          "font-inter font-semibold text-[14px] leading-[20px] tracking-[-0.28px]",
          dark ? "text-[#FFD970]" : "text-[#0D1117]",
        )}
      >
        {title}
      </span>
      <span
        className={cn(
          "font-inter text-[12px] leading-[16px]",
          dark ? "text-[#FFD970]/90" : "text-[#6B7280]",
        )}
      >
        {subtitle}
      </span>
    </div>
  </div>
);

export default function ComitePage() {
  const router = useRouter();
  const {
    data: paymentsData,
    isPending: paymentsPending,
    error: paymentsError,
  } = GetMyPayments();

  const HasNft = useMemo(() => {
    if (!paymentsData || paymentsData?.length === 0) return false;
    const filteredPayments = paymentsData?.filter(
      (payment) => payment?.status === "completed" && payment?.tokenId,
    );
    return filteredPayments?.length > 0 ? filteredPayments : false;
  }, [paymentsData]);
  const {
    data: pollsData_data,
    isLoading: pollsData_isLoading,
    error: pollsData_error,
  } = useGetAllPolls({
    enabled: Boolean(HasNft),
  });

  const { data: userInfo_data } = useGetUserInformation();

  const [votePoll, setVotePoll] = useState(null);
  const [resultsPoll, setResultsPoll] = useState(null);

  const activePolls = useMemo(
    () => pollsData_data?.filter((poll) => poll.status === "ACTIVE") || [],
    [pollsData_data],
  );
  const closedPolls = useMemo(
    () => pollsData_data?.filter((poll) => poll.status === "CLOSED") || [],
    [pollsData_data],
  );
  const userVotedPolls = useMemo(
    () =>
      activePolls.filter((poll) =>
        poll.votes?.some(
          (vote) => vote?.user === userInfo_data?.information?._id,
        ),
      ),
    [activePolls, userInfo_data],
  );

  useEffect(() => {
    if (!paymentsPending && !HasNft) {
      router.replace("/");
    }
  }, [paymentsPending, HasNft, router]);

  if (paymentsPending) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (!HasNft) return null;

  return (
    <section
      className="flex-1 flex gap-[16px] justify-start items-start p-4 h-full min-h-0 overflow-y-auto"
      data-lenis-prevent
    >
      <div className="flex flex-col flex-1 gap-[16px]">
        <Error
          error={paymentsError}
          message={
            paymentsError?.response?.data?.message ||
            paymentsError?.message ||
            "Error al cargar datos del usuario"
          }
        />
        <Error
          error={pollsData_error}
          message={
            pollsData_error?.response?.data?.message ||
            pollsData_error?.message ||
            "Error al cargar datos de las consultas"
          }
        />
        <h2 className="text-white leading-[24px] font-inter text-[18px] font-semibold tracking-[-0.72px]">
          Comité Consultivo de Hyxora
        </h2>

        {/* Stats row */}
        <div className="flex gap-[16px] w-full flex-wrap">
          <StatsCard
            icon="sparkle"
            iconClassName="text-[#22C55E]"
            title="Consultas Abiertas"
            subtitle="Pendientes de votación"
            count={activePolls.length}
            badge={
              activePolls.length > 0
                ? `${activePolls.length} activas`
                : undefined
            }
          />
          <StatsCard
            icon="checkmark"
            iconClassName="text-[#6B7280]"
            title="Histórico de Consultas"
            subtitle="Consultas finalizadas"
            count={closedPolls.length}
            badge={
              closedPolls.length > 0
                ? `${closedPolls.length} finalizadas`
                : undefined
            }
          />
          <StatsCard
            icon="diamond"
            iconClassName="text-[#FFD970]"
            title="Has Votado"
            subtitle="En consultas abiertas"
            count={userVotedPolls.length}
            dark
          />
        </div>

        {/* Bottom panels */}
        <div className="flex gap-[16px] w-full max-md:flex-col">
          {/* Open polls */}
          <div className="flex flex-col flex-1 gap-[12px] rounded-[8px] border border-[#E4E9EF] bg-white p-4 min-h-[200px]">
            <div className="flex items-center justify-between">
              <h3 className="font-inter font-semibold text-[16px] leading-[24px] tracking-[-0.32px] text-[#0D1117]">
                Consultas Abiertas
              </h3>
              <span className="rounded-full bg-[#DCFCE7] text-[#16A34A] font-inter text-[12px] font-medium px-[8px] py-[2px]">
                {activePolls.length} activas
              </span>
            </div>
            {pollsData_isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : activePolls.length === 0 ? (
              <p className="font-inter text-[13px] text-[#6B7280] text-center py-6">
                No hay consultas abiertas
              </p>
            ) : (
              activePolls.map((poll) => (
                <Topic
                  key={poll._id}
                  poll={poll}
                  onOpenModal={() => setVotePoll(poll)}
                />
              ))
            )}
          </div>
          {/* History */}
          <div className="flex flex-col flex-1 gap-[12px] rounded-[8px] border border-[#E4E9EF] bg-white p-4 min-h-[200px]">
            <div className="flex items-center justify-between">
              <h3 className="font-inter font-semibold text-[16px] leading-[24px] tracking-[-0.32px] text-[#0D1117]">
                Histórico
              </h3>
              <span className="font-inter text-[12px] text-[#6B7280]">
                {closedPolls.length} finalizadas
              </span>
            </div>
            {pollsData_isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : closedPolls.length === 0 ? (
              <p className="font-inter text-[13px] text-[#6B7280] text-center py-6">
                No hay consultas finalizadas
              </p>
            ) : (
              closedPolls.map((poll) => (
                <Topic
                  key={poll._id}
                  poll={poll}
                  onOpenResults={() => setResultsPoll(poll)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <VoteModal
        open={Boolean(votePoll)}
        onClose={() => setVotePoll(null)}
        poll={votePoll}
      />
      <ResultsModal
        open={Boolean(resultsPoll)}
        onClose={() => setResultsPoll(null)}
        poll={resultsPoll}
      />
    </section>
  );
}
