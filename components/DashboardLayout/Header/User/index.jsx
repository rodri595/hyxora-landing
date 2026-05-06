import { Menu, MenuButton } from "@headlessui/react";
import { useWeb3 } from "@/context/Web3Provider";
import newListingIMG from "@/assets/imgs/icons/white-seeding.png";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { shortenAddress } from "@/utils";
const User = () => {
  const { smartWalletAddress } = useWeb3();
  return (
    <Menu className="relative" as="div">
      <MenuButton className="flex gap-[4px] justify-center items-center">
        <Icon name="chevron" size={20} className="aspect-square size-[16px]" />
        <div className="bg-[#1b5ffd] size-[20px] rounded-full flex items-center justify-center shrink-0 p-[4px]">
          <Image src={newListingIMG} alt="Fire Icon" className="w-full " />
        </div>
        <span className="text-[#19363F] font-inter text-[14px] font-bold tracking-[-0.56px] leading-[16px]">
          {shortenAddress(smartWalletAddress)}
        </span>
      </MenuButton>
    </Menu>
  );
};

export default User;
