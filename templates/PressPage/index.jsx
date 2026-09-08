"use client";

import Button from "@/components/Button";
import Image from "@/components/Image";
import Layout from "@/components/Layout";
import SectionRail from "@/components/SectionRail";
import {
  PRESS_COLORS,
  PRESS_DOCUMENTS,
  PRESS_EMAIL,
  PRESS_GUIDELINES,
  PRESS_KIT_ZIP,
  PRESS_LOGOS,
  PRESS_SCREENSHOTS,
  PRESS_SECTIONS,
  PRESS_SPOKESPEOPLE,
} from "@/constants/press";
import { cn, copyToClipboard } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import Section from "./Section";

gsap.registerPlugin(SplitText);

const TOTAL = PRESS_SECTIONS.length;

// One source for a section's id, its number and the label the floating rail
// shows — so reordering PRESS_SECTIONS reorders everything at once.
const sectionProps = (id) => {
  const index = PRESS_SECTIONS.findIndex((section) => section.id === id);
  return { id, rail: PRESS_SECTIONS[index].label, index: index + 1, total: TOTAL };
};

// A download link, not a router link: `download` keeps the browser from
// opening the SVG or the PDF in a tab instead of saving it.
const DownloadLink = ({ href, children, className }) => (
  <a
    href={href}
    download
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-full border border-[rgba(25,54,63,0.15)] bg-white px-3.5 font-inter font-medium text-[13px] text-[#19363f] tracking-[-0.26px] transition-colors duration-300 hover:border-[rgba(25,54,63,0.35)] hover:bg-[rgba(25,54,63,0.03)]",
      className
    )}
  >
    {children}
  </a>
);

const LOGO_TONES = {
  light: "bg-[#FDFDFD]",
  dark: "bg-[#19363f]",
  solid: "bg-[#2D68FF]",
  // Checkerboard, so «fondo transparente» is something you can see rather than
  // something the caption claims.
  grid: "bg-[#FDFDFD] bg-[length:16px_16px] bg-[linear-gradient(45deg,rgba(25,54,63,0.05)_25%,transparent_25%,transparent_75%,rgba(25,54,63,0.05)_75%),linear-gradient(45deg,rgba(25,54,63,0.05)_25%,transparent_25%,transparent_75%,rgba(25,54,63,0.05)_75%)] bg-[position:0_0,8px_8px]",
};

const LogoCard = ({ logo }) => (
  <div
    data-reveal
    className="flex flex-col overflow-hidden rounded-[20px] border border-[rgba(25,54,63,0.1)] bg-white"
  >
    <div className={cn("flex items-center justify-center px-8 py-12", LOGO_TONES[logo.tone])}>
      <img src={logo.src} alt={`Hyxora — ${logo.name}`} className="h-[88px] w-[88px]" />
    </div>
    <div className="flex flex-1 flex-col gap-4 border-[rgba(25,54,63,0.1)] border-t p-5">
      <div className="flex flex-col gap-1.5">
        <p className="font-inter font-medium text-[15px] text-[#19363f] tracking-[-0.3px]">
          {logo.name}
        </p>
        <p className="font-inter font-normal text-[13px] text-[rgba(25,54,63,0.65)] leading-5 tracking-[-0.26px]">
          {logo.description}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {logo.files.map((file) => (
          <DownloadLink key={file.href} href={file.href}>
            {file.label}
          </DownloadLink>
        ))}
      </div>
    </div>
  </div>
);

const ColorSwatch = ({ color }) => (
  <button
    data-reveal
    type="button"
    onClick={() => copyToClipboard(color.hex)}
    title={`Copiar ${color.hex}`}
    className="group flex flex-col overflow-hidden rounded-[20px] border border-[rgba(25,54,63,0.1)] bg-white text-left transition-colors duration-300 hover:border-[rgba(25,54,63,0.28)]"
  >
    <span
      className="block h-[92px] w-full border-[rgba(25,54,63,0.06)] border-b"
      style={{ backgroundColor: color.hex }}
    />
    <span className="flex flex-col gap-1 p-4">
      <span className="flex items-center gap-2">
        <span className="font-inter font-medium text-[14px] text-[#19363f] tracking-[-0.28px]">
          {color.name}
        </span>
        <span className="font-inter font-medium text-[11px] text-[rgba(25,54,63,0.4)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Copiar
        </span>
      </span>
      <span className="font-inter font-medium text-[13px] text-[rgba(25,54,63,0.7)] tabular-nums tracking-[-0.26px]">
        {color.hex}
      </span>
      <span className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.5)] leading-4 tracking-[-0.24px]">
        {color.usage}
      </span>
    </span>
  </button>
);

