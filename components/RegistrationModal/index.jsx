"use client";
import { useState } from "react";
import RegistrationOption from "@/components/RegistrationOption";
import Button from "@/components/Button";
import Image from "@/components/Image";
import userIMG from "./users.svg";
import Modal from "@/components/Modal";
import MVPAccessModal from "@/components/MVPAccessModal";
import NFTFoundersModal from "@/components/NFTFoundersModal";

const registrationOptions = [
  {
    id: "register-only",
    title: "Simple",
    description: "Quiero sólo registrarme",
    badgeText: "Registro",
    badgeVariant: "green",
    icon: "verification",
  },
  {
    id: "mvp-access",
    title: "Acceso MVP",
    description: "Quiero que me aviséis para tener acceso al MVP de Hyxora",
    badgeText: "Registro",
    badgeVariant: "green",
    icon: "cube",
  },
  {
    id: "nft-founders",
    title: "NFT Founders",
    description:
      "Quiero que me informéis cuando esté disponible la fase de compra de NFTs Founders para pertenecer al proyecto",
    badgeText: "Registro",
    badgeVariant: "green",
    icon: "envelope",
  },
];

const RegistrationModal = ({ open, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeSubModal, setActiveSubModal] = useState(null);

  const handleSubmit = () => {
    if (selectedOption === "mvp-access") {
      setActiveSubModal("mvp-access");
    }
    if (selectedOption === "nft-founders") {
      setActiveSubModal("nft-founders");
    }
  };

  const handleBack = () => {
    setActiveSubModal(null);
  };

  const handleClose = () => {
    setActiveSubModal(null);
    setSelectedOption(null);
    onClose();
  };

  return (
    <>
      <MVPAccessModal
        open={activeSubModal === "mvp-access"}
        onClose={handleClose}
        onBack={handleBack}
      />
      <NFTFoundersModal
        open={activeSubModal === "nft-founders"}
        onClose={handleClose}
        onBack={handleBack}
      />
      <Modal
        open={open && activeSubModal === null}
        onClose={handleClose}
        classWrapper="max-w-[500px] overflow-hidden"
      >
        <div className="flex flex-col gap-4 items-start overflow-clip pb-5 relative rounded-[16px]  w-full bg-[#FCFDFD]">
          <Image
            src={userIMG}
            alt="User registration"
            className="w-full h-[150px]"
          />
          {/* Title */}
          <p className="px-[20px] w-full font-medium leading-normal text-[24px] tracking-[-4%] text-left">
            Registrate en Hyxora
          </p>
          {/* Registration Options */}
          <div className="flex flex-col gap-[8px] items-start px-[14px] relative shrink-0 w-full">
            {registrationOptions.map((option) => (
              <RegistrationOption
                key={option.id}
                title={option.title}
                description={option.description}
                badgeText={option.badgeText}
                badgeVariant={option.badgeVariant}
                icon={option.icon}
                onClick={() => setSelectedOption(option.id)}
                selected={selectedOption === option.id}
              />
            ))}
          </div>
          {/* Submit Button */}
          <div className="flex items-center justify-center px-[20px] relative shrink-0 w-full mt-[16px]">
            <Button
              isPrimary
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="w-full max-w-[300px]"
            >
              Continuar
            </Button>
          </div>
          {/* Footer text */}
          <div className="flex items-center justify-center px-[20px] relative shrink-0">
            <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] leading-[18px] text-center">
              Al registrarte, aceptas nuestros{" "}
              <span className="font-inter font-medium text-[#19363f]">
                Términos de Uso
              </span>{" "}
              y{" "}
              <span className="font-inter font-medium text-[#19363f]">
                Política de Privacidad
              </span>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RegistrationModal;
