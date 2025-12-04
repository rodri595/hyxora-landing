"use client";
import { useState, useEffect, useRef } from "react";
import Image from "@/components/Image";
import Button from "@/components/Button";
import checkSVG from "@/assets/imgs/icons/check.svg";
import gsap from "gsap";

const CTA = () => {
  const [email, setEmail] = useState("");
  const marqueeRef = useRef(null);

  const features = [
    "Early access to marketplace launches",
    "Weekly insights from our research team",
    "Airdrop & whitelist alerts",
  ];

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const firstSet = marquee.children[0];
    const marqueeWidth = firstSet.offsetWidth;

    // Create infinite loop animation
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(marquee, {
      x: -marqueeWidth,
      duration: 20,
      ease: "none",
    }).set(marquee, { x: 0 });

    return () => {
      tl.kill();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribing:", email);
  };

  return (
    <section className="flex flex-col gap-10 items-center w-full py-20 max-w-[886px] mx-auto">
      {/* Text Section */}
      <div className="flex flex-col gap-7 items-center text-center w-full max-w-[495px]">
        <h2 className="font-medium text-[40px] leading-normal tracking-[-1.6px] text-[#19363f]">
          <span className="text-[rgba(25,54,63,0.6)]">Stay Ahead in </span>
          <span className="text-[#19363f]">Web3</span>
        </h2>
        <p className="font-normal text-[16px] leading-[24px] tracking-[-0.32px] text-[rgba(25,54,63,0.7)]">
          Subscribe to our newsletter and get the latest updates, alpha drops,
          and crypto trends — straight to your inbox.
        </p>
      </div>

      {/* Features Section  */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={marqueeRef}
          className="flex gap-6 items-center will-change-transform"
        >
          {/* First set of features */}
          <div className="flex gap-6 items-center shrink-0">
            {features.map((feature, index) => (
              <div
                key={`first-${index}`}
                className="flex gap-2.5 items-center shrink-0"
              >
                <Image
                  src={checkSVG}
                  alt="Check"
                  className="relative w-5 h-5"
                />
                <p className="font-medium text-[16px] leading-[24px] tracking-[-0.64px] text-[#19363f] whitespace-nowrap">
                  {feature}
                </p>
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-6 items-center shrink-0">
            {features.map((feature, index) => (
              <div
                key={`second-${index}`}
                className="flex gap-2.5 items-center shrink-0"
              >
                <Image
                  src={checkSVG}
                  alt="Check"
                  className="relative w-5 h-5"
                />
                <p className="font-medium text-[16px] leading-[24px] tracking-[-0.64px] text-[#19363f] whitespace-nowrap">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Left blur */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[140px] h-10 pointer-events-none z-10"
          style={{
            backdropFilter: "blur(2px)",
            background:
              "linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)",
          }}
        />
        {/* Right blur */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[140px] h-10 pointer-events-none z-10"
          style={{
            backdropFilter: "blur(2px)",
            background:
              "linear-gradient(270deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)",
          }}
        />
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex items-center justify-between px-5 pr-4 py-4 rounded-[16px] w-full  relative"
        style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          className="font-normal text-[16px] leading-[24px] tracking-[-0.32px] text-[rgba(25,54,63,0.5)] bg-transparent border-none outline-none flex-1 placeholder:text-[rgba(25,54,63,0.5)]"
          required
        />
        <Button type="submit" isPrimary>
          Subscribe
        </Button>
      </form>
    </section>
  );
};

export default CTA;
