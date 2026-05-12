"use client";
import Link from "next/link";
import Button from "@/components/Button";
import Image from "@/components/Image";
import Error from "@/components/Error";
import Spinner from "@/components/Spinner";
import Field from "@/components/Field";
import userIMG from "./users.svg";
import Modal from "@/components/Modal";
import { useState } from "react";
import { useLoopsContact } from "@/hooks/user/useLoopsContact";
import { cn } from "@/utils";
const LOGIN_OPTIONS = {
  NEWSLETTER: "NEWSLETTER",
  PRIVY: "PRIVY",
};

const WelcomeModal = ({ open, onClose, onLogin }) => {
  const {
    submit,
    loading: isLoadingNewsletter,
    error: isErrorNewsletter,
    success: isSuccessNewsletter,
  } = useLoopsContact();

  const [option, setOption] = useState(null);
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // const isButtonDisabled =
  //   !option ||
  //   !acceptedTerms ||
  //   (option === LOGIN_OPTIONS.NEWSLETTER && !email.trim());

  const onSubmit = (e) => {
    e.preventDefault();
    if (option === LOGIN_OPTIONS.NEWSLETTER) {
      submit({ email, list: "newsletter" });
    } else if (option === LOGIN_OPTIONS.PRIVY) {
      onLogin?.();
    }
  };

  if (isSuccessNewsletter) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        classWrapper="max-w-[500px] overflow-hidden"
      >
        <div className="flex flex-col gap-4 items-center pb-5 px-[20px] rounded-[16px] w-full bg-[#FCFDFD]">
          <p className="w-full font-medium leading-normal text-[24px] tracking-[-4%] text-left mt-4">
            ¡Gracias por suscribirte!
          </p>
          <p className="text-[14px] text-[#5E7279]">
            Te mantendremos informado de todas las novedades de Hyxora.
          </p>
          <Button isPrimary onClick={onClose} className="w-full mt-2">
            Cerrar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      classWrapper="max-w-[500px] overflow-hidden"
    >
      <div className="flex flex-col gap-4 items-start overflow-clip pb-5 relative rounded-[16px] w-full bg-[#FCFDFD]">
        <Image
          src={userIMG}
          alt="User registration"
          className="w-full h-[150px]"
        />

        {/* Title */}
        <p className="px-[20px] w-full font-medium leading-normal text-[24px] tracking-[-4%] text-left">
          ¡Bienvenido a Hyxora!
        </p>

        <form
          className="flex flex-col gap-[16px] px-[20px] w-full"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-3">
            <p className="text-[16px] font-medium text-[#19363f] mb-4">
              Dinos cómo quieres estar dentro de Hyxora:
            </p>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="loginOption"
                value={LOGIN_OPTIONS.NEWSLETTER}
                checked={option === LOGIN_OPTIONS.NEWSLETTER}
                onChange={() => setOption(LOGIN_OPTIONS.NEWSLETTER)}
                required
                className="accent-[#19363f] w-4 h-4 shrink-0"
              />
              <span className="text-[#19363F] leading-[18px] font-inter text-[12px] font-semibold tracking-[-0.24px]">
                Sólo quiero estar informado de novedades
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="loginOption"
                value={LOGIN_OPTIONS.PRIVY}
                checked={option === LOGIN_OPTIONS.PRIVY}
                onChange={() => setOption(LOGIN_OPTIONS.PRIVY)}
                required
                className="accent-[#19363f] w-4 h-4 shrink-0"
              />
              <span className="text-[#19363F] leading-[18px] font-inter text-[12px] font-semibold tracking-[-0.24px]">
                Quiero ser usuario de Hyxora y/o NFT Founder
              </span>
            </label>
          </div>

          {/* Email field — only shown for newsletter option */}
          {option === LOGIN_OPTIONS.NEWSLETTER && (
            <Field
              label="Tu email"
              placeholder="Email"
              type="email"
              required={option === LOGIN_OPTIONS.NEWSLETTER}
              validated={
                option === LOGIN_OPTIONS.NEWSLETTER && email.trim() !== ""
              }
              disabled={option !== LOGIN_OPTIONS.NEWSLETTER}
              className={cn(
                "",
                option !== LOGIN_OPTIONS.NEWSLETTER &&
                  "cursor-not-allowed opacity-50",
              )}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          {/* Terms */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              className="accent-[#19363f] w-4 h-4 shrink-0"
            />
            <span className=" text-[rgba(25,54,63,0.70)] leading-[18px] font-inter text-[12px] font-normal tracking-[-0.24px]">
              Al usar la plataforma aceptas nuestros{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-[#19363F] font-bold"
              >
                Términos de Uso
              </Link>{" "}
              y nuestra{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="text-[#19363F] font-bold"
              >
                Política de Privacidad
              </Link>
            </span>
          </label>
          {isLoadingNewsletter ? (
            <Spinner className="size-[80px]" />
          ) : (
            <Button
              isPrimary
              type="submit"
              disabled={isLoadingNewsletter}
              className="w-full"
            >
              Acceder
            </Button>
          )}
          <Error
            error={isErrorNewsletter}
            message={
              isErrorNewsletter?.response?.data?.message ||
              "Ocurrió un error al suscribirse al newsletter."
            }
          />
        </form>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
