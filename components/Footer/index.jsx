import Link from "next/link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import brandIMG from "@/assets/imgs/brand/logo.svg";

const MenuItem = ({ children, href = "#" }) => {
  return (
    <Link
      href={href}
      className="font-inter font-medium leading-6 text-[#19363f] text-[16px] whitespace-nowrap tracking-[-0.64px] transition-opacity hover:opacity-70"
    >
      {children}
    </Link>
  );
};

const SocialLink = ({ icon }) => {
  return (
    <Link
      href={"#"}
      className="relative shrink-0 size-6 transition-opacity hover:opacity-70"
      style={{
        filter:
          "drop-shadow(0px 6px 8px rgba(27, 95, 253, 0.15)) drop-shadow(0px 2px 4px rgba(27, 95, 253, 0.15))",
        boxShadow: "inset 0px 0px 3px rgba(255, 255, 255, 0.4)",
      }}
    >
      <Icon name={icon} className="w-full h-full" />
    </Link>
  );
};

const Footer = () => {
  return (
    <footer className="backdrop-blur-2.5 bg-[rgba(25,54,63,0.01)] border-t border-[rgba(25,54,63,0.02)] relative w-full">
      <div className="box-border flex flex-col gap-[50px] pb-3.5 pt-[40px] px-[50px] max-w-[1440px] mx-auto">
        {/* Top section with logo, menu, and social */}
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex gap-2 items-center shrink-0">
            <div className="relative shrink-0 size-6">
              <Image
                src={brandIMG}
                alt="Chainova"
                width={24}
                height={24}
                className="w-full h-full object-contain"
                style={{
                  filter:
                    "drop-shadow(0px 6px 8px rgba(27, 95, 253, 0.15)) drop-shadow(0px 2px 4px rgba(27, 95, 253, 0.15))",
                  boxShadow: "inset 0px 0px 3px rgba(255, 255, 255, 0.4)",
                }}
              />
            </div>
            <span className="font-inter font-semibold leading-6 text-[#19363f] text-[18px] whitespace-nowrap tracking-[-0.72px]">
              Hyxora
            </span>
          </Link>

          {/* Menu */}
          <nav className="flex gap-[34px] items-center">
            <MenuItem href="#explore">Explore</MenuItem>
            <MenuItem href="#marketplace">Marketplace</MenuItem>
            <MenuItem href="#docs">Docs</MenuItem>
            <MenuItem href="#community">Community</MenuItem>
          </nav>

          {/* Social Media */}
          <div className="flex gap-2.5 items-center">
            <SocialLink icon="verification" />
            <SocialLink icon="verification" />
            <SocialLink icon="verification" />
          </div>
        </div>

        {/* Bottom section with copyright and links */}
        <div className="bg-[rgba(25,54,63,0.02)] border border-[rgba(25,54,63,0.02)] flex items-center justify-between px-5 py-4 rounded-2xl w-full relative">
          <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px]">
            © 2025 Hyxora — Empowering the Future
          </p>

          <div className="flex gap-3.5 items-center">
            <Link
              href="#privacy"
              className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] whitespace-nowrap tracking-[-0.24px] transition-opacity hover:opacity-70"
            >
              Privacy Policy
            </Link>
            <div className="w-[0.5px] h-3.5 bg-[rgba(25,54,63,0.7)] " />
            <Link
              href="#terms"
              className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] whitespace-nowrap tracking-[-0.24px] transition-opacity hover:opacity-70"
            >
              Terms of Use
            </Link>
          </div>

          {/* Inner shadow effect */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]" />
        </div>
      </div>

      {/* Outer shadow effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]" />
    </footer>
  );
};

export default Footer;
