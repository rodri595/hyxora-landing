import Button from "@/components/Button";
import Image from "@/components/Image";
import shieldCheckSVG from "@/assets/imgs/icons/shield-check.svg";
import eyeSVG from "@/assets/imgs/icons/eye.svg";
import sparklesSVG from "@/assets/imgs/icons/sparkles.svg";

const Why = () => {
  return (
    <section className="flex w-full  max-md:px-[16px]">
      <div
        className="flex flex-col gap-[10px] items-center pb-[70px] pt-[90px] px-[57px] relative rounded-2xl w-full overflow-hidden max-w-[1440px] mx-auto  max-md:pb-[30px] max-md:pt-[40px] max-md:px-[16px] max-md:h-auto"
        style={{
          borderRadius: "16px",
          background:
            "radial-gradient(118.36% 105.73% at 50% 105.73%, #497BEF 0%, #1144BA 24.49%, #091A1F 100%)",
        }}
      >
        {/* Content */}
        <div className="flex flex-col gap-[50px] items-center relative w-full max-w-[1240px] max-md:gap-[34px] max-md:max-w-full">
          {/* Title */}
          <h2 className="font-medium text-[40px] leading-[38px] tracking-[-0.04em] text-center text-white w-[540px] max-md:text-[20px] max-md:leading-normal max-md:tracking-[-0.8px] max-md:w-[307px]">
            <span className="text-[rgba(255,255,255,0.6)]">Una plataforma</span>{" "}
            financiera creada por y para el usuario
          </h2>

          {/* Cards Container */}
          <div className="flex gap-5 items-stretch w-full max-md:flex-col max-md:gap-[10px]">
            {/* Card 1 - True Ownership */}
            <div
              className="backdrop-blur-[25px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.02)] flex flex-col gap-2 flex-1 px-[16px] py-[24px] rounded-2xl relative overflow-hidden max-md:gap-[24px] max-md:pt-[16px]"
              style={{
                boxShadow:
                  "0px 6px 4px -4px rgba(0,0,0,0.05), 0px 12px 8px -4px rgba(0,0,0,0.05), 0px 0px 4px 0px inset rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="bg-[rgba(255,255,255,0.3)] border-[0.6px] border-[rgba(25,54,63,0.02)] flex items-center justify-center p-[14px] max-md:p-[9px] rounded-[14px] w-12 h-12 shrink-0 relative max-md:w-[38px] max-md:h-[38px] max-md:rounded-[10px]"
                style={{
                  boxShadow: "0px 0px 6px 0px inset rgba(255,255,255,0.2)",
                }}
              >
                <Image
                  src={shieldCheckSVG}
                  alt="Shield Check Icon"
                  className="w-[20px] h-[20px]"
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full max-md:gap-[14px]">
                <p className="font-medium text-[20px] leading-normal text-white tracking-[-0.04em] whitespace-nowrap max-md:text-[16px] max-md:leading-[22px] max-md:tracking-[-0.64px] max-md:whitespace-normal">
                  Seguridad y Transparencia
                </p>
                <p className="font-normal text-[16px] leading-[20px] text-[rgba(255,255,255,0.7)] tracking-[-0.02em] w-full max-md:text-[12px] max-md:tracking-[-0.24px]">
                  Autocustodia y blockchain. Sin intermediarios pero con
                  servicio de recuperación de contraseñas. Tus activos en tu
                  poder.
                </p>
              </div>
            </div>

            {/* Card 2 - Transparency */}
            <div
              className="backdrop-blur-[25px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.02)] flex flex-col gap-2 flex-1 px-[16px] py-[24px] rounded-2xl relative overflow-hidden max-md:gap-[24px] max-md:pt-[16px]"
              style={{
                boxShadow:
                  "0px 6px 4px -4px rgba(0,0,0,0.05), 0px 12px 8px -4px rgba(0,0,0,0.05), 0px 0px 4px 0px inset rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="bg-[rgba(255,255,255,0.3)] border-[0.6px] border-[rgba(25,54,63,0.02)] flex items-center justify-center p-[14px] max-md:p-[9px] rounded-[14px] w-12 h-12 shrink-0 relative max-md:w-[38px] max-md:h-[38px] max-md:rounded-[10px]"
                style={{
                  boxShadow: "0px 0px 6px 0px inset rgba(255,255,255,0.2)",
                }}
              >
                <Image
                  src={eyeSVG}
                  alt="Eye Icon"
                  className="w-[20px] h-[20px]"
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full max-md:gap-[14px]">
                <p className="font-medium text-[20px] leading-normal text-white tracking-[-0.04em] w-full max-md:text-[16px] max-md:leading-[22px] max-md:tracking-[-0.64px]">
                  Sencillez y usabilidad{" "}
                </p>
                <p className="font-normal text-[16px] leading-[20px] text-[rgba(255,255,255,0.7)] tracking-[-0.02em] w-full max-md:text-[12px] max-md:tracking-[-0.24px]">
                  Interfaz sencilla, creada y desarrollada para el usuario y
                  diferenciada según el plan en el que te encuentres.
                </p>
              </div>
            </div>
            {/* Card 3 - Creator Empowerment */}
            <div
              className="backdrop-blur-[25px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.02)] flex flex-col gap-2 flex-1 px-[16px] py-[24px] rounded-2xl relative overflow-hidden max-md:gap-[24px] max-md:pt-[16px]"
              style={{
                boxShadow:
                  "0px 6px 4px -4px rgba(0,0,0,0.05), 0px 12px 8px -4px rgba(0,0,0,0.05), 0px 0px 4px 0px inset rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="bg-[rgba(255,255,255,0.3)] border-[0.6px] border-[rgba(255,255,255,0.1)] flex items-center justify-center p-[14px] max-md:p-[9px] rounded-[14px] w-12 h-12 shrink-0 relative max-md:w-[38px] max-md:h-[38px] max-md:rounded-[10px]"
                style={{
                  boxShadow:
                    "0px 6px 8px -4px rgba(0,0,0,0.08), 0px 6px 4px -4px rgba(0,0,0,0.04), 0px 0px 6px 0px inset rgba(255,255,255,0.2)",
                }}
              >
                <Image
                  src={sparklesSVG}
                  alt="Sparkles Icon"
                  className="w-[20px] h-[20px]"
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full max-md:gap-[14px]">
                <p className="font-medium text-[20px] leading-normal text-white tracking-[-0.04em] w-full max-md:text-[16px] max-md:leading-[22px] max-md:tracking-[-0.64px]">
                  Nuevas oportunidades DeFi
                </p>
                <p className="font-normal text-[16px] leading-[20px] text-[rgba(255,255,255,0.7)] tracking-[-0.02em] w-full max-md:text-[12px] max-md:tracking-[-0.24px]">
                  Inversión, ingresos pasivos.. las oportunidades del nuevo
                  ecosistema financiero descentralizado en tus manos y a golpe
                  de click
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col gap-[30px] items-center w-[477px] max-md:w-full">
            <div className="flex gap-[10px] items-center max-md:flex-col max-md:w-full">
              <Button isSecondary>Ir a FAQs</Button>
              <Button isStroke>Ir a planes</Button>
            </div>
            <p className="font-medium text-base leading-6 text-center text-white tracking-[-0.04em] w-full max-md:text-[14px] max-md:leading-[22px] max-md:tracking-[-0.56px] max-md:w-[317px]">
              Hyxora convierte la complejidad del ecosistema DeFi en una
              experiencia tan sencilla y segura como usar tu app bancaria
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Why;
