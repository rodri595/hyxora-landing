"use client";

import { haptic } from "@/utils/haptics";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, useState } from "react";
import AnimateHeight from "react-animate-height";

const faqItems = [
  {
    id: 1,
    question: "¿Qué es exactamente Hyxora?",
    answer:
      "Hyxora es una herramienta tecnológica que facilita el acceso de forma ágil y transparente a las diferentes oportunidades financieras que encontramos en el mundo tradicional y el mundo DeFi de forma sencilla y segura, sin necesidad de ser experto.",
  },
  {
    id: 2,
    question: "¿Es Hyxora un banco o una app de criptomonedas?",
    answer:
      "Ninguna de las dos cosas por separado. Hyxora es lo que denominamos un NoBanco, que intenta mejorar las opciones existentes mediante una tecnología de vanguardia.",
  },
  {
    id: 3,
    question: "¿Tengo que saber de cripto para usar Hyxora?",
    answer:
      "No. Todo está pensado para que empieces desde cero. Tanto el proceso de registro como la interacción dentro de la app está creada para ser muy sencilla para el usuario tanto en la faceta de criptomonedas o cualquier otro activo digital que se encuentre a disposición.",
  },
  {
    id: 4,
    question: "¿Mi dinero está seguro en Hyxora?",
    answer:
      "Sí. De hecho uno de los pilares fundamentales de Hyxora es la autocustodia. Nada más registrarte se crea una wallet a tu nombre de forma automática. Hyxora nunca tendrá acceso a tus fondos, el control es tuyo y solo tuyo. Lo que sí damos son las herramientas necesarias para hacer tu wallet más segura y a la vez los sistemas de recuperación para que no tengas problemas en caso de pérdida de las claves.",
  },
  {
    id: 5,
    question: "¿Puedo tener un IBAN normal como en mi banco de siempre?",
    answer:
      "Sí pero próximamente. Recibirás un IBAN personal a tu nombre. Puedes recibir tu sueldo, pagar tus servicios y hacer/recibir transferencias SEPA a terceros, es decir prácticamente la operativa del día a día que haces habitualmente.",
  },
  {
    id: 6,
    question: "¿Qué diferencia hay entre el plan Basic (1,99 €) y el Premium (9,99 €)?",
    answer:
      "El plan Basic te da acceso a la entrada en el mundo Crypto desde el mundo financiero tradicional: tendrás una cuenta fíat con IBAN , transferencias, tarjeta fiat-crypto, y podrás intercambiar (swap) entre monedas fíat- Crypto y Crypto-Crypto. El plan Premium es el Basic pero añadiendo la entrada en las oportunidades que nos ofrece el mercado de las finanzas descentralizadas DeFi, donde encontrarás opciones un poco más complejas. Además de estas funcionalidades, los accesos a la parte de Academia, Comité Consultivo, etc, así como la propia estética y accesos también serán más completos en Premium que en Basic.",
  },
  {
    id: 7,
    question: "¿Puedo probar Hyxora antes de pagar?",
    answer:
      "Hasta septiembre de 2026, la version 1.2 será de entrada gratuita para todos los usuarios y entrarán todos en modo PREMIUM (Excepto los NFT Founders, que entran ya directamente como Founders). A partir de esta fecha, se activarán las suscripciones por membresía.",
  },
  {
    id: 8,
    question: "Si no me convence, ¿me devuelven el dinero?",
    answer:
      "Sí, devolución 100 % automática en menos de 48 horas si cancelas antes del día 15. Queremos que te quedes porque te encanta, no por miedo a perder 1,99 €.",
  },
  {
    id: 9,
    question: "¿Qué es un swap o intercambio y para qué sirve?",
    answer:
      "Un swap o intercambio es cambiar tus activos digitales por otros, en búsqueda de mayor rendimiento, estabilidad, etc., dependiendo de tus objetivos. Dentro del abanico de posibilidades, tenemos las StableCoins, que son las versiones digitales de monedas Fiat (USDC, USDT, EUROC, etc); las criptomonedas (Bitcoin, Etherium, etc); y otros activos digitales como puede ser el Oro en su versión digital.",
  },
  {
    id: 10,
    question: "¿Qué son las stablecoins y por qué son seguras?",
    answer:
      'Son euros o dólares "digitales" que están relacionados al valor de su moneda fiat. En Hyxora usamos USDC, USDT y EURC, todos auditados y con reservas 1:1 en bancos regulados.',
  },
  {
    id: 11,
    question: "¿Cómo gano dinero con las canastas de tokens?",
    answer:
      "Depositas euros digitales en canastas pre-configuradas (nosotros elegimos los mejores protocolos). Dispón tanto de tu dinero como de los rendimientos que esté produciendo en cualquier momento desde la propia app.",
  },
  {
    id: 12,
    question: "¿Qué rendimiento puedo esperar realmente?",
    answer:
      "En 2025 las canastas estables rondan 5-8 % y las de mayor rendimiento 9-12 %. El rendimiento real depende del mercado, pero siempre lo mostramos en tiempo real y sin sorpresas.",
  },
  {
    id: 13,
    question: "¿Puedo perder dinero en las canastas o staking?",
    answer:
      'El riesgo es inherente a la inversión teniendo en cuenta que la volatilidad de las canastas "estables" o basadas en stablecoins, es prácticamente nula respecto a aquellas basadas en activos de mayor movimiento en el mercado. Pero tenemos que tener en cuenta que estamos en un mercado con volatilidad y el riesgo de pérdida siempre está presente.',
  },
  {
    id: 14,
    question: '¿Qué significa "autocustodia" y por qué es mejor?',
    answer:
      "Significa que las claves privadas las tienes tú, no nosotros. Si mañana Hyxora desapareciera, tu dinero seguiría estando en tu wallet. Es la forma más segura que existe hoy. En caso de pérdida de la clave de la walet, desde la propia app tienes acceso a una recuperación de forma sencilla pero segura. En la zona de tutoriales de www.hyxora.com tienes ejemplos de cómo llevarlo a cabo.",
  },
  {
    id: 15,
    question: "¿Qué pasa si pierdo el celular o la frase de recuperación?",
    answer:
      "Tenemos un sistema de recuperación + soporte 24 h. Con tu documento y algunos datos podemos ayudarte a recuperar el acceso en menos de 48 h.",
  },
  {
    id: 16,
    question: "¿Puedo usar Hyxora para pagar a proveedores o recibir mi sueldo desde el extranjero?",
    answer:
      "Próximamente sí. Con tu IBAN puedes recibir tu sueldo y pagar a proveedores exactamente igual que con cualquier banco europeo. Y si quieres pagar más barato y rápido, puedes hacerlo en stablecoins.",
  },
  {
    id: 17,
    question: "¿Por qué debería usar Hyxora si ya tengo otras plataformas conocidas?",
    answer:
      "Algunas te dan algo de cripto, pero con custodia (ellos guardan tus claves) y rendimientos muy bajos. Otras más enfocadas en el mundo Crypto no tienen IBAN ni están pensadas para el día a día. Hyxora combina lo mejor de los dos mundos: IBAN europeo, tarjeta para pagar cualquier cosa, rendimientos reales de DeFi y tus claves siempre en tu poder.",
  },
  {
    id: 18,
    question: "¿Es verdad que en Hyxora gano más interés que en un plazo fijo del banco?",
    answer:
      "Sí, y con diferencia. Hoy los mejores plazos fijos dan 2-3 %. En Hyxora, con la canasta más conservadora ya superas ampliamente esas cifras y cobras intereses cada día. Y puedes sacar el dinero cuando quieras, sin penalización. Es la consecuencia de no tener intermediarios, el producto puede ser el mismo, pero los rendimientos son muy diferentes.",
  },
  {
    id: 19,
    question:
      "¿Cómo es posible que ofrezcan mayores rendimientos si los bancos tradicionales dan 1-2 %?",
    answer:
      "Los bancos prestan tu dinero y se quedan la mayor parte del margen. En DeFi, tú prestas directamente tus euros digitales a otros usuarios o protocolos y te llevas casi todo el interés. Hyxora se encarga de elegir los sitios más seguros y rentables para que tú no tengas que buscarlos. Todo con un par de clics.",
  },
  {
    id: 20,
    question: "¿Qué pasa si el euro digital (stablecoin) que uso pierde valor?",
    answer:
      'En Hyxora solo trabajamos con stablecoins de máxima seguridad, liquidez y regulados (USDC, EURC, USDT regulado). Todos están respaldados 1:1 por euros o dólares en cuentas bancarias auditadas mensualmente. El riesgo de "depeg" es prácticamente cero en las opciones que ofrecemos.',
  },
  {
    id: 21,
    question: "¿Puedo retirar mi dinero cuando quiera o hay un plazo mínimo?",
    answer:
      "Liquidez total. Puedes pasar de vuelta a euros y enviarlos a cualquier banco en segundos, 24/7, sin plazos mínimos ni penalización.",
  },
  {
    id: 22,
    question: "¿De verdad no guardan mis claves privadas como hacen la mayoría?",
    answer:
      "No. Desde el primer día tus criptoactivos están en una wallet de la que solo tú tienes las claves y el acceso. Ni nosotros podemos tocarlos pero si podemos hacer que desde la app las recuperes en caso de pérdida de forma totalmente encriptada.",
  },
  {
    id: 23,
    question: "¿Cómo funcionan las remesas o transferencias internacionales?",
    answer:
      "Si tanto el emisor como el destinatario están en Hyxora, puedes hacer una transferencia inmediata por Crypto de una Wallet a otra sin costo y en segundos desde cualquier parte del mundo. Es uno de nuestros productos estrella. Si la otra persona no está en Hyxora, es exactamente igual pero tendrá un costo, pequeño pero lo tendrá.",
  },
  {
    id: 24,
    question: "¿Qué son los Founder y qué ventajas extras tienen?",
    answer:
      "Son cupos limitados para los pioneros que además recibirán un 10% conjunto del Equity de Hyxora pasando a ser Co-fundadores. Además, tienen privilegios específicos como la suscripción gratuita Premium de por vida, no tienen o si tienen fees , son aun más bajos que en Premium y Basic, acceso al Comité Consultivo, accesos exclusivos y reconocimiento especial en la comunidad. Para más info, ve a la sección de www.hyxora.com/nftfounder",
  },
  {
    id: 25,
    question: "¿Hyxora va a seguir añadiendo más productos DeFi?",
    answer:
      "Sí. Roadmap 2026-2027: lending (préstamos con garantía), pools de liquidez propios, tarjetas crypto internacionales sin conversión, crédito sobre colateral crypto y más canastas avanzadas.",
  },
  {
    id: 26,
    question: "¿Puedo crear mis propias canastas personalizadas?",
    answer:
      "Sí pero en un futuro próximo. En Premium tendrás un editor de canastas donde puedes elegir porcentajes y protocolos tú mismo.",
  },
  {
    id: 27,
    question: "¿Habrá gobernanza para que los usuarios voten nuevas funcionalidades?",
    answer:
      "Sí. Los poseedores del NFT Founder ya forman parte del comité consultivo. Para el. Resto de usuarios existirán fórmulas de comunicación general para consultas también.",
  },
  {
    id: 28,
    question: "¿Las comunidades tendrán su espacio?",
    answer:
      "Por supuesto, Hyxora es un proyecto basado en la Comunidad por lo que estamos diseñando como otras comunidades pueden encontrar en Hyxora una herramienta de ordenar y monetizar sus comunidades. Si eres Comunidad, Influencer, o tienes gente que te apoya, ponte en contacto con future@hyxora.com y te daremos una visión de lo que estamos creando para ti.",
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
            <rect y="9" width="2" height="16" rx="1" transform="rotate(-90 0 9)" fill="#19363f" />
          </svg>
        </div>
      </div>
      <AnimateHeight
        duration={500}
        height={isOpen ? "auto" : 0}
        easing="cubic-bezier(0.33, 1, 0.68, 1)"
      >
        <div className="mt-[16px] pt-[16px] border-t border-[rgba(25,54,63,0.1)] w-full">
          <div className="font-inter text-[16px] leading-[24px] tracking-[-0.64px] text-[rgba(25,54,63,0.7)]">
            {item.answer}
          </div>
        </div>
      </AnimateHeight>
    </button>
  );
};

const FAQ = ({ showFullList = false }) => {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    const isOpening = openId !== id;
    haptic(isOpening ? "light" : "soft");
    setOpenId(isOpening ? id : null);
  };

  const displayedItems = showFullList
    ? faqItems
    : faqItems.filter((item) => [2, 3, 4, 5, 7, 24].includes(item.id));

  return (
    <section className="w-full flex justify-center px-4  ">
      <div
        className={`flex flex-col gap-[50px] items-center w-full ${
          showFullList ? "max-w-[900px]" : "max-w-[659px]"
        }`}
      >
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
          <div className="flex flex-col gap-[20px] w-full ">
            {displayedItems.map((item) => (
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
