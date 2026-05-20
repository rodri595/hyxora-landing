"use client";

import Layout from "@/components/Layout";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import chevronSVG from "@/assets/imgs/icons/chevron.svg";
import Link from "next/link";

const socialLinks = [
  { label: "YouTube", href: "https://www.youtube.com/@hyxora" },
];

const PodcastPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col gap-[130px] maxmd:gap-[80px] pt-[100px]"
    >
      <section className="w-full flex justify-center px-4 max-md:mb-[100px]">
        <div className="flex flex-col gap-[50px] items-center w-full max-w-[886px]">
          {/* TITLE */}
          <div className="flex flex-col gap-7 items-center justify-center relative w-full max-md:gap-[16px]">
            {/* Podcast Badge */}
            <a
              target="_blank"
              href="https://www.youtube.com/@hyxora"
              rel="noopener noreferrer"
              className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex gap-[10px] items-center pr-[12px] pl-0 py-0 relative rounded-[32px]"
              style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
            >
              <div className="bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-[30px] relative rounded-[100px]">
                <div className="flex gap-[3px] h-[30px] items-center justify-center overflow-hidden p-[8px] relative rounded-[inherit]">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Podcast Icon"
                  >
                    <path
                      d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"
                      fill="white"
                    />
                    <path
                      d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="font-medium text-[12px] text-[#f7f8f8] tracking-[-0.48px] whitespace-nowrap">
                    Podcast
                  </p>
                </div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                  }}
                />
              </div>
              <p className="font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] whitespace-nowrap max-md:tracking-[-0.24px] max-md:leading-[20px]">
                ¡Nuevo episodio disponible!
              </p>
              <Image
                src={chevronSVG}
                alt="Chevron Icon"
                className="relative w-[12px] h-[12px]"
              />
            </a>
            {/* Main Heading */}
            <h1 className="font-medium text-[50px] text-[#19363f] text-center tracking-[-4.16px] leading-[normal] max-md:text-[28px] max-md:tracking-[-1.12px]">
              Tu dinero. Tu educación.
            </h1>
            {/* Description */}
            <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] text-center tracking-[-0.32px] max-md:text-[12px] max-md:tracking-[-0.24px] max-md:leading-[20px]">
              Descubre quien hay detrás de Hyxora y toma el control de tu
              economía.
            </p>
          </div>
          {/* CONTENT */}
          <div className="relative max-w-[886px] mx-auto w-full flex">
            {/* shadow 2 */}
            <div className="absolute w-[calc(100%-160px)] h-[calc(100%+32px)] top-[8px] left-[80px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-sm:hidden" />
            {/* shadow 1 */}
            <div className="absolute w-[calc(100%-80px)] h-[calc(100%+16px)] top-[4px] left-[40px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-sm:hidden" />
            {/* CONTAINER */}
            <div className="flex p-[40px] items-center h-full gap-[20px] w-full flex-1 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-md:flex-col-reverse max-md:gap-[30px] max-md:p-[24px]">
              {/* LEFT */}
              <div className="flex flex-col items-start gap-[32px] w-[447px] max-md:w-full flex-1 h-full">
                <div className="flex flex-col w-full gap-[20px] items-start">
                  {/* Badge */}
                  <div className="bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.06)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
                    <p className="font-medium text-[12px] text-[rgba(255,255,255,0.70)] tracking-[-0.48px] leading-[9px]">
                      Podcast
                    </p>
                  </div>
                  {/* title */}
                  <h3 className="text-white leading-[40px] tracking-[-1.28px] font-inter text-[32px] max-sm:text-[22px] max-sm:leading-[28px] font-medium">
                    Aprende sobre DeFi con Hyxora
                  </h3>
                  <span className="text-[rgba(255,255,255,0.70)] font-inter text-[16px] max-sm:text-[14px] font-normal leading-[24px] tracking-[-0.32px]">
                    Síguenos en tu plataforma favorita y no te pierdas ningún
                    episodio. Conversaciones, análisis y todo lo que necesitas
                    saber sobre las finanzas descentralizadas.
                  </span>
                </div>

                <div className="flex flex-col gap-[16px] items-start self-stretch w-full">
                  <a
                    href="https://www.youtube.com/@hyxora"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button isPrimary type="button">
                      Escuchar ahora
                    </Button>
                  </a>
                  {/* Social links */}
                  <div className="flex flex-col gap-[10px] w-full">
                    <p className="text-[rgba(255,255,255,0.40)] font-inter text-[11px] font-medium tracking-[0.5px] uppercase">
                      Hyxora
                    </p>
                    <div className="flex flex-wrap gap-[8px]">
                      {socialLinks.map(({ label, href }) => (
                        <Link
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-[6px] px-[10px] py-[7px] rounded-[8px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.10)] transition-colors"
                        >
                          <Icon
                            name="external-link"
                            className="size-[12px]"
                            fill="rgba(255,255,255,0.5)"
                          />
                          <span className="text-[rgba(255,255,255,0.70)] font-inter text-[12px] font-normal tracking-[-0.24px]">
                            {label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT EPISODES / VISITORS SECTION */}
      <section className="w-full px-4 pb-[80px]">
        <div className="flex flex-col gap-[40px] w-full max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-[8px]">
            <h2 className="font-medium text-[32px] text-[#19363f] tracking-[-1.28px] leading-[normal] max-md:text-[24px] max-md:tracking-[-0.96px]">
              Experiencias en primera persona
            </h2>
            <p className="font-normal text-[16px] text-[rgba(25,54,63,0.55)] tracking-[-0.32px] max-md:text-[14px]">
              Descubre los testimonios de las personas que han asistido como
              invitados.
            </p>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center gap-[16px] py-[80px] rounded-[16px] border border-dashed border-[rgba(25,54,63,0.12)] bg-[rgba(25,54,63,0.02)]">
            <div className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[rgba(25,54,63,0.06)]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"
                  fill="rgba(25,54,63,0.3)"
                />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
                  stroke="rgba(25,54,63,0.3)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-[4px]">
              <p className="font-medium text-[15px] text-[rgba(25,54,63,0.55)] tracking-[-0.3px]">
                Próximamente
              </p>
              <p className="font-normal text-[13px] text-[rgba(25,54,63,0.35)] tracking-[-0.26px] text-center max-w-[280px]">
                Los episodios con invitados aparecerán aquí cuando estén
                disponibles.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* FORMATS SECTION */}
      <section className="w-full px-4">
        <div className="flex flex-col gap-[40px] w-full max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-[8px]">
            <h2 className="font-medium text-[32px] text-[#19363f] tracking-[-1.28px] leading-[normal] max-md:text-[24px] max-md:tracking-[-0.96px]">
              Nuestros formatos
            </h2>
            <p className="font-normal text-[16px] text-[rgba(25,54,63,0.55)] tracking-[-0.32px] max-md:text-[14px]">
              Dos espacios distintos para entender el dinero y el ecosistema
              financiero.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-[16px] max-md:grid-cols-1">
            {/* LEFT CARD — Detrás de Hyxora */}
            <div className="relative flex flex-col justify-between gap-[40px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30)] p-[40px] overflow-hidden max-md:p-[28px]">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] px-[14px] py-[8px] rounded-[32px]">
                  <p className="font-medium text-[11px] text-[rgba(255,255,255,0.7)] tracking-[0.6px] uppercase">
                    Inside Format
                  </p>
                </div>
                <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[8px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14M3 21h18M3 21H1m20 0h2M9 21v-6h6v6"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 11H7m10 0h-4M9 7H7m10 0h-4"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom content */}
              <div className="flex flex-col gap-[20px]">
                <div className="flex flex-col gap-[14px]">
                  <h3 className="font-medium text-[36px] text-white leading-[1.1] tracking-[-1.44px] max-md:text-[28px] max-md:tracking-[-1.12px]">
                    Detrás de Hyxora
                  </h3>
                  <p className="font-normal text-[15px] text-[rgba(255,255,255,0.60)] leading-[24px] tracking-[-0.3px]">
                    Entrevistas exclusivas a los founders y CEOs. Descubre de
                    primera mano los retos, la visión y la realidad de construir
                    un banco desde cero.
                  </p>
                </div>
                <a
                  href="https://www.youtube.com/@hyxora"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[10px] group w-fit"
                >
                  <span className="font-medium text-[14px] text-white tracking-[-0.28px]">
                    Explorar formato
                  </span>
                  <div className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-[rgba(255,255,255,0.1)] group-hover:bg-[rgba(255,255,255,0.18)] transition-colors">
                    <Icon
                      name="arrow"
                      className="size-[12px]"
                      fill="rgba(255,255,255,0.9)"
                    />
                  </div>
                </a>
              </div>
            </div>

            {/* RIGHT CARD — El elefante desnudo */}
            <div className="relative flex flex-col justify-between gap-[40px] rounded-[16px] border-[2px] border-[#19363f] bg-white p-[40px] overflow-hidden max-md:p-[28px]">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="bg-transparent border border-[rgba(25,54,63,0.2)] px-[14px] py-[8px] rounded-[32px]">
                  <p className="font-medium text-[11px] text-[rgba(25,54,63,0.6)] tracking-[0.6px] uppercase">
                    Debate Sin Filtros
                  </p>
                </div>
                <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[8px] border border-[rgba(25,54,63,0.12)] bg-[rgba(25,54,63,0.04)]">
                  <Icon
                    name="eye"
                    className="size-[18px]"
                    fill="rgba(25,54,63,0.45)"
                  />
                </div>
              </div>

              {/* Bottom content */}
              <div className="flex flex-col gap-[20px]">
                <div className="flex flex-col gap-[14px]">
                  <h3 className="font-medium text-[36px] text-[#19363f] leading-[1.1] tracking-[-1.44px] max-md:text-[28px] max-md:tracking-[-1.12px]">
                    El elefante desnudo
                  </h3>
                  <p className="font-normal text-[15px] text-[rgba(25,54,63,0.60)] leading-[24px] tracking-[-0.3px]">
                    Lo que todos ven, lo que nadie dice. Llevamos a expertos a
                    la mesa para hablar de ese gran &quot;elefante en la
                    habitación&quot; del que nadie se atreve a decir nada.
                    Análisis directo y sin censura.
                  </p>
                </div>
                <a
                  href="https://www.youtube.com/@hyxora"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[10px] group w-fit"
                >
                  <span className="font-medium text-[12px] text-[#19363f] tracking-[0.3px] uppercase">
                    Explorar formato
                  </span>
                  <div className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-[rgba(25,54,63,0.08)] group-hover:bg-[rgba(25,54,63,0.14)] transition-colors">
                    <Icon
                      name="arrow"
                      className="size-[12px]"
                      fill="rgba(25,54,63,0.8)"
                    />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PodcastPage;
