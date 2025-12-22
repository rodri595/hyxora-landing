import Button from "@/components/Button";
import Image from "@/components/Image";
import Item from "./item";
import posterIMG from "@/assets/imgs/brand/poster.jpeg";
import Video from "@/components/Video";
import Link from "next/link";
const Foundersv2 = () => {
  return (
    <section className="flex w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-12 max-md:gap-2  max-w-[1240px] w-full mx-auto px-4 ">
        {/* Left Section - Empty for customization */}
        <div className="w-full flex relative items-center justify-center rounded-[16px] h-full ">
          <Image
            src={posterIMG}
            className="h-[365px] w-auto rounded-[16px] hidden! max-md:flex!"
            alt="Item Option"
            priority
          />
          <Video
            className="h-[465px] max-md:hidden rounded-[16px]"
            src={"/videos/key_card_2.webm"}
            poster={posterIMG}
            type="video"
            playsInline
            autoPlay
            muted
            loop
          />
        </div>
        {/* Right Section -  */}
        <div className="flex flex-col gap-[40px] items-start  w-full lg:w-[486px] lg:shrink-0 xl:w-[486px]">
          {/* Text Section */}
          <div className="flex flex-col gap-[24px] items-start w-full lg:w-[471px]">
            {/* Badge */}
            <div className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
              <p className="font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px]">
                Founders
              </p>
            </div>
            {/* Title */}
            <h2 className="font-medium text-[28px] sm:text-[35px] tracking-[-1.6px] w-full leading-[1.2] flex flex-col">
              <span className="text-[#19363f]">Sé co-propietario</span>
              <span className="text-[rgba(25,54,63,0.6)]">de Hyxora</span>
            </h2>

            {/* Description */}
            <p className="font-normal leading-[24px] text-[14px] sm:text-[16px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
              Ahora tienes la posibilidad de ser co-propietario de Hyxora
            </p>
          </div>

          {/* Wallet List Section */}
          <div className="flex flex-col gap-[10.913px] w-full">
            <Item
              index="01"
              title="Propiedad Real"
              description="Registrada en Blockchain; acceso directo a la app y funcionalidades especiales."
            />

            <Item
              index="02"
              title="Privilegios Vitalicios"
              description="Suscripción Founder gratuita de por vida y acceso prioritario"
            />

            <Item
              index="03"
              title="Comité consultivo"
              description="Participación en decisiones consultivas como socio"
            />

            <Item
              index="04"
              title="Transmisible"
              description="Se puede vender o heredar; el nuevo propietario mantendrá los privilegios."
            />

            <Item
              index="05"
              title="Diferenciación"
              description="Reconocimiento especial en app y eventos"
            />
            <Link
              target="_blank"
              href="https://founder.hyxora.com/"
              rel="noopener noreferrer"
            >
              <Button isPrimary>Acceso</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Foundersv2;
