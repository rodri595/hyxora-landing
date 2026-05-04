"use client";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

const WelcomeModal = ({ open, onClose, onLogin }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      classWrapper="relative max-w-[560px] rounded-[20px] border border-[rgba(25,54,63,0.06)] bg-[rgba(250,251,251)] p-[40px] shadow-[0px_8px_24px_-4px_rgba(25,54,63,0.12)]"
      className="items-center justify-center"
    >
      <div className="flex flex-col gap-[28px]">
        <div className="flex flex-col gap-[16px]">
          <h2 className="font-inter font-medium text-[24px] leading-[32px] tracking-[-0.96px] text-[#19363f]">
            ¡Bienvenido a Hyxora!
          </h2>
          <p className="font-inter font-normal text-[15px] leading-[24px] tracking-[-0.3px] text-[rgba(25,54,63,0.7)]">
            Desde este momento tendrás acceso a todas las novedades del
            proyecto, entrada en nuestra comunidad para entablar conversaciones
            con otros usuarios, la plataforma de Hyxora y si quieres ir aún más
            allá y ser Co-propietario del proyecto, adquirir un NFT Founder
            (limitados).
          </p>
          <p className="font-inter font-normal text-[15px] leading-[24px] tracking-[-0.3px] text-[rgba(25,54,63,0.7)]">
            Entra en tu perfil desde la propia web, donde ya se ha creado tu
            wallet y tu dashboard con todos estos productos y funcionalidades.
          </p>
        </div>
        <Button isPrimary onClick={onLogin}>
          Acceder
        </Button>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
