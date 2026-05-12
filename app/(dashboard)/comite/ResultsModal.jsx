"use client";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useGetPollResults } from "@/hooks/poll/useGetPollResults";

const ResultsModal = ({ open, onClose, poll }) => {
  const {
    data: resultsData,
    isLoading,
    error,
  } = useGetPollResults(open ? poll?.number : null);

  const results = resultsData?.results || [];
  const total = resultsData?.total ?? resultsData?.totalVotes ?? 0;

  const handleClose = () => onClose?.();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      classWrapper="max-w-[600px] overflow-hidden"
    >
      <div
        className="flex flex-col gap-4 items-start pb-5 px-5 pt-5 rounded-2xl w-full bg-[#FCFDFD] max-h-[80vh] overflow-y-auto"
        data-lenis-prevent
      >
        {/* Header */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2D68FF] font-inter font-semibold text-[12px] leading-4.5 tracking-[-0.24px] rounded-md">
              #{poll?.number}
            </span>
            <span className="px-2 py-0.5 rounded-full font-inter text-[11px] font-medium bg-[#F1F5F9] text-[#6B7280]">
              Cerrada
            </span>
          </div>
          <p className="font-medium leading-normal text-[22px] tracking-[-4%] text-[#0D1117] leading-[24px]">
            {poll?.title || resultsData?.title || "Resultados de la Consulta"}
          </p>
        </div>
        {/* Description */}
        {poll?.description && (
          <div
            className="font-inter text-[13px] leading-5 text-[#6B7280] prose prose-sm max-w-none max-h-[120px] overflow-auto w-full"
            style={{ whiteSpace: "pre-line" }}
            data-lenis-prevent
            dangerouslySetInnerHTML={{ __html: poll.description }}
          />
        )}
        {/* Results */}
        <div className="flex flex-col gap-3 w-full">
          <p className="font-inter text-[14px] font-semibold text-[#0D1117]">
            Resultados de Votación
          </p>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : error ? (
            <p className="font-inter text-[12px] text-red-500">
              {error?.response?.data?.message ||
                error?.message ||
                "Error al cargar los resultados"}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((item, idx) => {
                const votes = item.votes ?? item.count ?? 0;
                const pct =
                  item.percentage ??
                  (total > 0 ? Math.round((votes / total) * 100) : 0);
                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-inter text-[13px] font-medium tracking-[-0.26px] text-[#0D1117] truncate">
                        {String.fromCharCode(65 + idx)}. {item.option}
                      </span>
                      <span className="font-inter text-[12px] text-[#6B7280] shrink-0">
                        {votes} voto{votes !== 1 ? "s" : ""} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2D68FF] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="font-inter text-[12px] text-[#6B7280]">
                Total: {total} voto{total !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
        <Button isPrimary onClick={handleClose} className="w-full">
          Cerrar
        </Button>
      </div>
    </Modal>
  );
};

export default ResultsModal;
