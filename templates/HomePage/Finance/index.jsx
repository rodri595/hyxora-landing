import Image from "@/components/Image";
import financeIMG from "@/assets/imgs/brand/tokens.webp";
import FinanceGridItem from "./FinanceGridItem";

const Finance = () => {
  return (
    <div className="flex flex-col gap-[70px] items-center w-full px-4">
      {/* Header Text Section */}
      <div className="flex flex-col gap-2 items-center justify-center w-full max-w-[700px]">
        {/* Badge */}
        <div
          className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex items-center justify-center px-[14px] py-[10px] rounded-[32px]"
          style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
        >
          <p className="font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] whitespace-nowrap">
            Buy Crypto Instantly
          </p>
        </div>

        {/* Main Heading */}
        <h2 className="font-medium text-[50px] text-[#19363f] text-center tracking-[-2.16px] leading-[normal] w-full">
          Finanzas descentralizadas DeFi
        </h2>

        {/* Description */}
        <p className="font-normal text-[16px] text-[rgba(25,54,63,0.7)] text-center tracking-[-0.32px] leading-6 w-full max-w-[475px]">
          Las oportunidades del nuevo mundo financiero en tus manos
        </p>
      </div>

      {/* Content Section */}
      <div className="flex gap-4 items-stretch w-full max-w-[1220px] ">
        {/* Left Column */}
        <Image
          className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid  rounded-2xl  w-[529px] object-cover"
          style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
          src={financeIMG}
          alt="Finance Image"
        />
        {/* Right Column - Payment Options */}
        <div
          className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-10 overflow-hidden p-[30px] rounded-2xl w-[691px]"
          style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
        >
          {/*  Grid */}
          <div className="flex flex-col gap-[14px] ">
            <FinanceGridItem
              title="Staking"
              description="Haz que tu dinero trabaje por ti. Consigue rendimientos e ingresos pasivos sólo por el hecho de mantener tu capital en Hyxora"
            />
            <FinanceGridItem
              title="Swaps"
              description="Realiza cambios entre Fiat y Criptp en un solo click. Maximiza la rentabilidad de tu dinero"
            />
            <FinanceGridItem
              title="Remesas internacionales"
              description="Envía dinero a otros usuarios en cualquier parte del mundo en segundos y sin coste"
            />
            <FinanceGridItem
              title="Fondos Indexados mixtos"
              description="Invierte en fondos indexados con las mayores rentabilidades que ambos mundos financieros pueden ofrecerte en conjunto. Sé conservador desde la parte tradicional y busca las mayores oportunidades en DEfi, pero desde el mismo fondo."
            />
            <FinanceGridItem
              title="Proximamente"
              description="Pools de liquidez, Lending, etc. etc…."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
