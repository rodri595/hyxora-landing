const Info = () => {
  const leftSectionData = {
    title: "¿Por qué ",
    subtitle: "somos un NoBanco? ",
    // description:
    //   "Opera desde tu app y tarjeta de forma habitual y maneja desde un mismo dispositivo todos tus activos",
    steps: [
      {
        id: 1,
        description: "Porque entendemos que se puede mejorar lo presente",
      },
      {
        id: 2,
        description:
          "Porque la tecnología aporta agilidad, optimización, transparencia y libertad",
      },
      {
        id: 3,
        description:
          "Porque el cliente se ha convertido en usuario, ya tiene poder de decisión.",
      },
      {
        id: 4,
        description: "Porque la tecnologia elimina intermediarios ineficientes",
      },
      {
        id: 5,
        description:
          "Porque el control de mis finanzas me proporciona libertad.",
      },
      {
        id: 6,
        description:
          "Porque existen muchas más oportunidades en los mercados como los descentralizados ",
      },
    ],
  };

  const rightSectionData = {
    title: "Propuestas",
    subtitle: "Hyxora",
    // description:
    //   "No te quedes fuera de las oportunidades que ofrece DeFi por desconocimiento o miedos",
    steps: [
      {
        id: 1,
        description:
          "Somos más una plataforma tecnológica que te da acceso al mundo financiero actual.",
      },
      {
        id: 2,
        description:
          "El usuario como epicentro de del modelo Hyxora. La comunidad es nuestro hábitat.",
      },
      {
        id: 3,
        description:
          "La autocustodia como base de la libertad y protocolos para eliminar el miedo a la responsabilidad que conlleva",
      },
      {
        id: 4,
        description:
          "Si no necesitas intermediarios, pues no los tengas. Acompañar es el objetivo de Hyxora, formar y convencer es parte del camino.",
      },
      {
        id: 5,
        description: "La confianza se gana con transparencia y trazabilidad. ",
      },
      {
        id: 6,
        description:
          "Somos el acceso a los mercados financieros actuales: tradicionales y descentralizados ",
      },
    ],
  };
  // const leftSectionData = {
  //   title: "Crea tu IBAN, tarjetas",
  //   subtitle: "y maneja tu Wallet desde tu app",
  //   description:
  //     "Opera desde tu app y tarjeta de forma habitual y maneja desde un mismo dispositivo todos tus activos",
  //   steps: [
  //     {
  //       title: "IBAN Europeo",
  //       description:
  //         "Tu cuenta en euros para tu día a día. Paga en comercios, añade suscripciones, haz trasferencias, etc.",
  //     },
  //     {
  //       title: "Wallet autocustodiada",
  //       description:
  //         "Guarda y gestiona tus activos digitales con total seguridad Maneja desde el dispositivo cambios, compras, ventas.. sin intermediarios",
  //     },
  //     {
  //       title: "Tarjeta de débito",
  //       description:
  //         "Dispon de tus activos cuando desees desde tu tarjeta bancaria Hyxora Pagos, retiradas de efectivo en cajeros.",
  //     },
  //     {
  //       title: "Transferencias nacionales e internacionales sin coste",
  //       description:
  //         "Transfiere fondos entre usuarios sin coste o desde Hyxora a otras cuentas de forma inmediata.",
  //     },
  //     {
  //       title: "Servicios de calidad a costes mínimos",
  //       description:
  //         "Dispón de todos los servicios a costes muy reducidos Contrata el plan que más te convenga y modificalo sin compromisos.",
  //     },
  //   ],
  // };

  // const rightSectionData = {
  //   title: "Conoce las oportunidades",
  //   subtitle: "del mercado descentralizado (DeFi)",
  //   description:
  //     "No te quedes fuera de las oportunidades que ofrece DeFi por desconocimiento o miedos",
  //   steps: [
  //     {
  //       title: "Ingresos pasivos y depósitos remunerados",
  //       description:
  //         "Que el dinero trabaje por ti. Genera ingresos desde cualquiera de las opciones que Hyxora te ofrece.",
  //     },
  //     {
  //       title: "Oportunidades de inversión DEFI",
  //       description:
  //         "Invierte en Fondos Indexados mixtos, pools de liquidez y otros Paga en comercios, añade suscripciones, haz trasferencias, etc.",
  //     },
  //     {
  //       title: "Comité Consultivo",
  //       description:
  //         "Hyxora se basa en la comunidad y escucha al usuario participa activamente de las decisiones a tomar en Hyxora.",
  //     },
  //     {
  //       title: "Founder de Hyxora",
  //       description:
  //         "Al hacerte Founder, adquieres un % del Equity de Hyxora. Además de los propios privilegios de ser Founder, serás co-propietario de Hyxora. Date prisa, sólo habrá 1000 Founders.",
  //     },
  //     {
  //       title: "iA personalizada",
  //       description:
  //         "Cada usuario dispondrá de diferentes asistentes siendo uno de ellos, su asistente personal. Toda la capacidad de la iA sólo y únicamente para ti, para acompañarte en Hyxora desde el primer minuto.",
  //     },
  //   ],
  // };

  return (
    <section className="flex w-full" id="opportunities-section">
      <div className="max-w-[1240px] mx-auto w-full  max-xl:px-[32px] max-md:px-[16px]">
        {/* Headers Row */}
        <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-[102px] max-lg:gap-[32px]  items-start ">
          {/* Left Header */}
          <div className="flex flex-col gap-7 max-lg:gap-[16px] items-start w-full h-full justify-between max-md:mb-2">
            <h2 className="font-medium text-[36px] leading-[40px] tracking-[-0.04em] w-full min-h-[80px] max-lg:text-[20px] max-lg:leading-normal max-lg:tracking-[-0.8px] max-lg:min-h-0">
              <span className="text-[rgba(25,54,63,0.6)]">
                {leftSectionData.title} {/* <br /> */}
              </span>
              <span className="text-[#19363f]">{leftSectionData.subtitle}</span>
            </h2>
            {leftSectionData?.description && (
              <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full max-lg:text-[12px] max-lg:leading-[20px] max-lg:tracking-[-0.24px]">
                {leftSectionData.description}
              </p>
            )}
          </div>
          {/* Right Header */}
          <div className="flex flex-col gap-7 max-lg:gap-[16px] items-start w-full h-full justify-between max-lg:hidden ">
            <h2 className="font-medium text-[36px] leading-[40px] tracking-[-0.04em] w-full min-h-[30px] max-lg:text-[20px] max-lg:leading-normal max-lg:tracking-[-0.8px] max-lg:min-h-0">
              <span className="text-[rgba(25,54,63,0.6)]">
                {rightSectionData.title} {/* <br /> */}
              </span>
              <span className="text-[#19363f]">
                {rightSectionData.subtitle}
              </span>
            </h2>

            {rightSectionData?.description && (
              <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full max-lg:text-[12px] max-lg:leading-[20px] max-lg:tracking-[-0.24px]">
                {rightSectionData.description}
              </p>
            )}
          </div>
        </div>
        {/* Steps Grid - Desktop: Two columns aligned, Mobile: Single column sequential */}
        <div className="flex flex-col gap-11 max-lg:hidden">
          {leftSectionData.steps.map((leftStep, index) => {
            const rightStep = rightSectionData.steps[index];
            const stepNumber = String(index + 1).padStart(2, "0");
            const isActive = true;

            return (
              <div key={leftStep?.id} className="grid grid-cols-2 gap-[102px]">
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
                    {leftStep?.title && (
                      <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                        {leftStep?.title}
                      </p>
                    )}
                    <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                      {leftStep?.description}
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
                    <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                      {rightStep?.description}
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
              <div
                key={step?.id}
                className="flex gap-[18px] items-start w-full"
              >
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
                  {step?.description && (
                    <p className="font-normal text-[12px] leading-[20px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] w-full ">
                      {step?.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Right Header */}
        <div className="flex flex-col gap-7 max-lg:gap-[16px] max-md:mb-2 items-start w-full   justify-between hidden max-lg:flex">
          <h2 className="font-medium text-[36px] leading-[40px] tracking-[-0.04em] w-full min-h-[80px] max-lg:text-[20px] max-lg:leading-normal max-lg:tracking-[-0.8px] max-lg:min-h-0">
            <span className="text-[rgba(25,54,63,0.6)]">
              {rightSectionData?.title} {/* <br /> */}
            </span>
            <span className="text-[#19363f]">{rightSectionData?.subtitle}</span>
          </h2>
          {rightSectionData?.description && (
            <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full max-lg:text-[12px] max-lg:leading-[20px] max-lg:tracking-[-0.24px]">
              {rightSectionData?.description}
            </p>
          )}
        </div>
        <div className="hidden max-lg:flex flex-col gap-6 max-lg:flex">
          {[...rightSectionData.steps].map((step, index) => {
            const stepNumber = String(index + 1).padStart(2, "0");
            const isActive = true;

            return (
              <div
                key={step?.id}
                className="flex gap-[18px] items-start w-full"
              >
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
                  {step?.title && (
                    <p className="font-medium text-[14px] leading-[22px] text-[#19363f] tracking-[-0.56px] w-full">
                      {step?.title}
                    </p>
                  )}
                  {step?.description && (
                    <p className="font-normal text-[12px] leading-[20px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] w-full ">
                      {step?.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="font-medium text-base leading-6 text-center  tracking-[-0.04em] w-full max-md:text-[14px] max-md:leading-[22px] max-md:tracking-[-0.56px] max-md:w-[317px] mt-10">
          La tecnología es nuestra, el control es tuyo.
        </p>
      </div>
    </section>
  );
};

export default Info;
