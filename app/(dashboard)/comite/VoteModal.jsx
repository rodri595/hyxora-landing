"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import Icon from "@/components/Icon";
import { useVotePoll } from "@/hooks/poll/useVotePoll";
import { useGetPollResults } from "@/hooks/poll/useGetPollResults";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";

const VoteModal = ({ open, onClose, poll }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [message, setMessage] = useState("");

  const { mutate, isPending, isSuccess, error, reset } = useVotePoll();
  const { data: userInfo } = useGetUserInformation();

  const userVote = useMemo(() => {
    if (!userInfo?.information?._id || !poll?.votes) return null;
    return poll.votes.find((v) => v.user === userInfo.information._id) ?? null;
  }, [userInfo, poll]);

  const hasVoted = Boolean(userVote);
  const isClosed = poll?.status === "CLOSED";

  const { data: resultsData, isLoading: resultsLoading } = useGetPollResults(
    (hasVoted || isClosed) && open ? poll?.number : null,
  );

  const results = resultsData?.results || [];
  const total = resultsData?.total ?? resultsData?.totalVotes ?? 0;

  useEffect(() => {
    if (open) {
      setSelectedOption(null);
      setMessage("");
      reset();
    }
  }, [open, reset]);

  const handleClose = () => onClose?.();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) return;
    mutate({ pollNumber: poll?.number, option: selectedOption, message });
  };

  if (isSuccess) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        classWrapper="max-w-[500px] overflow-hidden"
      >
        <div className="flex flex-col gap-4 items-center pb-5 px-5 rounded-2xl w-full bg-[#FCFDFD]">
          <p className="w-full font-medium leading-normal text-[24px] tracking-[-4%] text-left mt-4">
            ¡Voto registrado!
          </p>
          <p className="text-[14px] text-[#5E7279]">
            Tu voto ha sido registrado correctamente.
          </p>
          <Button isPrimary onClick={handleClose} className="w-full mt-2">
            Cerrar
          </Button>
        </div>
      </Modal>
    );
  }

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
            <span
              className={`px-2 py-0.5 rounded-full font-inter text-[11px] font-medium ${
                isClosed
                  ? "bg-[#F1F5F9] text-[#6B7280]"
                  : "bg-[#DCFCE7] text-[#16A34A]"
              }`}
            >
              {isClosed ? "Cerrada" : "Abierta"}
            </span>
          </div>
          <p className="font-medium leading-normal text-[24px] tracking-[-4%] text-[#0D1117]">
            {poll?.title || "Consulta"}
          </p>
        </div>

        {/* Description */}
        {poll?.description && (
          <div
            className="font-inter text-[13px] leading-5 text-[#6B7280] prose prose-sm max-w-none max-h-[180px] overflow-auto w-full"
            style={{ whiteSpace: "pre-line" }}
            data-lenis-prevent
            dangerouslySetInnerHTML={{ __html: poll.description }}
          />
        )}

        {/* File attachment */}
        {poll?.fileId && (
          <button
            onClick={() => window.open(poll.file, "_blank")}
            className="flex items-center gap-2 px-3 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg text-[#2D68FF] font-inter font-medium text-[13px] transition-colors w-full"
          >
            <Icon name="download-01" className="w-4 h-4 shrink-0" />
            Descargar archivo adjunto
          </button>
        )}

        {/* Already voted */}
        {hasVoted && (
          <>
            <div className="w-full rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" className="w-4 h-4 text-[#2D68FF]" />
                <p className="font-inter text-[13px] font-semibold text-[#2D68FF]">
                  Ya has votado en esta consulta
                </p>
              </div>
              <div className="bg-white rounded-md px-3 py-2 mt-1">
                <p className="font-inter text-[11px] text-[#6B7280] mb-0.5">
                  Tu voto:
                </p>
                <p className="font-inter text-[14px] font-semibold text-[#0D1117]">
                  {userVote?.option}
                </p>
                {userVote?.message && (
                  <>
                    <p className="font-inter text-[11px] text-[#6B7280] mt-2 mb-0.5">
                      Tu opinión:
                    </p>
                    <p className="font-inter text-[13px] text-[#374151]">
                      {userVote.message}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-3 w-full">
              <p className="font-inter text-[14px] font-semibold text-[#0D1117]">
                Resultados Actuales
              </p>
              {resultsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {results.map((item, idx) => {
                    const votes = item.votes ?? item.count ?? 0;
                    const pct =
                      item.percentage ??
                      (total > 0 ? Math.round((votes / total) * 100) : 0);
                    const isMyVote = item.option === userVote?.option;
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-inter text-[13px] font-medium tracking-[-0.26px] text-[#0D1117] truncate">
                              {String.fromCharCode(65 + idx)}. {item.option}
                            </span>
                            {isMyVote && (
                              <Icon
                                name="check-circle"
                                className="w-3.5 h-3.5 text-[#2D68FF] shrink-0"
                              />
                            )}
                          </div>
                          <span className="font-inter text-[12px] text-[#6B7280] shrink-0">
                            {votes} voto{votes !== 1 ? "s" : ""} · {pct}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isMyVote ? "bg-[#2D68FF]" : "bg-[#0D1117]"
                            }`}
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
          </>
        )}

        {/* Voting form */}
        {!hasVoted && !isClosed && (
          <form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
            <div className="flex flex-col gap-3">
              <p className="font-inter text-[14px] font-medium text-[#0D1117]">
                Selecciona tu opción:
              </p>
              {poll?.options?.map((option, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="voteOption"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => setSelectedOption(option)}
                    required
                    className="accent-[#19363f] w-4 h-4 shrink-0"
                  />
                  <span className="text-[#0D1117] leading-4.5 font-inter text-[13px] font-medium tracking-[-0.26px]">
                    {String.fromCharCode(65 + idx)}. {option}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-inter text-[13px] font-medium text-[#6B7280] tracking-[-0.26px]">
                Comentario{" "}
                <span className="font-normal text-[#6B7280]">(opcional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Añade un comentario a tu voto..."
                className="w-full rounded-lg border border-[#E4E9EF] bg-white px-3 py-2 font-inter text-[13px] text-[#0D1117] placeholder:text-[#6B7280] resize-none h-20 focus:outline-none focus:border-[#0D1117] transition-colors"
              />
            </div>

            {error && (
              <p className="font-inter text-[12px] text-red-500">
                {error?.response?.data?.message ||
                  error?.message ||
                  "Error al registrar el voto"}
              </p>
            )}

            {isPending ? (
              <div className="flex justify-center">
                <Spinner className="size-20" />
              </div>
            ) : (
              <Button
                isPrimary
                type="submit"
                disabled={!selectedOption || isPending}
                className="w-full"
              >
                Confirmar voto
              </Button>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
};

export default VoteModal;
