const Info = () => {
  const leftSectionData = {
    title: "Crea tu IBAN, tarjetas",
    subtitle: "y maneja tu Wallet desde tu app",
    description:
      "Opera desde tu app y tarjeta de forma habitual y maneja desde un mismo dispositivo todos tus activos",
    steps: [
      {
        title: "IBAN Europeo",
        description:
          "Tu cuenta en euros para tu día a día. Paga en comercios, añade suscripciones, haz trasferencias, etc.",
      },
      {
        title: "Wallet autocustodiada",
        description:
          "Guarda y gestiona tus activos digitales con total seguridad Maneja desde el dispositivo cambios, compras, ventas.. sin intermediarios",
      },
      {
        title: "Tarjeta de débito",
        description:
          "Dispon de tus activos cuando desees desde tu tarjeta bancaria Hyxora Pagos, retiradas de efectivo en cajeros.",
      },
      {
        title: "Transferencias internacionales sin coste",
        description:
          "Transfiere fondos a cualquier otro usuario del Hyxora en segundos, sin costes",
      },
      {
        title: "Servicios de calidad a costes mínimos",
        description:
          "Dispón de todos los servicios a costes muy reducidos Contrata el plan que más te convenga y modificalo sin compromisos.",
      },
    ],
  };

  const rightSectionData = {
    title: "Conoce las oportunidades",
    subtitle: "del mercado descentralizado (DeFi)",
    description:
      "No te quedes fuera de las oportunidades que ofrece DeFi por desconocimiento o miedos",
    steps: [
      {
        title: "Ingresos pasivos y Staking",
        description:
          "Genera ingresos pasivos por ello Que el dinero trabaje por ti",
      },
      {
        title: "Oportunidades de inversión DEFI",
        description:
          "Invierte en Fondos Indexados mixtos, pools de liquidez y otros Paga en comercios, añade suscripciones, haz trasferencias, etc.",
      },
      {
        title: "Comité Consultivo",
        description:
          "Hyxora se basa en la comunidad y escucha al usuario Participa activamente de las decisiones a tomar en Hyxora.",
      },
      {
        title: "Founder de Hyxora",
        description:
          "Al hacerte Founder, adquieres un % del Equity de Hyxora. Además de los propios privilegios de ser Founder, serás co-propietario de Hyxora. Date prisa, sólo habrá 1000 Foudners.",
      },
      {
        title: "Academia Hyxora",
        description:
          "No eres experto, precisamente por eso se nace Hyxora Videos, Faqs, blog, iA, Podcast, todo serán canales de información a tu servicio para que comprendas y aprendas desde cero todo lo que necesites",
      },
    ],
  };

  return (
    <section className="flex w-full">
      <div className="max-w-[1240px] mx-auto w-full  max-xl:px-[32px] max-md:px-[16px]">
        {/* Headers Row */}
        <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-[102px] max-lg:gap-[32px] mb-[50px] max-lg:mb-[24px] items-start ">
          {/* Left Header */}
          <div className="flex flex-col gap-7 max-lg:gap-[16px] items-start w-full h-full justify-between">
            <h2 className="font-medium text-[36px] leading-[40px] tracking-[-0.04em] w-full min-h-[80px] max-lg:text-[20px] max-lg:leading-normal max-lg:tracking-[-0.8px] max-lg:min-h-0">
              <span className="text-[rgba(25,54,63,0.6)]">
                {leftSectionData.title} {/* <br /> */}
              </span>
              <span className="text-[#19363f]">{leftSectionData.subtitle}</span>
            </h2>
            <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full max-lg:text-[12px] max-lg:leading-[20px] max-lg:tracking-[-0.24px]">
              {leftSectionData.description}
            </p>
          </div>
          {/* Right Header */}
          <div className="flex flex-col gap-7 max-lg:gap-[16px] items-start w-full h-full justify-between max-lg:hidden">
            <h2 className="font-medium text-[36px] leading-[40px] tracking-[-0.04em] w-full min-h-[80px] max-lg:text-[20px] max-lg:leading-normal max-lg:tracking-[-0.8px] max-lg:min-h-0">
              <span className="text-[rgba(25,54,63,0.6)]">
                {rightSectionData.title} {/* <br /> */}
              </span>
              <span className="text-[#19363f]">
                {rightSectionData.subtitle}
              </span>
            </h2>
            <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full max-lg:text-[12px] max-lg:leading-[20px] max-lg:tracking-[-0.24px]">
              {rightSectionData.description}
            </p>
          </div>
        </div>
        {/* Steps Grid - Desktop: Two columns aligned, Mobile: Single column sequential */}
        <div className="flex flex-col gap-11 max-lg:hidden">
          {leftSectionData.steps.map((leftStep, index) => {
            const rightStep = rightSectionData.steps[index];
            const stepNumber = String(index + 1).padStart(2, "0");
            const isActive = true;

            return (
              <div key={index} className="grid grid-cols-2 gap-[102px]">
                {/* Left Step */}
                <div className="flex gap-[18px] items-start w-full">
                  {isActive ? (
                    <div
                      className="bg-[#19363f] border border-[rgba(255,255,255,0.2)] flex items-center justify-center px-[14px] py-2 rounded-full w-[30px] h-[30px] shrink-0 relative overflow-hidden"
                      style={{
                        boxShadow:
                          "0px 6px 4px -4px rgba(25,54,63,0.15), 0px 12px 8px -4px rgba(25,54,63,0.15)",
                      }}
                    >
                      <p className="font-medium text-xs text-white tracking-[-0.04em]">
                        {stepNumber}
                      </p>
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow:
                            "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em] whitespace-nowrap">
                        {stepNumber}
                      </p>
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow:
                            "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                        }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-[14px] items-start flex-1 min-w-0">
                    <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                      {leftStep.title}
                    </p>
                    <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                      {leftStep.description}
                    </p>
                  </div>
                </div>

                {/* Right Step */}
                <div className="flex gap-[18px] items-start w-full">
                  {isActive ? (
                    <div
                      className="bg-[#19363f] border border-[rgba(255,255,255,0.2)] flex items-center justify-center px-[14px] py-2 rounded-full w-[30px] h-[30px] shrink-0 relative overflow-hidden"
                      style={{
                        boxShadow:
                          "0px 6px 4px -4px rgba(25,54,63,0.15), 0px 12px 8px -4px rgba(25,54,63,0.15)",
                      }}
                    >
                      <p className="font-medium text-xs text-white tracking-[-0.04em]">
                        {stepNumber}
                      </p>
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow:
                            "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em] whitespace-nowrap">
                        {stepNumber}
                      </p>
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow:
                            "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                        }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-[14px] items-start flex-1 min-w-0">
                    <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                      {rightStep.title}
                    </p>
                    <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                      {rightStep.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Steps - Sequential order */}
        <div className="hidden max-lg:flex flex-col gap-6 mb-[24px] ">
          {[...leftSectionData.steps].map((step, index) => {
            const stepNumber = String(index + 1).padStart(2, "0");
            const isActive = true;

            return (
              <div key={index} className="flex gap-[18px] items-start w-full">
                {isActive ? (
                  <div
                    className="bg-[#19363f] border border-[rgba(255,255,255,0.2)] flex items-center justify-center px-[14px] py-2 rounded-full w-[30px] h-[30px] shrink-0 relative overflow-hidden"
                    style={{
                      boxShadow:
                        "0px 6px 4px -4px rgba(25,54,63,0.15), 0px 12px 8px -4px rgba(25,54,63,0.15)",
                    }}
                  >
                    <p className="font-medium text-[12px] text-white tracking-[-0.48px]">
                      {stepNumber}
                    </p>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow:
                          "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                    <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-[12px] text-[#19363f] tracking-[-0.48px] whitespace-nowrap">
                      {stepNumber}
                    </p>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-[14px] items-start flex-1 min-w-0">
                  <p className="font-medium text-[14px] leading-[22px] text-[#19363f] tracking-[-0.56px] w-full">
                    {step.title}
                  </p>
                  <p className="font-normal text-[12px] leading-[20px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] w-full max-lg:hidden">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Right Header */}
        <div className="flex flex-col gap-7 max-lg:gap-[16px] items-start w-full mb-[24px]  justify-between hidden max-lg:flex">
          <h2 className="font-medium text-[36px] leading-[40px] tracking-[-0.04em] w-full min-h-[80px] max-lg:text-[20px] max-lg:leading-normal max-lg:tracking-[-0.8px] max-lg:min-h-0">
            <span className="text-[rgba(25,54,63,0.6)]">
              {rightSectionData.title} {/* <br /> */}
            </span>
            <span className="text-[#19363f]">{rightSectionData.subtitle}</span>
          </h2>
          <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full max-lg:text-[12px] max-lg:leading-[20px] max-lg:tracking-[-0.24px]">
            {rightSectionData.description}
          </p>
        </div>
        <div className="hidden max-lg:flex flex-col gap-6 max-lg:flex">
          {[...rightSectionData.steps].map((step, index) => {
            const stepNumber = String(index + 1).padStart(2, "0");
            const isActive = true;

            return (
              <div key={index} className="flex gap-[18px] items-start w-full">
                {isActive ? (
                  <div
                    className="bg-[#19363f] border border-[rgba(255,255,255,0.2)] flex items-center justify-center px-[14px] py-2 rounded-full w-[30px] h-[30px] shrink-0 relative overflow-hidden"
                    style={{
                      boxShadow:
                        "0px 6px 4px -4px rgba(25,54,63,0.15), 0px 12px 8px -4px rgba(25,54,63,0.15)",
                    }}
                  >
                    <p className="font-medium text-[12px] text-white tracking-[-0.48px]">
                      {stepNumber}
                    </p>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow:
                          "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                    <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-[12px] text-[#19363f] tracking-[-0.48px] whitespace-nowrap">
                      {stepNumber}
                    </p>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-[14px] items-start flex-1 min-w-0">
                  <p className="font-medium text-[14px] leading-[22px] text-[#19363f] tracking-[-0.56px] w-full">
                    {step.title}
                  </p>
                  <p className="font-normal text-[12px] leading-[20px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] w-full max-lg:hidden">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Info;