const PressPage = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-hero-badge]", { y: 14, autoAlpha: 0, duration: 0.6 });

        // autoSplit re-splits if the webfont lands after the first paint, so
        // the mask never keeps half a line hidden.
        const split = SplitText.create(titleRef.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration: 1,
              stagger: 0.1,
              ease: "expo.out",
              delay: 0.15,
            }),
        });

        tl.from("[data-hero-copy]", { y: 18, autoAlpha: 0, duration: 0.8 }, 0.45);
        tl.from("[data-hero-action]", { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.6);

        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: heroRef }
  );

  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col pt-[150px] pb-[120px] max-md:pt-[110px] max-md:pb-[80px]"
    >
      <div className="mx-auto w-full max-w-[1160px] px-8 max-md:px-4">
        {/* Hero */}
        <div ref={heroRef} className="flex flex-col items-center gap-7 text-center max-md:gap-5">
          <span
            data-hero-badge
            className="flex items-center justify-center rounded-[32px] border-[0.7px] border-[rgba(25,54,63,0.04)] bg-[rgba(25,54,63,0.02)] px-3.5 py-2.5 font-inter font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]"
          >
            Sala de prensa
          </span>
          <h1
            ref={titleRef}
            className="max-w-[760px] font-inter font-medium text-[54px] text-[#19363f] leading-[1.05] tracking-[-2.16px] max-md:text-[32px] max-md:tracking-[-1.28px]"
          >
            Recursos oficiales para medios y partners
          </h1>
          <p
            data-hero-copy
            className="max-w-[520px] font-inter font-normal text-[16px] text-[rgba(25,54,63,0.7)] leading-6 tracking-[-0.32px] max-md:text-[14px]"
          >
            Logotipos, material gráfico de la app y documentación oficial de Hyxora, listos para
            usar en artículos, vídeos y colaboraciones.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div data-hero-action>
              <Button isPrimary as="a" href={PRESS_KIT_ZIP} download>
                Descargar kit completo (.ZIP)
              </Button>
            </div>
            <div data-hero-action>
              <Button isSecondary as="a" href={`mailto:${PRESS_EMAIL}`}>
                Escribir a prensa
              </Button>
            </div>
          </div>
        </div>

        {/* Sections. The floating rail reads them from the DOM, so the only
            thing this column owns is the content. */}
        <div className="mt-20 max-md:mt-12">
          <div className="flex min-w-0 flex-col gap-14 max-md:gap-10">
            {/* 01 — Logotipos */}
            <Section
              {...sectionProps("logos")}
              title="Logotipos y marca"
              description="Isotipo de Hyxora en SVG y PNG, en sus cuatro versiones. Descarga siempre el archivo original en lugar de recortarlo de una captura."
              action={
                <DownloadLink href={PRESS_KIT_ZIP} className="h-[38px] px-5 text-[14px]">
                  Descargar todos los logos
                </DownloadLink>
              }
            >
              <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
                {PRESS_LOGOS.map((logo) => (
                  <LogoCard key={logo.id} logo={logo} />
                ))}
              </div>
            </Section>

            {/* 02 — Color */}
            <Section
              {...sectionProps("color")}
              title="Paleta de color"
              description="Los colores oficiales de la marca. Haz clic en cualquiera para copiar su código."
            >
              <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {PRESS_COLORS.map((color) => (
                  <ColorSwatch key={color.hex} color={color} />
                ))}
              </div>
            </Section>

            {/* 03 — App */}
            <Section
              {...sectionProps("app")}
              title="Material gráfico de la app"
              description="Capturas limpias de la aplicación, en alta resolución y sin datos reales de usuarios."
            >
              <div className="flex flex-wrap gap-5">
                {PRESS_SCREENSHOTS.map((shot) => (
                  // The renders are 1075×2699, so a full-width card on a phone
                  // is ~900px tall. Two up keeps the whole screenshot visible
                  // without cropping an asset preview.
                  <div
                    key={shot.id}
                    data-reveal
                    className="flex w-[228px] flex-col gap-4 max-sm:w-[calc(50%-10px)]"
                  >
                    <div className="overflow-hidden rounded-[24px] border border-[rgba(25,54,63,0.1)] bg-[rgba(25,54,63,0.03)]">
                      <img
                        src={shot.src}
                        alt={`Hyxora app — ${shot.caption}`}
                        className="aspect-[1075/2699] w-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="font-inter font-medium text-[14px] text-[#19363f] tracking-[-0.28px]">
                        {shot.caption}
                      </p>
                      <p className="font-inter font-normal text-[13px] text-[rgba(25,54,63,0.65)] leading-5 tracking-[-0.26px]">
                        {shot.description}
                      </p>
                      <DownloadLink href={shot.src} className="mt-1 self-start">
                        PNG
                      </DownloadLink>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 04 — Documentos */}
            <Section
              {...sectionProps("documentos")}
              title="Documentos"
              description="Documentación oficial que puedes citar directamente."
            >
              <div className="flex flex-col overflow-hidden rounded-[20px] border border-[rgba(25,54,63,0.1)] bg-white">
                {PRESS_DOCUMENTS.map((doc) => (
                  <a
                    key={doc.id}
                    data-reveal
                    href={doc.href}
                    download
                    className="group flex items-center gap-5 border-[rgba(25,54,63,0.08)] border-b p-5 transition-colors duration-300 last:border-b-0 hover:bg-[rgba(25,54,63,0.02)] max-sm:flex-col max-sm:items-start max-sm:gap-3"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.04)] font-inter font-medium text-[10px] text-[rgba(25,54,63,0.7)] tracking-[0.06em] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]">
                      PDF
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-inter font-medium text-[15px] text-[#19363f] tracking-[-0.3px]">
                        {doc.name}
                      </span>
                      <span className="font-inter font-normal text-[13px] text-[rgba(25,54,63,0.65)] leading-5 tracking-[-0.26px]">
                        {doc.description}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.45)] tracking-[-0.24px]">
                        {doc.meta}
                      </span>
                      <span className="inline-flex h-8 items-center rounded-full border border-[rgba(25,54,63,0.15)] px-3.5 font-inter font-medium text-[13px] text-[#19363f] tracking-[-0.26px] transition-colors duration-300 group-hover:border-[rgba(25,54,63,0.35)] group-hover:bg-white">
                        Descargar
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </Section>

            {/* 05 — Portavoces */}
            <Section
              {...sectionProps("portavoces")}
              title="Portavoces"
              description="Quién habla de qué, para que la entrevista llegue a la persona correcta."
            >
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                {PRESS_SPOKESPEOPLE.map((person) => (
                  <div
                    key={person.id}
                    data-reveal
                    className="flex gap-4 rounded-[20px] border border-[rgba(25,54,63,0.1)] bg-white p-5"
                  >
                    {/* The portraits are half-body shots with the face in the
                        upper third, so they crop from the top — centred would
                        cut the head off at this size. */}
                    {person.photo ? (
                      <div className="h-[104px] w-[84px] shrink-0 overflow-hidden rounded-[16px] bg-[rgba(25,54,63,0.04)]">
                        <Image
                          src={person.photo}
                          alt={`${person.name}, ${person.role} de Hyxora`}
                          className="h-full w-full object-cover object-top"
                          sizes="84px"
                        />
                      </div>
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#19363f] font-inter font-medium text-[15px] text-white tracking-[-0.3px]">
                        {person.initials}
                      </span>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <p className="font-inter font-medium text-[16px] text-[#19363f] tracking-[-0.32px]">
                        {person.name}
                      </p>
                      <p className="font-inter font-medium text-[13px] text-[rgba(25,54,63,0.5)] tracking-[-0.26px]">
                        {person.role}
                      </p>
                      <p className="mt-1 font-inter font-normal text-[13px] text-[rgba(25,54,63,0.7)] leading-5 tracking-[-0.26px]">
                        {person.topics}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p
                data-reveal
                className="mt-5 font-inter font-normal text-[13px] text-[rgba(25,54,63,0.6)] leading-5 tracking-[-0.26px]"
              >
                Para solicitar una entrevista, escríbenos a{" "}
                <a
                  href={`mailto:${PRESS_EMAIL}`}
                  className="font-medium text-[#19363f] underline underline-offset-2"
                >
                  {PRESS_EMAIL}
                </a>{" "}
                indicando medio, formato y fechas.
              </p>
            </Section>

            {/* 06 — Uso de marca */}
            <Section
              {...sectionProps("uso")}
              title="Uso de marca"
              description="Cuatro reglas a cada lado. Si tu caso no encaja en ninguna, escríbenos antes de publicar."
            >
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <div
                  data-reveal
                  className="flex flex-col gap-4 rounded-[20px] border border-[rgba(0,166,86,0.25)] bg-[rgba(0,166,86,0.03)] p-6"
                >
                  <p className="font-inter font-medium text-[14px] text-[#00a656] tracking-[-0.28px]">
                    Sí
                  </p>
                  <ul className="flex flex-col gap-3">
                    {PRESS_GUIDELINES.do.map((rule) => (
                      <li
                        key={rule}
                        className="font-inter font-normal text-[14px] text-[rgba(25,54,63,0.8)] leading-[22px] tracking-[-0.28px]"
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  data-reveal
                  className="flex flex-col gap-4 rounded-[20px] border border-[rgba(255,56,28,0.22)] bg-[rgba(255,56,28,0.03)] p-6"
                >
                  <p className="font-inter font-medium text-[14px] text-[#ff381c] tracking-[-0.28px]">
                    No
                  </p>
                  <ul className="flex flex-col gap-3">
                    {PRESS_GUIDELINES.dont.map((rule) => (
                      <li
                        key={rule}
                        className="font-inter font-normal text-[14px] text-[rgba(25,54,63,0.8)] leading-[22px] tracking-[-0.28px]"
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>

      <SectionRail />
    </Layout>
  );
};

export default PressPage;
