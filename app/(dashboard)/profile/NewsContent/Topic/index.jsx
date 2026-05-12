import { useMemo } from "react";
import Icon from "@/components/Icon";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Abierta",
    className: "bg-[#E6F7EE] text-[#1A7A45] border-[#B3E6CB]",
  },
  CLOSED: {
    label: "Cerrada",
    className: "bg-[#F4F6F9] text-[#8A9BB0] border-[#E4E9EF]",
  },
  UPCOMING: {
    label: "Próximamente",
    className: "bg-[#EAF0FB] text-[#2D5FA8] border-[#C3D4F0]",
  },
};

export default function Topic({ poll }) {
  const { data: userInfo_data } = useGetUserInformation();

  const hasVoted = useMemo(() => {
    if (poll?.votes && userInfo_data?.information?._id) {
      return poll.votes.some(
        (vote) => vote?.user === userInfo_data?.information?._id,
      );
    }
    return false;
  }, [userInfo_data, poll]);

  const statusConfig = STATUS_CONFIG[poll?.status] ?? STATUS_CONFIG.ACTIVE;

  return (
    <div className="bg-white border border-[#E4E9EF] rounded-[8px] overflow-hidden hover:shadow-sm transition-shadow shrink-0 cursor-pointer flex flex-col gap-2 p-3">
      <div className="w-full flex justify-between items-center flex-wrap gap-1">
        <span className="px-2 py-0.5 bg-[#EAF0FB] text-[#2D5FA8] font-semibold font-inter text-[11px] rounded ">
          #{poll?.number}
        </span>
        <div className="flex items-center gap-1 shrink-0 ">
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
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-inter border ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-start items-start w-full shrink-1  overflow-hidden">
        <h3 className="text-[13px] font-semibold font-inter text-[#19363F]  leading-tight tracking-[-0.3px] line-clamp-1 max-sm:w-full">
          {poll?.title}
        </h3>
        <p className="text-[#8A9BB0] font-inter text-[11px] mt-0.5 line-clamp-1 leading-[16px] max-sm:w-full">
          {poll?.description}
        </p>
      </div>
    </div>
  );
}
