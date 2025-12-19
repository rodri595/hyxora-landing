import Link from "next/link";
import Image from "@/components/Image";
// import Icon from "@/components/Icon";
import brandIMG from "@/assets/imgs/brand/logo.svg";
import twitterIMG from "@/assets/imgs/icons/twitter.svg";
import discordIMG from "@/assets/imgs/icons/discord.svg";
import telegramIMG from "@/assets/imgs/icons/telegram.svg";

const MenuItem = ({ children, href = "#", ...props }) => {
  return (
    <Link
      href={href}
      className="font-inter font-medium leading-6 text-[#19363f] text-[16px] whitespace-nowrap tracking-[-0.64px] transition-opacity hover:opacity-70"
      {...props}
    >
      {children}
    </Link>
  );
};

const SocialLink = ({ icon }) => {
  return (
    <Link
      href={"#"}
      className="relative shrink-0 transition-opacity hover:opacity-70 flex items-center  justify-center"
      style={{
        filter:
          "drop-shadow(0px 6px 8px rgba(27, 95, 253, 0.15)) drop-shadow(0px 2px 4px rgba(27, 95, 253, 0.15))",
        boxShadow: "inset 0px 0px 3px rgba(255, 255, 255, 0.4)",
      }}
    >
      <Image src={icon} className="size-6 " alt="Social Icon" />
    </Link>
  );
};

const Footer = () => {
  return (
    <footer className="backdrop-blur-[10px] bg-[rgba(25,54,63,0.01)] border-t-[0.7px] border-[rgba(25,54,63,0.02)] relative w-full  ">
      <div className="box-border flex flex-col gap-[50px] max-md:gap-[30px] pb-3.5 max-md:pb-0 pt-[40px] max-md:pt-[30px] px-[50px] max-md:px-0 max-w-[1440px] mx-auto max-md:mx-none">
        {/* Top section with logo, menu, and social */}
        <div className="flex items-center justify-between w-full max-md:px-4">
          {/* Logo */}
          <Link href="/" className="flex gap-2 items-center shrink-0">
            <div className="relative shrink-0 size-6">
              <Image
                src={brandIMG}
                alt="Hyxora"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-inter font-semibold leading-6 text-[#19363f] text-[18px] whitespace-nowrap tracking-[-0.72px]">
              Hyxora
            </span>
          </Link>

          {/* Menu - Hidden on mobile */}
          <nav className="hidden lg:flex gap-[34px] items-center">
            <MenuItem href="/">Hyxora</MenuItem>
            <MenuItem
              href="https://founder.hyxora.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NFT Founders
            </MenuItem>
            <MenuItem href="/plans">Planes</MenuItem>
            <MenuItem href="/faq">FAQ</MenuItem>
          </nav>

          {/* Social Media */}
          <div className="flex gap-2.5 max-md:gap-2.5 items-center">
            <SocialLink icon={twitterIMG} />
            <SocialLink icon={discordIMG} />
            <SocialLink icon={telegramIMG} />
          </div>
        </div>

        {/* Bottom section with copyright and links */}
        <div className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] flex items-center justify-between px-5 max-md:px-4 py-4 max-md:py-4 rounded-2xl max-md:rounded-none w-full relative">
          <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] leading-normal max-md:w-[138px]">
            © 2025 Hyxora — Empowering the Future
          </p>

          <div className="flex gap-3.5 max-md:gap-2 items-center">
            <Link
              href="#privacy"
              className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] whitespace-nowrap tracking-[-0.24px] transition-opacity hover:opacity-70 leading-normal"
            >
              Privacy Policy
            </Link>
            <div className="w-[0.5px] h-3.5 bg-[rgba(25,54,63,0.7)]" />
            <Link
              href="#terms"
              className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] whitespace-nowrap tracking-[-0.24px] transition-opacity hover:opacity-70 leading-normal"
            >
              Terms of Use
            </Link>
          </div>

          {/* Inner shadow effect */}
          <div className="absolute inset-0 pointer-events-none max-md:rounded-none rounded-2xl shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]" />
        </div>
      </div>

      {/* Outer shadow effect */}
      <div className="absolute  inset-0 pointer-events-none shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]" />
    </footer>
  );
};

export default Footer;
