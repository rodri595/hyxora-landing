"use client";

import menuIcon from "@/assets/imgs/icons/menu.svg";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import trendingIcon from "@/assets//imgs/icons/trending.png";
import newListingsIcon from "@/assets/imgs/icons/newlisting.png";
import learningCenterIcon from "@/assets/imgs/icons/learning.png";
import topGainersIcon from "@/assets/imgs/icons/topgainer.png";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import fireSVG from "@/assets/imgs/icons/fire.svg";

gsap.registerPlugin(ScrollToPlugin);

// MenuItem component for the mobile menu
const MenuItem = ({
  icon,
  image,
  title,
  description,
  href,
  external = false,
  onClick,
  disabled = false,
  className = "",
  ...props
}) => {
  const content = (
    <>
      {(icon || image) && (
        <div className="bg-[rgba(25,54,63,0.04)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid  rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] flex justify-center items-center">
          {icon ? (
            icon
          ) : image ? (
            <Image
              src={image}
              alt={title}
              width={16}
              height={16}
              className="size-[16px] "
            />
          ) : null}
        </div>
      )}
      <div className="flex flex-col gap-[8px] items-start">
        <p
          className={`font-inter font-medium text-[14px] tracking-[-0.56px] leading-[14px] ${
            disabled ? "text-[rgba(25,54,63,0.4)]" : "text-[#19363f]"
          }`}
        >
          {title}
        </p>
        {description && (
          <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] whitespace-nowrap leading-[12px]">
            {description}
          </p>
        )}
      </div>
    </>
  );

  const baseClassName = `box-border flex gap-[15px] items-center p-[6px] relative rounded-[12px] shrink-0 ${
    disabled
      ? "cursor-not-allowed opacity-50"
      : "hover:bg-[rgba(25,54,63,0.02)] transition-all"
  } max-h-[46px] ${className}`;

  // If disabled, render as div
  if (disabled) {
    return <div className={baseClassName}>{content}</div>;
  }

  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button onClick={onClick} className={baseClassName}>
        {content}
      </button>
    );
  }

  // If external link, use anchor tag
  if (external || href) {
    return (
      <Link
        href={href}
        rel="noopener noreferrer"
        className={baseClassName}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Fallback: render as div
  return <div className={baseClassName}>{content}</div>;
};

const MenuComponent = () => {
  const [isActive, setIsActive] = useState(false);
  const lenis = useLenis();
  const menuRef = useRef(null);
  const contentRef = useRef(null);

  const toggleMenu = () => {
    setIsActive((prev) => !prev);
  };

  const handleSmoothScroll = (sectionId) => {
    // Close menu
    setIsActive(false);
    // Wait for menu animation to complete before scrolling
    setTimeout(() => {
      const element = document.querySelector(sectionId);
      if (element) {
        const offsetY = 100;
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offsetY,
          behavior: "smooth",
        });
      }
    }, 400);
  };

  // Prevent body scroll and stop Lenis when menu is open
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }

    return () => {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    };
  }, [isActive, lenis]);

  // Close menu when screen resizes above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (isActive && window.innerWidth >= 768) {
        setIsActive(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isActive]);

  // GSAP animation for menu
  useGSAP(() => {
    if (isActive) {
      gsap.set(menuRef.current, { display: "flex" });
      gsap.fromTo(
        menuRef.current,
        {
          x: "100%",
          opacity: 0,
        },
        {
          x: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        }
      );
      gsap.fromTo(
        contentRef.current,
        {
          //   y: 20,
          opacity: 0,
        },
        {
          //   y: 0,
          opacity: 1,
          duration: 0.4,
          delay: 0.2,
          ease: "power2.out",
        }
      );
    } else if (menuRef.current) {
      gsap.to(menuRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(menuRef.current, { display: "none" });
        },
      });
    }
  }, [isActive]);

  return (
    <div className="relative ">
      <button
        onClick={toggleMenu}
        type="button"
        className="group hidden max-md:flex rounded-[8px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.04)] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] justify-center items-center shrink-0 !h-[32px] !w-[32px] focus:outline-none"
      >
        {isActive ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#19363f"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <Image src={menuIcon} alt="Menu" className="w-[16px] h-[16px]" />
        )}
      </button>
      <div
        ref={menuRef}
        data-lenis-prevent
        className="fixed top-[52px] left-0 bottom-0 right-0 z-10 hidden flex-col w-full min-h-[calc(100vh-52px)] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(250,251,251)] focus:outline-none"
      >
        <div
          ref={contentRef}
          className="flex flex-col grow overflow-auto scroll-smooth scrollbar-none pb-6 px-4 pt-6"
        >
          <Link
            href="https://founder.hyxora.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-[30px] relative rounded-[100px] cursor-pointer mb-2"
          >
            <div className="flex gap-[3px] h-[30px] items-center justify-center overflow-hidden p-[8px] relative rounded-[inherit]">
              <Image
                src={fireSVG}
                alt="Fire Icon"
                className="relative w-[10px] h-[10px]"
              />
              <p className="font-medium text-[12px] text-[#f7f8f8] tracking-[-0.48px] whitespace-nowrap">
                NFT Founder
              </p>
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
              }}
            />
          </Link>
          {/* Explorar Section */}
          <div className="flex items-center justify-start py-0 mb-4">
            <p className="font-inter font-medium text-[#19363f] text-[16px] tracking-[-0.64px]">
              Explorar
            </p>
          </div>
          <div className="flex flex-col space-y-2 mb-6">
            <MenuItem
              image={trendingIcon}
              title="Hyxora"
              description="Un neobanco hecho para ti"
              className="w-full max-w-none"
              href={"/"}
            />
            <MenuItem
              image={newListingsIcon}
              title="Comité Consultivo"
              description="Accede a las Consultas"
              className="w-full max-w-none"
              disabled
            />
            <MenuItem
              image={learningCenterIcon}
              title="Academia"
              description="Formate en Hyxora"
              className="w-full max-w-none"
              disabled
            />
            <MenuItem
              image={topGainersIcon}
              title="Founders NFT"
              description="Espacio exclusivo"
              className="w-full max-w-none"
              external
              href="https://founder.hyxora.com"
              target="_blank"
            />
          </div>
          {/* Información Section */}
          <div className="flex items-center justify-start py-0 mb-4">
            <p className="font-inter font-medium text-[#19363f] text-[16px] tracking-[-0.64px]">
              Información
            </p>
          </div>
          <div className="flex flex-col space-y-2 mb-6">
            <MenuItem
              image={newListingsIcon}
              title="Planes"
              href="/plans"
              className="w-full max-w-none"
            />
            <MenuItem
              image={newListingsIcon}
              title="Preguntas Frecuentes"
              href="/faq"
              className="w-full max-w-none"
            />
            <MenuItem
              image={newListingsIcon}
              title="Roadmap"
              onClick={() => handleSmoothScroll("#roadmap")}
              className="w-full max-w-none"
            />
          </div>
          {/* Recursos Section */}
          <div className="flex items-center justify-start py-0 mb-4">
            <p className="font-inter font-medium text-[#19363f] text-[16px] tracking-[-0.64px]">
              Recursos
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <MenuItem
              icon={<Icon name="verification" className="w-[16px] h-[16px] " />}
              title="Documentación"
              disabled
              className="w-full max-w-none"
            />
            <MenuItem
              icon={<Icon name="verification" className="w-[16px] h-[16px] " />}
              title="Blog"
              disabled
              className="w-full max-w-none"
            />
            <MenuItem
              icon={<Icon name="verification" className="w-[16px] h-[16px] " />}
              title="Soporte"
              disabled
              className="w-full max-w-none"
            />
          </div>
          <div className="flex flex-col mt-auto pt-4 border-t space-y-1">
            <p className="font-normal text-[12px] leading-[18px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px]">
              {/* <span>Al conectar tu billetera, aceptas nuestros </span> */}
              <Link href="/terms" className="font-medium text-[#19363f]">
                Términos de Uso
              </Link>
              <span> y </span>
              <Link href="/privacy" className="font-medium text-[#19363f]">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuComponent;
