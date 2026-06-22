import Link from "next/link";
import Image from "@/components/Image";
// import Icon from "@/components/Icon";
import brandIMG from "@/assets/imgs/brand/logo.svg";
import linkedinIMG from "@/assets/imgs/icons/linkedin.svg";
import instagramIMG from "@/assets/imgs/icons/instagram.svg";
import whatsappIMG from "@/assets/imgs/icons/whatsapp.svg";

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

const SocialLink = ({ icon, href = "#" }) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 transition-opacity hover:opacity-70 flex items-center  justify-center bg-[#19363f] rounded-full size-[24px] border-[rgba(255,255,255,0.2)] text-white fill-white shadow-[0px_0px_10px_0px_inset_rgba(255,255,255,0.4)] hover:shadow-[0px_0px_15px_0px_inset_rgba(255,255,255,0.5)]"
    >
      <Image src={icon} className="size-[12px] " alt="Social Icon" />
    </Link>
  );
};

const Footer = () => {
  return (
    <footer className="backdrop-blur-[10px] bg-[rgba(25,54,63,0.01)] border-t-[0.7px] border-[rgba(25,54,63,0.02)] relative w-full  max-md:pb-[60px]">
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
            <SocialLink
              icon={linkedinIMG}
              href="https://www.linkedin.com/company/hyxora/posts/?feedView=all"
            />
            <SocialLink
              icon={instagramIMG}
              href="https://www.instagram.com/hyxoraapp/?%20target_user_id=80202938321&ndid=6513e60030263H12ac77b7d1H6513ea999053%205H2d&utm_source=instagram&utm_medium=email&utm_campaign=find_friend_acti%20vity_email&click_source=profile&__bp=1"
            />
            <SocialLink
              icon={whatsappIMG}
              href="https://whatsapp.com/channel/0029VbCoQ1P11ulXrUUV191l"
            />
          </div>
        </div>

        {/* Bottom section with copyright and links */}
        <div className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] flex items-center justify-between px-5 max-md:px-4 py-4 max-md:py-4 rounded-2xl max-md:rounded-none w-full relative">
          <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] leading-normal max-md:w-[138px]">
            © 2026 Hyxora - Derechos reservados
          </p>

          <div className="flex gap-3.5 max-md:gap-2 items-center">
            <Link
              href="/privacy"
              target="_blank"
              className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] whitespace-nowrap tracking-[-0.24px] transition-opacity hover:opacity-70 leading-normal"
            >
              Política de privacidad
            </Link>
            <div className="w-[0.5px] h-3.5 bg-[rgba(25,54,63,0.7)]" />
            <Link
              href="/terms"
              target="_blank"
              className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] whitespace-nowrap tracking-[-0.24px] transition-opacity hover:opacity-70 leading-normal"
            >
              Términos de uso
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
