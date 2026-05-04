"use client";
import Button from "@/components/Button";
import Image from "@/components/Image";
import userIMG from "./users.svg";
import Modal from "@/components/Modal";
const WelcomeModal = ({ open, onClose, onLogin }) => {
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
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
            ¡Bienvenido a Hyxora!
          </p>
          <div className="flex flex-col gap-[32px] px-[20px] w-full">
            <p className="text-[13px] tracking-[-0.01em] leading-[1.5] text-[#19363f]">
              Desde este momento tendrás acceso a todas las novedades del
              proyecto, entrada en nuestra comunidad para entablar
              conversaciones con otros usuarios, la plataforma de Hyxora y si
              quieres ir aún más allá y ser Co-propietario del proyecto,
              adquirir un NFT Founder (limitados).
            </p>
            <p className="text-[13px] tracking-[-0.01em] leading-[1.5] text-[#19363f]">
              Entra en tu perfil desde la propia web, donde ya se ha creado tu
              wallet y tu dashboard con todos estos productos y funcionalidades.
            </p>
          </div>
          <div className="flex flex-col gap-2 px-[20px] w-full mt-[16px]">
            <Button isPrimary onClick={onLogin}>
              Acceder
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WelcomeModal;
