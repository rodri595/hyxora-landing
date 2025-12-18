"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import AnimateHeight from "react-animate-height";

const faqItems = [
  {
    id: 1,
    question: "¿Es Hyxora un banco o una app de criptomonedas?",
    answer: `Ninguna de las dos cosas por separado. Es un proveedor de emisión de criptoactivos regulado que combina lo mejor de la banca tradicional (IBAN, SEPA gratis, tarjeta) con lo mejor de las finanzas descentralizadas (DeFi). Piensa en Hyxora como "el puente" entre tu banco de toda la vida y las finanzas del futuro.`,
  },
  {
    id: 2,
    question: "¿Tengo que saber de cripto para usar Hyxora?",
    answer:
      "No. Todo está pensado para que empieces desde cero. En pocos minutos eres capaz de tener tu IBAN, hacer swaps y generar ganancias sin tecnicismos.",
  },
  {
    id: 3,
    question: "¿Mi dinero está seguro en Hyxora?",
    answer:
      "Sí. El dinero fiat está en cuentas segregadas en entidades reguladas europeas. Los criptoactivos están en wallets de autocustodia (tú tienes las claves pero en caso de pérdida, desde la app puedes recuperarla).",
  },
  {
    id: 4,
    question: "¿Puedo tener un IBAN normal como en mi banco de toda la vida?",
    answer:
      "Sí. Recibes un IBAN europeo personal a tu nombre. Puedes domiciliar nómina, recibos y hacer/recibe transferencias SEPA totalmente gratis.",
  },
  {
    id: 5,
    question: "¿Puedo probar Hyxora antes de pagar?",
    answer: `Sí. El "Camino Prueba" cuesta solo 1,99 € (plan Basic) y si en 15 días no te convence, te devolvemos el 100 % automáticamente. Sin preguntas.`,
  },
  {
    id: 6,
    question:
      "¿Qué ventaja tengo al pagar 9,99 € de Premium frente a quedarme en el Basic de 1,99 €?",
    answer:
      "Por sólo 9,99 € tienes: Plan Basic completo, Fees de swap/intercambios al 0,5 % (vs 0,9 %), ahorras dinero cada vez que mueves dinero, Acceso a todas las cestas DeFi, Soporte prioritario y nuevas funcionalidades, Academia Premium. La mayoría de usuarios que prueban Premium recuperan la cuota el primer mes solo con lo que ahorran en fees.",
  },
];

const FAQItem = ({ item, isOpen, onToggle }) => {
  const iconRef = useRef(null);

  useGSAP(
    () => {
      const icon = iconRef.current;

      if (isOpen) {
        // Rotate icon to minus
        gsap.to(icon, {
          rotation: 180,
          duration: 0.4,
          ease: "power2.inOut",
        });
      } else {
        // Rotate icon back to plus
        gsap.to(icon, {
          rotation: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
      }
    },
    { dependencies: [isOpen] }
  );

  return (
    <button
      onClick={onToggle}
      className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] rounded-[16px] px-[20px] py-[16px] flex flex-col items-start w-full text-left relative shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] transition-all hover:bg-[rgba(25,54,63,0.04)]"
    >
      <div className="flex items-center justify-between w-full">
        <p className="font-inter font-medium text-[18px] leading-normal tracking-[-0.72px] text-[#19363f]">
          {item.question}
        </p>
        <div
          ref={iconRef}
          className="w-[16px] h-[16px] flex items-center justify-center flex-shrink-0 ml-4"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="7" width="2" height="16" rx="1" fill="#19363f" />
            <rect
              y="9"
              width="2"
              height="16"
              rx="1"
              transform="rotate(-90 0 9)"
              fill="#19363f"
            />
          </svg>
        </div>
      </div>
      <AnimateHeight
        duration={500}
        height={isOpen ? "auto" : 0}
        easing="cubic-bezier(0.33, 1, 0.68, 1)"
      >
        <div className="mt-[16px] pt-[16px] border-t border-[rgba(25,54,63,0.1)] w-full">
          <p className="font-inter text-[16px] leading-[24px] tracking-[-0.64px] text-[rgba(25,54,63,0.7)]">
            {item.answer}
          </p>
        </div>
      </AnimateHeight>
    </button>
  );
};

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full flex justify-center px-4 ">
      <div className="flex flex-col gap-[50px] items-center w-full max-w-[659px]">
        {/* Title */}
        <h2 className="font-inter font-medium text-[40px] leading-[40px] tracking-[-1.6px] text-center max-w-[379px]">
          <span className="text-[rgba(25,54,63,0.6)]">¿Tienes dudas? </span>
          <span className="text-[#19363f]">Aquí las resolvemos</span>
        </h2>

        {/* Content */}
        <div className="flex flex-col gap-[30px] items-center w-full">
          {/* Subtitle */}
          <p className="font-inter font-medium text-[16px] leading-[24px] tracking-[-0.64px] text-[#19363f] text-center">
            Preguntas frecuentes sobre Hyxora
          </p>

          {/* FAQ Items */}
          <div className="flex flex-col gap-[20px] w-full">
            {faqItems.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggleFAQ(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
