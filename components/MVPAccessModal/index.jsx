"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Image from "@/components/Image";
import accessIMG from "./access.svg";

const MVPAccessModal = ({ open, onClose, onBack }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (email) {
      // handle submission
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      classWrapper="max-w-[500px] overflow-hidden"
    >
      <div className="flex flex-col gap-4 items-start overflow-clip pb-5 relative rounded-2xl w-full bg-[#FCFDFD]">
        <Image src={accessIMG} alt="Acceso MVP" className="w-full h-[150px]" />
        {/* Back button */}
        <Button
          isSecondary
          onClick={onBack}
          className="h-[30px]! absolute! top-5 left-5"
        >
          Volver
        </Button>

        {/* Title */}
        <p className="px-5 w-full font-medium leading-normal text-[24px] tracking-[-4%] text-left">
          Acceso MVP
        </p>
        <p className="px-5 w-full font-normal text-[14px] text-[rgba(25,54,63,0.7)] leading-normal">
          Déjanos tu email y te avisaremos cuando el MVP de Hyxora esté
          disponible.
        </p>
        {/* Email field */}
        <div className="px-5 w-full">
          <Field
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            validated={true}
          />
        </div>
        {/* Submit Button */}
        <div className="flex items-center justify-center px-5 relative shrink-0 w-full mt-2">
          <Button
            isPrimary
            onClick={handleSubmit}
            disabled={!email}
            className="w-full max-w-[300px]"
          >
            Registrarme
          </Button>
        </div>
        {/* Footer text */}
        <div className="flex items-center justify-center px-5 relative shrink-0">
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
  );
};

export default MVPAccessModal;
