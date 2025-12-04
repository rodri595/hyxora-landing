"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import AnimateHeight from "react-animate-height";

const faqItems = [
  {
    id: 1,
    question: "What is Web3?",
    answer:
      "Web3 is the next evolution of the internet, built on blockchain technology. It enables decentralized applications, digital ownership, and peer-to-peer transactions without intermediaries.",
  },
  {
    id: 2,
    question: "What can I own in Web3?",
    answer:
      "In Web3, you can own digital assets like cryptocurrencies, NFTs (non-fungible tokens), domain names, and virtual land. These assets are secured by blockchain technology and can be freely traded.",
  },
  {
    id: 3,
    question: "How do I get started?",
    answer:
      "To get started with Web3, you'll need a digital wallet like MetaMask, some cryptocurrency, and a basic understanding of blockchain technology. Start small and learn as you go.",
  },
  {
    id: 4,
    question: "Do I need technical knowledge?",
    answer:
      "While some technical knowledge helps, it's not required to get started. Many Web3 platforms are designed to be user-friendly. You can learn the basics through tutorials and practice.",
  },
  {
    id: 5,
    question: "Are my assets safe?",
    answer:
      "Your assets are as safe as your security practices. Use strong passwords, enable two-factor authentication, never share your private keys, and use reputable wallets and platforms.",
  },
  {
    id: 6,
    question: "Can I use my assets outside this site?",
    answer:
      "Yes! That's one of the key benefits of Web3. Your assets are stored on the blockchain and can be used across different compatible platforms and applications.",
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
          <span className="text-[rgba(25,54,63,0.6)]">Got Questions? </span>
          <span className="text-[#19363f]">We&apos;ve Got Answers</span>
        </h2>

        {/* Content */}
        <div className="flex flex-col gap-[30px] items-center w-full">
          {/* Subtitle */}
          <p className="font-inter font-medium text-[16px] leading-[24px] tracking-[-0.64px] text-[#19363f] text-center">
            Crypto FAQ, AI-Powered for Speed & Clarity
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
