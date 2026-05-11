"use client";
import Modal from "@/components/Modal";
import Image from "@/components/Image";
import Button from "@/components/Button";
import { useWeb3 } from "@/context/Web3Provider";
import nftImg from "@/assets/imgs/brand/tokens.webp";
import fireSVG from "@/assets/imgs/icons/fire.svg";

const DETAILS = [
  { label: "Precio", value: "1.000 USDC" },
  { label: "Colección", value: "Hyxora Founder Pass" },
  { label: "Red", value: "Base" },
  { label: "Suministro", value: "Limitado" },
];

const PurchaseNFTModal = () => {
  const { isModalPurchaseNFTOpen, setIsModalPurchaseNFTOpen } = useWeb3();

  return (
    <Modal
      open={isModalPurchaseNFTOpen}
      onClose={() => setIsModalPurchaseNFTOpen(false)}
      hideCloseButton
      classWrapper="max-w-[790px] rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,18,18,0.95)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[16px] overflow-hidden"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={() => setIsModalPurchaseNFTOpen(false)}
        className="absolute right-4 top-4 z-10 flex items-center justify-center size-7 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* stacked shadows */}

      <div className="flex flex-col gap-5 p-5">
        {/* Badge */}
        <div className="flex items-center gap-1.5">
          <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center px-3 py-2 rounded-full">
            <p className="font-medium text-[12px] text-[rgba(255,255,255,0.70)] tracking-[-0.48px] leading-none">
              Fase 1 Pública ABIERTA
            </p>
          </div>
        </div>

        {/* NFT Image */}
        <Image
          src={nftImg}
          alt="Hyxora Founder Pass NFT"
          className="relative w-full h-auto rounded-xl object-cover"
        />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2">
          {DETAILS.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 p-3 rounded-[10px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]"
            >
              <span className="text-[rgba(255,255,255,0.50)] font-inter text-[11px] font-normal leading-none tracking-[-0.22px]">
                {label}
              </span>
              <span className="text-white font-inter text-[13px] font-medium leading-none tracking-[-0.26px]">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          className="w-full bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-11 relative rounded-[100px] cursor-pointer overflow-hidden"
        >
          <div className="flex gap-1.5 h-full items-center justify-center px-4 relative rounded-[inherit]">
            <Image src={fireSVG} alt="Fire Icon" className="size-3" />
            <p className="font-semibold text-[14px] text-[#f7f8f8] tracking-[-0.56px]">
              Comprar NFT
            </p>
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
            }}
          />
        </button>
      </div>
    </Modal>
  );
};

export default PurchaseNFTModal;
