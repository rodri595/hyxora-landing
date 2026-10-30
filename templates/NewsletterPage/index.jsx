"use client";

import Layout from "@/components/Layout";
import { NEWSLETTER_ISSUES } from "@/constants/newsletter";

// UTC, because "2026-10-27" parses as UTC midnight and would read as the 26th
// anywhere west of Greenwich.
const formatIssueDate = (date) =>
  new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const NewsletterPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col pt-[150px] pb-[120px] max-md:pt-[110px] max-md:pb-[80px]"
    >
      <div className="mx-auto w-full max-w-[860px] px-8 max-md:px-4">
        <div className="flex flex-col items-center gap-7 text-center max-md:gap-5">
          <span className="flex items-center justify-center rounded-[32px] border-[0.7px] border-[rgba(25,54,63,0.04)] bg-[rgba(25,54,63,0.02)] px-3.5 py-2.5 font-inter font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
            Newsletter
          </span>
          <h1 className="max-w-[760px] font-inter font-medium text-[54px] text-[#19363f] leading-[1.05] tracking-[-2.16px] max-md:text-[32px] max-md:tracking-[-1.28px]">
            Los avances de Hyxora, cada semana
          </h1>
          <p className="max-w-[520px] font-inter font-normal text-[16px] text-[rgba(25,54,63,0.7)] leading-6 tracking-[-0.32px] max-md:text-[14px]">
            Un resumen en PDF de lo que hemos lanzado, lo que viene y en qué estamos trabajando.
          </p>
        </div>

        <div className="mt-16 max-md:mt-10">
          {NEWSLETTER_ISSUES.length === 0 ? (
            <p className="rounded-[20px] border border-[rgba(25,54,63,0.1)] bg-white p-8 text-center font-inter font-normal text-[14px] text-[rgba(25,54,63,0.7)] tracking-[-0.28px]">
              Muy pronto publicaremos la primera edición.
            </p>
          ) : (
            <div className="flex flex-col overflow-hidden rounded-[20px] border border-[rgba(25,54,63,0.1)] bg-white">
              {NEWSLETTER_ISSUES.map((issue) => (
                <a
                  key={issue.id}
                  href={issue.href}
                  download={`Hyxora ${issue.id}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 border-[rgba(25,54,63,0.08)] border-b p-5 transition-colors duration-300 last:border-b-0 hover:bg-[rgba(25,54,63,0.02)] max-sm:flex-col max-sm:items-start max-sm:gap-3"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.04)] font-inter font-medium text-[10px] text-[rgba(25,54,63,0.7)] tracking-[0.06em] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]">
                    PDF
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-inter font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px]">
                      {formatIssueDate(issue.date)}
                    </span>
                    <span className="font-inter font-medium text-[15px] text-[#19363f] tracking-[-0.3px]">
                      {issue.title}
                    </span>
                    {issue.summary && (
                      <span className="font-inter font-normal text-[13px] text-[rgba(25,54,63,0.7)] leading-5 tracking-[-0.26px]">
                        {issue.summary}
                      </span>
                    )}
                  </span>
                  <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-[rgba(25,54,63,0.15)] px-3.5 font-inter font-medium text-[13px] text-[#19363f] tracking-[-0.26px] transition-colors duration-300 group-hover:border-[rgba(25,54,63,0.35)] group-hover:bg-white">
                    Descargar
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewsletterPage;
