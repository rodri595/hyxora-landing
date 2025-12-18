"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import Image from "@/components/Image";

const plans = [
  {
    name: "BASIC",
    description: "Tu Iban, tu Wallets, tus fondos",
    monthlyPrice: 1.99,
    yearlyPrice: 19.08,
    buttonText: "Obtener Basic",
    buttonDisabled: false,
    isPrimary: false,
    features: [
      "IBAN Europeo",
      "SEPA",
      "Transferencias/Remesas internacionales",
      "Tarjeta de débito",
      "Wallet autocustodia",
      <>
        Intercambios Fiat-Crypto / Swaps{" "}
        <span className="text-[12px] font-light">(0,9% fee)</span>
      </>,
      "Recompenses / Staking",
      "Academia 1.0",
    ],
  },
  {
    name: "PREMIUM",
    description: (
      <>
        BASIC+DeFi
        <br />
        Conoce las oportunidades que DeFi tiene para ti
      </>
    ),
    monthlyPrice: 9.99,
    yearlyPrice: 95.88,
    buttonText: "Obtener Premium",
    buttonDisabled: false,
    isPrimary: true,
    features: [
      "Plan BASIC",
      <>
        Intercambios Fiat-Crypto / Swaps{" "}
        <span className="text-[12px] font-light">(0,5% fee)</span>
      </>,
      <>
        Fondos Indexados Defi <br />
        <span className="text-[12px] font-light">
          (2% entrada y 5% si beneficio Fee)
        </span>
      </>,
      "Ingresos pasivos",
      "Academia 2.0",
      "Comité Consultivo*",
      "Imagen diferenciada Premium",
    ],
  },
  {
    name: "BUSINESS",
    description: (
      <>
        Plan PREMIUM para Empresa
        <br /> Tu negocio sin fronteras
      </>
    ),
    price: null,
    priceText: "PRÓXIMAMENTE",
    buttonText: "Próximamente",
    buttonDisabled: true,
    isPrimary: false,
    features: [
      "Plan PREMIUM",
      "Multicuenta",
      "Tarjeta por usuario",
      "Sistema para modelos Internacionales",
    ],
  },
  {
    name: "FOUNDER",
    description: (
      <>
        De usuario a Co-Propietario de HYXORA <br />
        (Limitado a 1000und)
      </>
    ),
    price: null,
    priceText: "EXCLUSIVO",
    buttonText: "Hazte Founder de Hyxora",
    buttonDisabled: false,
    isPrimary: false,
    features: [
      "Plan Premium gratuito de por vida",
      <>
        Equity Hyxora{" "}
        <span className="text-[12px] font-light">(hasta un 10%)</span>
      </>,
      "Accesos prioritarios",
      "Comité Consultivo Founder",
      <>
        Posición FOUNDER transferible a otro usuario{" "}
        <span className="text-[12px] font-light">(2028)</span>
      </>,
      "Imagen diferenciada Founder",
    ],
  },
];

