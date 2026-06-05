"use client";

import Layout from "@/components/Layout";
import Image from "@/components/Image";
import hyxoraLogo from "@/assets/imgs/brand/logo.svg";
import elefanteLogo from "@/assets/imgs/podcast/Logo fondo cuadrodo E Negro.png";

const CHANNEL_LOGOS = {
  hyxora: hyxoraLogo,
  elefante: elefanteLogo,
};

function getLogoSrc(logo) {
  if (!logo) return null;
  return typeof logo === "string" ? logo : logo.src;
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return "";
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return "Hoy";
  if (d === 1) return "Ayer";
  if (d < 7) return `Hace ${d} días`;
  if (d < 30) return `Hace ${Math.floor(d / 7)} sem.`;
  if (d < 365) return `Hace ${Math.floor(d / 30)} meses`;
  return `Hace ${Math.floor(d / 365)} año(s)`;
}

const YouTubeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022z"
      fill="#FF0000"
    />
    <path d="M10 15.5l6-3.5-6-3.5v7z" fill="#fff" />
  </svg>
);

const ExternalIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2 10L10 2M10 2H4M10 2V8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayIcon = () => (
  <svg
    width="10"
    height="12"
    viewBox="0 0 10 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M1 1l8 5.5L1 12V1z" fill="#000" />
  </svg>
);

const THEMES = {
  dark: {
    shadow: "border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)]",
    card: "border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30)]",
    logoBorder: "border-[rgba(255,255,255,0.12)]",
    ytLabel: "text-[rgba(255,255,255,0.35)]",
    badge:
      "bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.45)]",
    title: "text-white",
    description: "text-[rgba(255,255,255,0.55)]",
    btn: "bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.10)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.80)]",
    sectionLabel: "text-[rgba(255,255,255,0.30)]",
    videoTitle: "text-[rgba(255,255,255,0.72)]",
    videoDate: "text-[rgba(255,255,255,0.28)]",
    videoThumb: "bg-[rgba(255,255,255,0.04)]",
    emptyBox: "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.04)]",
    emptyText: "text-[rgba(255,255,255,0.22)]",
    playFill: "#fff",
  },
  light: {
    shadow: "border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)]",
    card: "border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)]",
    logoBorder: "border-[rgba(25,54,63,0.12)]",
    ytLabel: "text-[rgba(25,54,63,0.40)]",
    badge:
      "bg-[rgba(25,54,63,0.03)] border-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.50)]",
    title: "text-[#19363F]",
    description: "text-[rgba(25,54,63,0.65)]",
    btn: "bg-[rgba(25,54,63,0.04)] hover:bg-[rgba(25,54,63,0.08)] border-[rgba(25,54,63,0.08)] text-[rgba(25,54,63,0.80)]",
    sectionLabel: "text-[rgba(25,54,63,0.35)]",
    videoTitle: "text-[rgba(25,54,63,0.72)]",
    videoDate: "text-[rgba(25,54,63,0.38)]",
    videoThumb: "bg-[rgba(25,54,63,0.04)]",
    emptyBox: "bg-[rgba(25,54,63,0.02)] border-[rgba(25,54,63,0.04)]",
    emptyText: "text-[rgba(25,54,63,0.30)]",
    playFill: "#19363F",
  },
};

