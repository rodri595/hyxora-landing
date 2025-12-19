import { useState } from "react";
import Image from "@/components/Image";
import Button from "@/components/Button";
import WalletItem from "./item";
import triangleIMG from "@/assets/imgs/icons/triangle.svg";
import circleIMG from "@/assets/imgs/icons/circle.svg";
// ///
import stakeIMG from "./stake.png";
import swapIMG from "./swap.png";
import sendIMG from "./send.png";
import FundsIMG from "./funds.png";
import soonIMG from "./soon.png";

const Finance = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const walletItems = [
    {
      id: 0,
      title: "Staking",
      description:
        "Consigue rendimientos e ingresos pasivos sólo por el hecho de mantener tu capital en Hyxora",
      iconSrc: circleIMG,
      imageSrc: stakeIMG,
    },
    {
      id: 1,
      title: "Swaps",
      description:
        "Realiza cambios entre Fiat y Criptp en un solo click. Maximiza la rentabilidad de tu dinero",
      iconSrc: circleIMG,
      imageSrc: swapIMG,
    },
    {
      id: 2,
      title: "Remesas internacionales",
      description:
        "Envía dinero a otros usuarios en cualquier parte del mundo en segundos y sin coste",
      iconSrc: circleIMG,
      imageSrc: sendIMG,
    },
    {
      id: 3,
      title: "Fondos Indexados mixtos",
      description:
        "Invierte en fondos indexados con las mayores rentabilidades que ambos mundos financieros pueden ofrecerte en conjunto.",
      iconSrc: circleIMG,
      imageSrc: FundsIMG,
    },
    {
      id: 4,
      title: "Proximamente",
      description: "Pools de liquidez, Lending, etc. etc….",
      iconSrc: triangleIMG,
      imageSrc: soonIMG,
    },
  ];

  const handleItemInteraction = (index) => {
    setActiveIndex(index);
  };

  return (
    <section className="w-full h-full  ">
      <div className="flex relative  flex-col lg:flex-row items-start justify-center gap-2 lg:gap-12 max-w-[1240px] w-full mx-auto ">
        {/* Left Section - Empty for customization */}
        <div className="flex flex-col gap-[40px] items-start pt-[40px] w-full lg:w-[486px] lg:shrink-0 px-4  lg:pl-12">
          {/* Text Section */}
          <div className="flex flex-col gap-[24px] items-start w-full lg:w-[471px]">
            {/* Badge */}
            <div className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
              <p className="font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px]">
                Finanzas DeFi
              </p>
            </div>
            {/* Title */}
            <h2 className="font-medium text-[28px] sm:text-[35px] tracking-[-1.6px] w-full leading-[1.2] flex flex-col">
              <span className="text-[rgba(25,54,63,0.6)]">
                Finanzas descentralizadas
              </span>
              <span className="text-[#19363f]"> DeFi</span>
            </h2>

            {/* Description */}
            <p className="font-normal leading-[24px] text-[14px] sm:text-[16px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
              Las oportunidades del nuevo mundo financiero en tus manos{" "}
            </p>
          </div>

          {/* Wallet List Section */}
          <div className="flex flex-col gap-[10.913px] w-full">
            {walletItems.map((item, index) => (
              <WalletItem
                key={item.id}
                title={item.title}
                description={item.description}
                iconSrc={item.iconSrc}
                isActive={activeIndex === index}
                onHover={() => handleItemInteraction(index)}
                onClick={() => handleItemInteraction(index)}
              />
            ))}
            <Button isPrimary>Empezamos</Button>
          </div>
        </div>
        {/* Right Section -  */}
        <div className="w-full  hidden lg:flex relative items-center justify-center rounded-[16px] flex-1 min-h-[746px]">
          <Image
            src={walletItems[activeIndex].imageSrc}
            alt={walletItems[activeIndex].title}
            className="min-w-[497px] max-w-[497px] h-[746px] absolute left-[25%] top-[10%] max-2xl:left-[20%] max-xl:left-[20%]  max-xl:min-w-[revert] max-xl:max-w-[revert] max-xl:w-auto max-xl:top-[15%]  max-xl:h-[546px]  "
          />
        </div>
      </div>
    </section>
  );
};

export default Finance;