const Plans = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="w-full py-16 md:py-24 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-8 mb-12">
          <h2 className="text-4xl font-normal text-t-primary tracking-[-0.03em] leading-[3rem]">
            Planes
          </h2>

          {/* Toggle */}
          <div className="relative w-[216px] h-10">
            <div className="absolute inset-0 bg-b-surface3 border border-stroke2 rounded-xl p-1 flex items-center shadow-[inset_0px_1px_1.9px_0px_rgba(50,50,50,0.1)]">
              <button
                onClick={() => setIsYearly(false)}
                className={`flex-1 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold tracking-[-0.01em] transition-all ${
                  !isYearly
                    ? "bg-b-surface1 text-t-primary shadow-[0px_1.25px_3px_0px_rgba(50,50,50,0.1),inset_0px_1.25px_1px_0px_white]"
                    : "text-t-secondary"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`flex-1 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold tracking-[-0.01em] transition-all ${
                  isYearly
                    ? "bg-b-surface1 text-t-primary shadow-[0px_1.25px_3px_0px_rgba(50,50,50,0.1),inset_0px_1.25px_1px_0px_white]"
                    : "text-t-secondary"
                }`}
              >
                Anual
              </button>
            </div>
            {/* Green dot indicator */}
            {isYearly && (
              <div className="absolute right-[6px] top-[6px] w-2 h-2 rounded-full bg-primary2" />
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-4  max-lg:grid-cols-2 max-sm:grid-cols-1 gap-2 w-full">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[20px]  overflow-hidden ${
                plan.isPrimary
                  ? "bg-gradient-to-b from-[#1b1b1b] from-0% to-transparent to-[95%]  "
                  : "bg-b-surface3"
              }`}
            >
              {/* Plan Header */}
              <div
                className={`px-6 py-3  ${
                  plan.isPrimary ? "bg-[#1b1b1b] relative overflow-hidden" : ""
                }`}
              >
                <h3
                  className={`text-xl flex items-center gap-1 font-medium tracking-[-0.03em] relative z-1 ${
                    plan.isPrimary ? "text-white" : "text-t-primary"
                  }`}
                >
                  {plan.name}
                  {/* Hot Button */}
                  {plan.name === "FOUNDER" && (
                    <div className="bg-[#1b5ffd] h-[18px] border relative flex items-center border-[rgba(255,255,255,0.2)] border-solid rounded-[100px] px-2 ml-auto ">
                      <div className="flex gap-[3px] items-center  justify-center overflow-hidden  rounded-[inherit] w-full">
                        <Image
                          src={fireSVG}
                          alt="Fire Icon"
                          className=" size-[9px] "
                        />
                        <p className="font-medium text-[9px]  text-[#f7f8f8] tracking-tight ">
                          NFT
                        </p>
                      </div>
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow:
                            "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                        }}
                      />
                    </div>
                  )}
                </h3>
              </div>

              {/* Plan Details */}
              <div className="bg-b-surface1 border border-stroke2 rounded-[20px] flex flex-col gap-3 p-3 flex-1">
                {/* Description */}
                <div className="px-3 py-3 h-[60px] flex items-start ">
                  <p className="text-xs  tracking-[-0.015em] leading-[1.5]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Container */}
                <div className="bg-b-surface2 border border-stroke2 rounded-[20px] p-3 flex flex-col gap-2 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_10px_4px_0px_rgba(0,0,0,0),0px_16px_4px_0px_rgba(0,0,0,0),inset_0px_2px_2px_0px_rgba(255,255,255,0.8)] dark:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_10px_4px_0px_rgba(0,0,0,0),0px_16px_4px_0px_rgba(0,0,0,0),inset_0px_2px_2px_0px_rgba(255,255,255,0.1)]">
                  {/* Price */}
                  <div className="flex items-center gap-2 h-[56px]">
                    {plan.monthlyPrice !== undefined ? (
                      <>
                        <div className="flex items-center">
                          <span className="text-2xl font-medium text-t-secondary tracking-[-0.03em] relative top-1 mr-0.5">
                            €
                          </span>
                          <span className="text-[40px] font-normal text-t-primary tracking-[-0.03em] leading-[3rem]">
                            {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                        </div>
                        <div className="flex flex-col text-xs font-medium text-t-secondary tracking-[-0.01em] leading-4">
                          <span>EUR /</span>
                          <span>{isYearly ? "año" : "mes"}</span>
                        </div>
                      </>
                    ) : plan.price !== null ? (
                      <>
                        <div className="flex items-center">
                          <span className="text-2xl font-medium text-t-secondary tracking-[-0.03em] relative top-1 mr-0.5">
                            €
                          </span>
                          <span className="text-[40px] font-normal text-t-primary tracking-[-0.03em] leading-[3rem]">
                            {plan.price}
                          </span>
                        </div>
                        <div className="flex flex-col text-xs font-medium text-t-secondary tracking-[-0.01em] leading-4">
                          <span>EUR /</span>
                          <span>mes</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-t-primary tracking-[-0.02em]">
                        {plan.priceText}
                      </span>
                    )}
                  </div>

                  {/* Button */}
                  {plan.isPrimary ? (
                    <Button
                      disabled={plan.buttonDisabled}
                      className="w-full h-10 px-6 py-2.5 rounded-xl text-sm font-semibold tracking-[-0.02em]  transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:brightness-105"
                      isPrimary={true}
                    >
                      {plan.buttonText}
                    </Button>
                  ) : (
                    <Button
                      disabled={plan.buttonDisabled}
                      className={`w-full h-10 px-6 py-2.5 rounded-xl text-t-primary text-sm font-semibold tracking-[-0.02em]  transition-all ${
                        plan.buttonDisabled
                          ? "bg-gradient-to-b from-[#e5e5e5] to-[#e2e2e2] opacity-50 cursor-not-allowed"
                          : "bg-gradient-to-b from-[#323232] to-[#222222] text-white hover:brightness-110"
                      }`}
                      isSecondary
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-col gap-2 px-3 py-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                        <Icon name="check" className="w-4 h-4 fill-primary2" />
                      </div>
                      <p className="text-[13px]  tracking-[-0.01em] leading-[1.5]">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Plans;
