"use client";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import { useOgData } from "@/hooks/useOgData";

export default function NewsItem({ item }) {
  const { ogData, loading } = useOgData(item?.url);

  let hostname = "";
  try {
    hostname = new URL(item.url).hostname.replace("www.", "");
  } catch (_) {}

  const imageUrl = ogData?.image?.url;
  const description = ogData?.description;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col border border-[#E4E9EF] rounded-[8px] overflow-hidden hover:border-[#C6D2DF] hover:shadow-sm transition-all bg-white"
    >
      {/* OG image */}
      <div className="relative h-[90px] bg-[#F4F6F9] overflow-hidden shrink-0">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-[#E4E9EF]" />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            width={100}
            height={100}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="external-link" className="w-5 h-5 text-[#C6D2DF]" />
          </div>
        )}
        {/* Domain pill */}
        {hostname && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-full font-inter text-[10px] font-medium text-[#19363F] border border-[#E4E9EF]/60">
            {hostname}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-[#19363F] font-inter text-[12px] font-semibold leading-[16px] tracking-[-0.3px] line-clamp-2 group-hover:text-[#2D5FA8] transition-colors">
          {item.title}
        </p>
        {description && (
          <p className="text-[#8A9BB0] font-inter text-[11px] leading-[15px] line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Icon
            name="external-link"
            className="w-3 h-3 text-[#8A9BB0] shrink-0"
          />
          <span className="text-[#8A9BB0] font-inter text-[10px] truncate">
            Leer más
          </span>
        </div>
      </div>
    </a>
  );
}
