"use client";

import React, { useState } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const plans = [
  {
    name: "BASIC",
    description: "Plan básico",
    price: 1.99,
    buttonText: "Obtener Basic",
    buttonDisabled: false,
    isPrimary: false,
    features: [
      "IBAN Europeo",
      "SEPA",
      "Remesas internacionales",
      "Tarjeta de débito",
      "Wallet autocustodia",
      "Swaps (0,9%)",
      "Staking",
      "Academia 1.0",
    ],
  },
  {
    name: "PREMIUM",
    description: "Plan BASIC + DEFI",
    price: 9.99,
    buttonText: "Obtener Premium",
    buttonDisabled: false,
    isPrimary: true,
    features: [
      "Plan BASIC",
      "Swaps (0,5%)",
      "Fondos Indexados (2% entrada/5% beneficio)",
      "Ingresos pasivos",
      "Academia 2.0",
      "Comité Consultivo*",
    ],
  },
  {
    name: "BUSINESS",
    description: "Plan PREMIUM + Multicuenta",
    price: null,
    priceText: "PRÓXIMAMENTE",
    buttonText: "Próximamente",
    buttonDisabled: true,
    isPrimary: false,
    features: [
      "Plan PREMIUM",
      "Multicuenta",
      "Tarjeta por usuario",
      "Venta Worldwide",
    ],
  },
  {
    name: "FOUNDER",
    description: "Equity Hyxora + Beneficios exclusivos",
    price: null,
    priceText: "EXCLUSIVO",
    buttonText: "Hazte Founder de Hyxora",
    buttonDisabled: false,
    isPrimary: false,
    features: [
      "Plan PREMIUM",
      "Equity Hyxora",
      "Suscripción gratuita siempre",
      "Accesos prioritarios",
      "Comité Consultivo",
      "Imagen diferenciada",
      "Posición Transferible",
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 w-full">
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
                  className={`text-xl font-medium tracking-[-0.03em] relative z-10 ${
                    plan.isPrimary ? "text-white" : "text-t-primary"
                  }`}
                >
                  {plan.name}
                </h3>
              </div>

              {/* Plan Details */}
              <div className="bg-b-surface1 border border-stroke2 rounded-[20px] flex flex-col gap-3 p-3 flex-1">
                {/* Description */}
                <div className="px-3 py-3 h-[60px] flex items-center ">
                  <p className="text-[15px] text-t-primary tracking-[-0.015em] leading-[1.5]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Container */}
                <div className="bg-b-surface2 border border-stroke2 rounded-[20px] p-3 flex flex-col gap-2 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_10px_4px_0px_rgba(0,0,0,0),0px_16px_4px_0px_rgba(0,0,0,0),inset_0px_2px_2px_0px_rgba(255,255,255,0.8)] dark:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_10px_4px_0px_rgba(0,0,0,0),0px_16px_4px_0px_rgba(0,0,0,0),inset_0px_2px_2px_0px_rgba(255,255,255,0.1)]">
                  {/* Price */}
                  <div className="flex items-center gap-2 h-[56px]">
                    {plan.price !== null ? (
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
                      <p className="text-[13px] text-t-primary tracking-[-0.01em] leading-[1.5]">
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
