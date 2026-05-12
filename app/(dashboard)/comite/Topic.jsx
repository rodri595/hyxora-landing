"use client";
import { useState, useMemo } from "react";
import AnimateHeight from "react-animate-height";
import Icon from "@/components/Icon";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Abierta",
    color: "bg-[#DCFCE7] text-[#16A34A]",
    icon: "check-circle",
  },
  CLOSED: {
    label: "Cerrada",
    color: "bg-[#F1F5F9] text-[#6B7280]",
    icon: "close",
  },
  UPCOMING: {
    label: "Próximamente",
    color: "bg-[#EFF6FF] text-[#2D68FF]",
    icon: "clock",
  },
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function Topic({ poll, onOpenModal, onOpenResults }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: userInfo_data } = useGetUserInformation();

  const hasVoted = useMemo(() => {
    if (poll?.votes && userInfo_data?.information?._id) {
      return poll.votes.some(
        (vote) => vote?.user === userInfo_data?.information?._id,
      );
    }
    return false;
  }, [userInfo_data, poll]);

  const votes = poll?.votes?.length || 0;
  const statusConfig = STATUS_CONFIG[poll?.status] || STATUS_CONFIG.ACTIVE;

  const handleDownloadFile = (e) => {
    e.stopPropagation();
    if (poll?.fileId) {
      window.open(poll.file, "_blank");
    }
  };

  return (
    <div className="bg-white border border-[#E4E9EF] rounded-lg overflow-hidden transition-shadow hover:shadow-sm">
      {/* Compact Header */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2D68FF] font-inter font-semibold text-[12px] leading-4.5 tracking-[-0.24px] rounded-md shrink-0">
            #{poll?.number}
          </span>
          <h3 className="flex-1 min-w-0 font-inter font-semibold text-[14px] max-md:text-[12px] leading-5 tracking-[-0.28px] text-[#0D1117] truncate max-md:whitespace-normal max-md:break-all">
            {poll?.title}
          </h3>
          <button
            className="shrink-0 p-1 rounded-md hover:bg-[#F7F8F8] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
          >
            <Icon
              name="chevron"
              size={20}
              className={[
                "size-5 text-[#6B7280] transition-transform duration-200",
                isExpanded ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span
            className={`px-2 py-0.5 rounded-full font-inter text-[11px] font-medium leading-4 ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>

          {hasVoted && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-inter bg-[#000C1A] border border-[#FFD970]/30 flex items-center gap-0.5">
              <Icon
                name="check"
                size={20}
                className="size-[12px] "
                fill={"#FFD970"}
              />
              <span className="bg-gradient-to-r from-[#FFD970] to-[#A37800] bg-clip-text text-transparent">
                Votado
              </span>
            </span>
          )}

          {poll?.fileId && (
            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F7F8FF] border border-[#2D68FF]/20 hover:bg-[#EFF6FF] transition-colors"
            >
              <Icon
                name="download"
                size={20}
                className="size-3 text-[#2D68FF]"
              />
              <span className="font-inter text-[10px] font-medium uppercase tracking-[0.4px] text-[#2D68FF]">
                Archivo
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Section */}
      <AnimateHeight
        duration={300}
        height={isExpanded ? "auto" : 0}
        easing="ease-in-out"
      >
        <div className="px-4 pb-4 space-y-4 border-t border-[#E4E9EF]">
          {/* Title */}
          <div className="pt-4">
            <p className="font-inter text-[11px] font-medium tracking-[-0.22px] text-[#6B7280] mb-1">
              Título
            </p>
            <p className="font-inter text-[13px] leading-5 tracking-[-0.26px] text-[#0D1117]">
              {poll?.title}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="font-inter text-[11px] font-medium tracking-[-0.22px] text-[#6B7280] mb-1">
              Descripción
            </p>
            <div
              className="font-inter text-[13px] leading-5 tracking-[-0.26px] text-[#6B7280] prose prose-sm max-w-none"
              style={{ whiteSpace: "pre-line" }}
              dangerouslySetInnerHTML={{ __html: poll?.description }}
            />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 bg-[#F7F8F8] rounded-lg">
              <div className="w-8 h-8 rounded-md bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <Icon
                  name="clock"
                  size={20}
                  className="size-4 text-[#16A34A]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-[11px] font-medium tracking-[-0.22px] text-[#6B7280]">
                  Inicia
                </p>
                <p className="font-inter text-[12px] font-semibold tracking-[-0.24px] text-[#0D1117] truncate">
                  {formatDate(poll?.startsAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F7F8F8] rounded-lg">
              <div className="w-8 h-8 rounded-md bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <Icon
                  name="clock"
                  size={20}
                  className="size-4 text-[#DC2626]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-[11px] font-medium tracking-[-0.22px] text-[#6B7280]">
                  Finaliza
                </p>
                <p className="font-inter text-[12px] font-semibold tracking-[-0.24px] text-[#0D1117] truncate">
                  {formatDate(poll?.endsAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F7F8F8] rounded-lg">
              <div className="w-8 h-8 rounded-md bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Icon
                  name="people"
                  size={20}
                  className="size-4 text-[#2D68FF]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-[11px] font-medium tracking-[-0.22px] text-[#6B7280]">
                  Total de Votos
                </p>
                <p className="font-inter text-[12px] font-semibold tracking-[-0.24px] text-[#0D1117]">
                  {votes}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          {poll?.options && poll.options.length > 0 && (
            <div>
              <p className="font-inter text-[11px] font-medium tracking-[-0.22px] text-[#6B7280] mb-2">
                Opciones de Votación
              </p>
              <div className="flex flex-wrap gap-2">
                {poll.options.map((option, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#F7F8F8] border border-[#E4E9EF] rounded-md font-inter text-[12px] font-medium tracking-[-0.24px] text-[#0D1117]"
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-[#E4E9EF]">
            {poll?.status === "ACTIVE" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal?.();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 bg-[#0D1117] hover:bg-[#1E2A38] text-white font-inter font-medium text-[13px] leading-none tracking-[-0.26px] rounded-lg transition-colors"
              >
                <Icon name="check-circle" size={20} className="size-4" />
                {hasVoted ? "Ver voto" : "Votar ahora"}
              </button>
            )}

            {poll?.status === "CLOSED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenResults?.();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 bg-[#0D1117] hover:bg-[#1E2A38] text-white font-inter font-medium text-[13px] leading-none tracking-[-0.26px] rounded-lg transition-colors"
              >
                <Icon name="edit-list" size={20} className="size-4" />
                Ver resultados
              </button>
            )}
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
}
