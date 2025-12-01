import Link from "next/link";
import Button from "@/components/Button";
import Image from "@/components/Image";
import logoSVG from "@/assets/imgs/9227b6b82e10d20532ace45ef9881def5ccc2b4b.svg";

const MenuItem = ({ children, href = "#" }) => {
  return (
    <Link
      href={href}
      className="box-border flex h-[28px] items-center justify-center p-[2px] relative rounded-[6px] shrink-0 hover:bg-[rgba(25,54,63,0.04)] transition-all"
    >
      <div className="box-border flex gap-[10px] items-center justify-center px-2 py-[6px] relative shrink-0">
        <span className="font-inter font-medium leading-6 text-[#19363f] text-[16px] whitespace-nowrap tracking-[-0.64px]">
          {children}
        </span>
      </div>
    </Link>
  );
};

const Header = ({ isFixed }) => {
  return (
    <>
      <div
        className={`relative z-50 backdrop-blur-[10px] bg-[rgba(255,255,255,0.8)] border-b border-white box-border flex items-center justify-between h-[52px] px-[50px] py-[12px] ${
          isFixed ? "fixed! top-0 left-0 right-0" : ""
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex gap-2 items-center shrink-0">
          <div className="relative shrink-0 size-6">
            <Image
              className="w-full h-full object-contain"
              style={{
                filter:
                  "drop-shadow(0px 6px 8px rgba(27, 95, 253, 0.15)) drop-shadow(0px 2px 4px rgba(27, 95, 253, 0.15))",
                boxShadow: "inset 0px 0px 3px rgba(255, 255, 255, 0.4)",
              }}
              src={logoSVG}
              width={24}
              height={24}
              alt="Logo"
            />
          </div>
          <span className="font-inter font-semibold leading-6 text-[#19363f] text-[18px] whitespace-nowrap tracking-[-0.72px]">
            Hyxora
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex gap-[18px] items-center">
          <MenuItem href="#explore">Explore</MenuItem>
          <MenuItem href="#marketplace">Marketplace</MenuItem>
          <MenuItem href="#docs">Docs</MenuItem>
          <MenuItem href="#community">Community</MenuItem>
        </nav>

        {/* Connect Wallet Button */}
        <Button
          className="!h-[28px] !px-[16px] !py-2 !text-[14px] !leading-normal min-w-[128px]"
          isPrimary
        >
          Connect Wallet
        </Button>
      </div>
    </>
  );
};

export default Header;
