import Link from "next/link";
import Button from "@/components/Button";
import Image from "@/components/Image";
import brandIMG from "@/assets/imgs/brand/logo.svg";
import trendingIcon from "@/assets//imgs/icons/trending.png";
import newListingsIcon from "@/assets/imgs/icons/newlisting.png";
import topGainersIcon from "@/assets/imgs/icons/topgainer.png";
import learningCenterIcon from "@/assets/imgs/icons/learning.png";
import menuIcon from "@/assets/imgs/icons/menu.svg";
import bannerImage from "@/assets/imgs/brand/tokens.gif";

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

const ExploreMenuItem = ({ icon, title, description, href = "#" }) => {
  return (
    <Link
      href={href}
      className="box-border flex gap-[15px] items-center p-[6px] relative rounded-[12px] shrink-0 w-[217px] hover:bg-[rgba(25,54,63,0.02)] transition-all h-[46px]"
    >
      <div className="bg-[rgba(25,54,63,0.04)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid overflow-clip relative rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]">
        <div className="absolute left-1/2 size-[16px] top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src={icon}
            alt={title}
            width={16}
            height={16}
            className="size-full object-cover"
          />
        </div>
      </div>
      <div className="flex flex-col gap-[8px] items-start">
        <p className="font-inter font-medium text-[#19363f] text-[14px] tracking-[-0.56px]">
          {title}
        </p>
        <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] whitespace-nowrap">
          {description}
        </p>
      </div>
    </Link>
  );
};

const ExploreDropdown = () => {
  return (
    <div className="group relative">
      <button className="box-border flex h-[28px] items-center justify-center gap-2 p-[2px] relative rounded-[6px] shrink-0 hover:bg-[rgba(25,54,63,0.04)] transition-all">
        <div className="box-border flex gap-[10px] items-center justify-center px-2 py-[6px] relative shrink-0">
          <span className="font-inter font-medium leading-6 text-[#19363f] text-[16px] whitespace-nowrap tracking-[-0.64px]">
            Explore
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
                icon={trendingIcon}
                title="Trending Tokens"
                description="Top tokens right now"
                href="#trending"
              />
              <ExploreMenuItem
                icon={newListingsIcon}
                title="New Listings"
                description="New coins released"
                href="#new-listings"
              />
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-[14px] flex-1">
              <ExploreMenuItem
                icon={topGainersIcon}
                title="Top Gainers"
                description="Daily rise and fall of tokens"
                href="#top-gainers"
              />
              <ExploreMenuItem
                icon={learningCenterIcon}
                title="Learning Center"
                description="Complete crypto guide"
                href="#learning-center"
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
                      Connect your
                    </span>
                    <span> wallet to Unlock Full Features</span>
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

const Header = ({ isFixed }) => {
  return (
    <>
      <div
        className={`relative z-2 backdrop-blur-[10px] bg-[rgba(255,255,255,0.8)] border-b border-white box-border   w-full ${
          isFixed ? "fixed! top-0 left-0 right-0" : ""
        }`}
      >
        <div className="box-border max-w-[1440px] w-full flex items-center justify-between h-[52px] px-[50px] py-3 mx-auto max-md:px-4 max-md:py-[10px]">
          {/* Logo */}
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

          {/* Navigation Menu */}
          <nav className="flex gap-[18px] items-center max-md:hidden">
            <ExploreDropdown />
            <MenuItem href="#marketplace">Marketplace</MenuItem>
            <MenuItem href="#docs">Docs</MenuItem>
            <MenuItem href="#community">Community</MenuItem>
          </nav>

          {/* Connect Wallet Button */}
          <Button
            className="!h-[28px] !px-[16px] !py-2 !text-[14px] !leading-normal min-w-[128px] max-md:hidden"
            isPrimary
          >
            Connect Wallet
          </Button>
          <button className="hidden max-md:flex rounded-[8px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.04)] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]   justify-center items-center shrink-0    !h-[32px] !w-[32px]">
            <Image src={menuIcon} alt="Menu" className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