const PodcastPage = ({ channels = [] }) => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col gap-[130px] maxmd:gap-[80px] pt-[100px]"
    >
      {/* CHANNELS SECTION */}
      <section className="w-full flex justify-center px-4 pb-[60px]">
        <div className="flex flex-col gap-[50px] items-center w-full max-w-[1320px]">
          {/* Heading */}
          <div className="flex flex-col gap-[14px] items-center text-center">
            <h2 className="font-medium text-[40px] text-[#19363f] tracking-[-3.2px] leading-normal max-md:text-[26px] max-md:tracking-[-1.2px]">
              Nuestros Canales
            </h2>
            <p className="font-normal text-[16px] text-[rgba(25,54,63,0.65)] tracking-[-0.32px] max-md:text-[13px]">
              Suscríbete y no te pierdas ningún episodio
            </p>
          </div>

          {/* Individual channel cards */}
          <div className="flex gap-[24px] w-full max-md:flex-col max-md:gap-[48px] pb-[20px]">
            {channels.map((ch) => {
              const t = ch.id === "elefante" ? THEMES.light : THEMES.dark;
              return (
                <div key={ch.id} className="relative flex-1">
                  {/* shadow 2 */}
                  <div
                    className={`absolute w-[calc(100%-80px)] h-[calc(100%+32px)] top-[8px] left-[40px] rounded-[16px] border shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-sm:hidden ${t.shadow}`}
                  />
                  {/* shadow 1 */}
                  <div
                    className={`absolute w-[calc(100%-40px)] h-[calc(100%+16px)] top-[4px] left-[20px] rounded-[16px] border shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-sm:hidden ${t.shadow}`}
                  />
                  {/* Main card */}
                  <div
                    className={`relative flex flex-col rounded-[16px] border shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] ${t.card}`}
                  >
                    {/* Channel info */}
                    <div className="flex flex-col gap-[24px] p-[40px] max-md:p-[24px]">
                      <div className="flex items-center gap-[12px]">
                        <div
                          className={`w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0 border ${t.logoBorder} flex items-center justify-center`}
                        >
                          <Image
                            src={getLogoSrc(CHANNEL_LOGOS[ch.id])}
                            alt={ch.title}
                            width={100}
                            height={100}
                            className="size-[60px] object-cover object-center"
                          />
                        </div>
                        <div className="flex flex-col gap-[6px]">
                          <div className="flex items-center gap-[5px]">
                            <YouTubeIcon />
                            <span
                              className={`text-[11px] font-medium tracking-[0.5px] uppercase ${t.ytLabel}`}
                            >
                              YouTube
                            </span>
                          </div>
                          <span
                            className={`px-[8px] py-[3px] rounded-[32px] border text-[11px] font-medium tracking-[0.5px] uppercase w-fit ${t.badge}`}
                          >
                            {ch.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-[10px]">
                        <h3
                          className={`font-medium text-[22px] tracking-[-0.88px] leading-[28px] ${t.title}`}
                        >
                          {ch.title}
                        </h3>
                        <p
                          className={`text-[14px] leading-[22px] tracking-[-0.28px] ${t.description}`}
                        >
                          {ch.description}
                        </p>
                      </div>

                      <a
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-[6px] w-fit px-[14px] py-[9px] rounded-[8px] transition-colors border text-[13px] font-medium tracking-[-0.26px] ${t.btn}`}
                      >
                        Explorar Formato
                        <ExternalIcon />
                      </a>
                    </div>

                    {/* Videos */}
                    <div className="flex flex-col gap-[14px] p-[40px] max-md:p-[24px] mt-auto">
                      <p
                        className={`text-[11px] font-medium tracking-[0.5px] uppercase ${t.sectionLabel}`}
                      >
                        Últimos videos
                      </p>

                      {ch.videos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-[10px] max-sm:grid-cols-2">
                          {ch.videos.map((video) => (
                            <a
                              key={video.videoId}
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col gap-[7px]"
                            >
                              <div
                                className={`relative w-full aspect-video rounded-[8px] overflow-hidden ${t.videoThumb}`}
                              >
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[rgba(0,0,0,0.35)]">
                                  <div className="w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center">
                                    <PlayIcon />
                                  </div>
                                </div>
                              </div>
                              <p
                                className={`text-[11px] leading-[15px] tracking-[-0.22px] line-clamp-2 ${t.videoTitle}`}
                              >
                                {video.title}
                              </p>
                              {video.published && (
                                <p className={`text-[10px] ${t.videoDate}`}>
                                  {formatRelativeDate(video.published)}
                                </p>
                              )}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`py-[24px] flex items-center justify-center rounded-[8px] border ${t.emptyBox}`}
                        >
                          <p className={`text-[12px] ${t.emptyText}`}>
                            Videos próximamente
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PodcastPage;
