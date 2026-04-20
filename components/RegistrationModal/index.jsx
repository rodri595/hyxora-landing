"use client";
import { useState } from "react";
import Button from "@/components/Button";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import userIMG from "./users.svg";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import { useLoopsContact } from "@/hooks/useLoopsContact";

const RegistrationModal = ({ open, onClose }) => {
  const [activeSubModal, setActiveSubModal] = useState(null);
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const { submit, loading, error, success, reset } = useLoopsContact();

  const handleSubmit = async () => {
    if (!email || !accepted) return;
    await submit({ email, source: "Landing page" });
  };

  const handleClose = () => {
    setActiveSubModal(null);
    reset();
    setEmail("");
    setAccepted(false);
    onClose();
  };

  return (
    <>
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
            Mantente al día con Hyxora
          </p>
          {/* Bullet points */}
          <div className="flex flex-col gap-2 px-[20px] w-full">
            <p className="font-inter font-medium text-[12px] text-[rgba(25,54,63,0.5)] uppercase tracking-[0.06em]">
              Te mantendremos informado:
            </p>
            {[
              "La fecha de lanzamiento del MVP Beta de Hyxora",
              "La apertura de la Fase 1 de venta de NFTs Founders (sólo 350 unidades disponibles para 2026). Forma parte del proyecto",
              "Noticias relevantes: avances del proyecto, newsletter y nuestro nuevo podcast",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                  <Icon name="check" className="w-4 h-4 fill-primary2" />
                </div>
                <p className="text-[13px] tracking-[-0.01em] leading-[1.5] text-[#19363f]">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 w-full">
            <Field
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // validated={true}
            />
          </div>

          {/* Consent checkbox */}
          <div className="px-5 w-full flex items-start gap-3">
            <input
              id="mvp-consent"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-[2px] shrink-0 accent-[#19363f] cursor-pointer w-4 h-4"
            />
            <label
              htmlFor="mvp-consent"
              className="font-normal text-[12px] text-[rgba(25,54,63,0.7)] leading-[18px] cursor-pointer"
            >
              Acepto que HYXORA FINANCE SL se ponga en contacto conmigo para
              fines informativos y promocionales.
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-5 w-full">
              <p className="text-[12px] text-red-500 leading-[1.4]">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="px-5 w-full flex items-center gap-2">
              <Icon name="check" className="w-4 h-4 fill-primary2 shrink-0" />
              <p className="text-[13px] text-[#19363f] font-medium leading-[1.4]">
                ¡Listo! Te avisaremos cuando haya novedades.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-center px-[20px] relative shrink-0 w-full mt-[16px]">
            <Button
              isPrimary
              onClick={handleSubmit}
              disabled={loading || !email || !accepted || success}
              className="w-full max-w-[300px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Registrando..."
                : success
                  ? "¡Registrado!"
                  : "Solo con tu Email"}
            </Button>
          </div>
          {/* Footer text */}
          <div className="flex items-start flex-col justify-center px-[20px] relative shrink-0">
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
            <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] leading-[18px] text-center">
              Contact con nosotros en{" "}
              <span className="font-inter font-medium text-[#19363f]">
                future@hyxora.com
              </span>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RegistrationModal;
