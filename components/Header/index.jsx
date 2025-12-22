import Link from "next/link";
import Image from "@/components/Image";
import brandIMG from "@/assets/imgs/brand/logo.svg";
import trendingIcon from "@/assets//imgs/icons/trending.png";
import newListingsIcon from "@/assets/imgs/icons/newlisting.png";
import topGainersIcon from "@/assets/imgs/icons/topgainer.png";
import learningCenterIcon from "@/assets/imgs/icons/learning.png";
import bannerImage from "@/assets/imgs/brand/tokens.webp";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import Menu from "./Menu";
// import Icon from "@/components/Icon";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);
const MenuItem = ({ children, href = "#", ...props }) => {
  return (
    <Link
      href={href}
      className="box-border flex h-[28px] items-center justify-center p-[2px] relative rounded-[6px] shrink-0 hover:bg-[rgba(25,54,63,0.04)] transition-all"
      {...props}
    >
      <div className="box-border flex gap-[10px] items-center justify-center px-2 py-[6px] relative shrink-0">
        <span className="font-inter font-medium leading-6 text-[#19363f] text-[16px] whitespace-nowrap tracking-[-0.64px]">
          {children}
        </span>
      </div>
    </Link>
  );
};
const ExploreMenuItem = ({
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
const ExploreDropdown = () => {
  return (
    <div className="group relative">
      <button className="box-border flex h-[28px] items-center justify-center gap-2 p-[2px] relative rounded-[6px] shrink-0 hover:bg-[rgba(25,54,63,0.04)] transition-all">
        <div className="box-border flex gap-[10px] items-center justify-center px-2 py-[6px] relative shrink-0">
          <span className="font-inter font-medium leading-6 text-[#19363f] text-[16px] whitespace-nowrap tracking-[-0.64px]">
            Hxyora
          </span>
        </div>
      </button>

      {/* <div className="absolute top-full left-1/2  pt-4 -translate-x-1/2 transition-all group-hover:opacity-100 group-hover:visible  max-xl:left-[200px]"> */}
      <div className="absolute top-full left-1/2  pt-4 -translate-x-1/2 invisible opacity-0 transition-all group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto max-xl:left-[200px]">
        <div className="relative backdrop-blur-[15px] bg-[rgba(250,251,251)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-[10px] items-start overflow-clip p-[14px] rounded-[16px] shadow-[0px_3px_4px_-4px_rgba(25,54,63,0.05),0px_8px_8px_-4px_rgba(25,54,63,0.1)] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]">
          <div className="flex gap-[20px] items-stretch w-full h-[106px]">
            {/* Column 1 */}
            <div className="flex flex-col gap-[14px] flex-1">
              <ExploreMenuItem
                image={trendingIcon}
                title="Hyxora"
                description="Un neobanco hecho para ti"
                href="/"
              />
              <ExploreMenuItem
                image={newListingsIcon}
                title="Comité Consultivo"
                description="Accede a las Consultas"
                disabled
              />
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-[14px] flex-1">
              <ExploreMenuItem
                image={learningCenterIcon}
                title="Academia"
                description="Formate en Hyxora"
                disabled
              />
              <ExploreMenuItem
                image={topGainersIcon}
                title="Founders NFT"
                description="Espacio exclusivo"
                external
                href="https://founder.hyxora.com/"
              />
            </div>
            {/* Banner */}
            <div className="flex flex-1">
              <div
                className="relative flex items-end justify-center p-[12px] rounded-[12px] overflow-clip w-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 106px, rgba(17,68,186,1) 0%, rgba(15,57,148,1) 18.44%, rgba(13,47,109,1) 36.87%, rgba(11,37,70,1) 55.31%, rgba(9,26,31,1) 73.75%)",
                }}
              >
                {/* Background Image */}
                <div className="absolute flex items-center justify-center left-1/2 top-[-112px] -translate-x-1/2 w-[368px] h-[207px]">
                  <div className="scale-y-[-100%]">
                    <Image
                      src={bannerImage}
                      alt=""
                      width={368}
                      height={207}
                      className="w-[368px] h-[207px] object-cover"
                    />
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-between w-full">
                  <p className="font-inter font-normal text-[12px] text-white tracking-[-0.48px] w-[149px] leading-normal">
                    <span className="text-[rgba(255,255,255,0.6)]">
                      Unete a tu neobanco
                    </span>
                    <br />
                    <span>Hyxora</span>
                  </p>
                  <div className="backdrop-blur-[25px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.02)] border-solid rounded-[16px] shadow-[0px_6px_4px_-4px_rgba(0,0,0,0.05),0px_12px_8px_-4px_rgba(0,0,0,0.05)] shadow-[0px_0px_4px_0px_inset_rgba(255,255,255,0.04)] size-[20px] flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      // className="rotate-[-90deg]"
                    >
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const OportunityDropdown = () => {
  const handleSmoothScroll = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      gsap.to(window, {
        scrollTo: {
          y: element,
          offsetY: 100,
          autoKill: true,
        },
        duration: 1.5,
        ease: "power3.inOut",
      });
    }
  };
  return (
    <div className="group relative">
      <button className="box-border flex h-[28px] items-center justify-center gap-2 p-[2px] relative rounded-[6px] shrink-0 hover:bg-[rgba(25,54,63,0.04)] transition-all">
        <div className="box-border flex gap-[10px] items-center justify-center px-2 py-[6px] relative shrink-0">
          <span className="font-inter font-medium leading-6 text-[#19363f] text-[16px] whitespace-nowrap tracking-[-0.64px]">
            Oportunidades DeFi
          </span>
        </div>
      </button>

      {/* <div className="absolute top-full left-1/2  pt-4 -translate-x-1/2 transition-all group-hover:opacity-100 group-hover:visible "> */}
      <div className="absolute top-full left-1/2  pt-4 -translate-x-1/2 invisible opacity-0 transition-all group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto">
        <div className="relative backdrop-blur-[15px] bg-[rgba(250,251,251)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-[10px] items-start overflow-clip p-[14px] rounded-[16px] shadow-[0px_3px_4px_-4px_rgba(25,54,63,0.05),0px_8px_8px_-4px_rgba(25,54,63,0.1)] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]">
          <div className="flex gap-[20px] items-stretch w-full h-[106px]">
            {/* Column 1 */}
            <div className="flex flex-col gap-[14px] flex-1">
              <ExploreMenuItem
                image={trendingIcon}
                title="DeFi"
                description="Qué es DeFi"
                onClick={() => handleSmoothScroll("#opportunities-section")}
              />
              <ExploreMenuItem
                image={topGainersIcon}
                title="Oportunidades"
                description="Oportunidades en Hyxora"
                onClick={() => handleSmoothScroll("#opportunities-section")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const Header = ({ isFixed }) => {
  return (
    <>
      <div
        className={`relative z-20 backdrop-blur-[10px] bg-[rgba(255,255,255,0.8)] border-b border-white box-border   w-full ${
          isFixed ? "fixed! top-0 left-0 right-0" : ""
        }`}
      >
        <div className="box-border max-w-[1440px] w-full flex items-center h-[52px] px-[50px] py-3 mx-auto max-md:px-4 max-md:py-[10px]">
          {/* Logo */}
          <div className="flex items-center justify-start gap-2 flex-1">
            <Link href="/" className="flex gap-2 items-center shrink-0  ">
              <div className="relative shrink-0 size-6">
                <Image
                  className="w-full h-full object-contain"
                  src={brandIMG}
                  width={24}
                  height={24}
                  alt="Logo"
                />
              </div>
              <span className="font-inter font-semibold leading-6 text-[#19363f] text-[18px] whitespace-nowrap tracking-[-0.72px]">
                Hyxora
              </span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex gap-[18px] items-center justify-center flex-1 max-md:hidden">
            <ExploreDropdown />
            <MenuItem
              href="https://founder.hyxora.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NFT Founders
            </MenuItem>
            <OportunityDropdown />
            <MenuItem href="/plans">Planes</MenuItem>
            <MenuItem href="/faq">FAQ</MenuItem>
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex items-center justify-end gap-[8px] flex-1 max-md:hidden ">
            {/* Hot Button */}
            <Link
              href="https://founder.hyxora.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-[30px] relative rounded-[100px] cursor-pointer"
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
          </div>
          <Menu />
        </div>
      </div>
    </>
  );
};

export default Header;
