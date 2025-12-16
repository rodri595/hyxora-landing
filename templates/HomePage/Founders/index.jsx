import Button from "@/components/Button";
import Video from "@/components/Video";
import FounderBenefit from "./FounderBenefit";
import posterIMG from "./poster.jpg";

const Founders = () => {
  return (
    <section className="flex flex-col items-center gap-[57px] w-full max-w-[886px] mx-auto px-4 max-md:gap-[40px]">
      {/* Main Content Container */}
      <div className="relative w-full">
        <div
          className="absolute rounded-[20px]  left-1/2 -translate-x-1/2 bottom-[-32px] z-0 w-[calc(100%-220px)] h-full  bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid pointer-events-none"
          style={{
            boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
            backdropFilter: "blur(8px)",
          }}
        ></div>
        <div
          className="absolute rounded-[20px]  left-1/2 -translate-x-1/2 bottom-[-16px] z-0 w-[calc(100%-110px)] h-full   bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid pointer-events-none"
          style={{
            boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
            backdropFilter: "blur(8px)",
          }}
        ></div>
        {/* Content */}
        <div
          className="flex items-center rounded-[20px] px-[48px] py-[50px] max-md:px-[20px] max-md:py-[30px] max-md:flex-col bg  gap-[40px] justify-between flex-1 max-md:flex-col max-md:gap-[30px] bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid"
          style={{
            boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Left Side - Text Content */}
          <div className="flex flex-col gap-[24px] w-full max-w-[547px] max-md:max-w-full ">
            {/* Text Section */}
            <div className="flex flex-col gap-2 ">
              {/* Tag */}
              <div className="inline-flex">
                <div className="bg-[rgba(25,54,63,0.06)] border border-[rgba(25,54,63,0.06)] rounded-[100px] px-[14px] py-[10px]">
                  <p className="font-medium text-[9px] leading-[9px] tracking-[-0.36px] text-[#19363f] uppercase">
                    Founders
                  </p>
                </div>
              </div>
              {/* Description */}
              <p className="font-medium text-[16px] leading-[24px] tracking-[-0.32px] text-[#19363f]">
                Ahora tienes la posibilidad de ser <br />
                co-propietario de Hyxora
                {/* 10% de Equity entre 1000 Founders */}
              </p>
            </div>
            {/* Action Section */}
            <div className="flex flex-col gap-[20px] w-full">
              <FounderBenefit
                index="01"
                title="Propiedad Real"
                description="Registrada en Blockchain; acceso directo a la app y funcionalidades especiales."
              />
              <FounderBenefit
                index="02"
                title="Privilegios Vitalicios"
                description="Suscripción Founder gratuita de por vida y acceso prioritario."
              />
              <FounderBenefit
                index="03"
                title="Comité consultivo"
                description="Participación en decisiones consultivas como socio."
              />
              <FounderBenefit
                index="04"
                title="Transmisible"
                description="Se puede vender o heredar; el nuevo propietario mantendrá los privilegios."
              />
              <FounderBenefit
                index="05"
                title="Diferenciación"
                description="Reconocimiento especial en app y eventos."
              />
              <Button isPrimary className="w-fit">
                Acceso
              </Button>
            </div>
          </div>
          {/* Right Side - founder Card */}
          <Video
            className=" h-[365px] !object-contain  max-md:h-[300px] rounded-xl overflow-hidden  "
            src={"/videos/key_card_2.webm"}
            poster={posterIMG}
            type="video"
            playsInline
            autoPlay
            muted
            loop
          />
        </div>{" "}
        {/* </div> */}
      </div>
    </section>
  );
};

export default Founders;
