"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import Error from "@/components/Error";
import Image from "@/components/Image";
import { useWeb3 } from "@/context/Web3Provider";
import { useCreatePaymentLink } from "@/hooks/useCreatePaymentLink";
import Spinner from "@/components/Spinner";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import shieldSVG from "@/assets/imgs/icons/shield-check.svg";
import { copyToClipboard } from "@/utils";

import posterIMG from "@/assets/imgs/brand/poster.jpeg";
import Video from "@/components/Video";
const FEATURES = [
  "Propiedad Real",
  "Privilegios Vitalicios",
  "Comité consultivo",
  "Transmisible",
  "Diferenciación",
];

const UNITS_AVAILABLE = 350;
const PRICE = "3.000€";
const PRICEIVA = "3.630€ (IVA incluido)";
const DEFAULT_CONCEPT = "Compra NFT Founder_";
/* ─── Dark inline checkbox ─── */
const DarkCheckbox = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <div
      className={`shrink-0 size-4 rounded-sm border transition-all flex items-center justify-center ${
        checked
          ? "bg-[#1b5ffd] border-[#1b5ffd]"
          : "bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.15)]"
      }`}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <span className="text-[11px] text-[rgba(255,255,255,0.55)] leading-none tracking-[-0.22px]">
      {children}
    </span>
  </label>
);

/* ─── Copy button ─── */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 flex items-center justify-center size-5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.12)]"
      style={{ background: "rgba(255,255,255,0.06)" }}
      title="Copiar"
    >
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 12 10" fill="none">
          <path
            d="M1 5L4.5 8.5L11 1"
            stroke="#4ade80"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <rect
            x="5"
            y="5"
            width="9"
            height="9"
            rx="1.5"
            stroke="rgba(255,255,255,0.50)"
            strokeWidth="1.5"
          />
          <path
            d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
            stroke="rgba(255,255,255,0.50)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
};

/* ─── Main component ─── */
const PurchaseNFTModal = () => {
  const { isModalPurchaseNFTOpen, setIsModalPurchaseNFTOpen } = useWeb3();
  const {
    mutateAsync,
    isPending,
    error: paymentLinkError,
  } = useCreatePaymentLink();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [refBy, setRefBy] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'stripe' | 'crypto' | 'bank'

  const handleClose = () => {
    setIsModalPurchaseNFTOpen(false);
    // Reset on close
    setTimeout(() => {
      setStep(1);
      setUsername("");
      setRefBy("");
      setAccepted(false);
      setPaymentMethod(null);
    }, 300);
  };

  const canProceed = username.trim().length > 0 && accepted;

  const handlePaymentContinue = async () => {
    if (paymentMethod === "bank") {
      setStep(3);
      return;
    }
    if (paymentMethod === "stripe") {
      const { link } = await mutateAsync({
        type: "Stripe",
        username,
        refBy: refBy || undefined,
      });
      window.location.href = link;
    } else if (paymentMethod === "crypto") {
      const { link } = await mutateAsync({
        type: "Crypto",
        username,
        refBy: refBy || undefined,
      });
      window.location.href = link;
    }
  };

  return (
    <Modal
      open={isModalPurchaseNFTOpen}
      onClose={handleClose}
      hideCloseButton
      classWrapper="max-w-[560px] rounded-[24px] border-[0.7px] border-[rgba(255,255,255,0.06)] bg-[#0D0D0D] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px]  overflow-hidden relative"
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-4 top-4 z-20 flex items-center justify-center size-7 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 p-5">
        {/* ── Header row: badge + step dots ── */}
        <div className="flex items-center justify-between">
          {/* Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
            style={{
              background: "rgba(27,95,253,0.15)",
              borderColor: "rgba(27,95,253,0.35)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M7 1L2 7h4.5L5 11l5-6H6L7 1z"
                fill="#60a5fa"
                stroke="#60a5fa"
                strokeWidth="0.4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[11px] font-semibold text-[#60a5fa] tracking-[-0.22px] leading-none">
              Fase 1 Pública ABIERTA
            </span>
          </div>
        </div>
        {/* ── Title ── */}
        <h2 className="text-white font-semibold text-[18px] tracking-[-0.54px] leading-tight">
          NFT Founder de Hyxora
        </h2>
        {step !== 3 && step !== 4 && (
          <>
            {/* ── Two-column: features + NFT image ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Features list */}
              <div
                className="flex flex-col justify-center gap-2.5 p-4 rounded-[14px] border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <span className="text-[#f5a623] text-[13px] leading-none">
                      –
                    </span>
                    <span className="text-[rgba(255,255,255,0.80)] text-[12px] font-medium tracking-[-0.24px] leading-none">
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {/* NFT image with badge */}
              <div className="relative rounded-[14px] overflow-hidden border border-[rgba(245,166,35,0.35)]">
                {/* EDICIÓN LIMITADA badge */}
                <div
                  className="absolute top-2 left-1  z-10 px-2 py-1 rounded-full flex items-center gap-1"
                  style={{
                    background: "rgba(245,166,35,0.20)",
                    border: "1px solid rgba(245,166,35,0.50)",
                  }}
                >
                  <span className="text-[9px] font-bold text-[#f5a623] tracking-[0.5px] uppercase leading-none whitespace-nowrap">
                    Edición Limitada
                  </span>
                </div>
                <Image
                  src={posterIMG}
                  className="w-full h-full  hidden! max-md:flex!"
                  alt="Item Option"
                  priority
                />
                <Video
                  className="w-full h-full   max-md:hidden"
                  src={"/videos/key_card_2.webm"}
                  poster={posterIMG}
                  type="video"
                  playsInline
                  autoPlay
                  muted
                  loop
                />
              </div>
            </div>

            {/* ── Price / availability row ── */}
            <div
              className="grid grid-cols-2 gap-px rounded-[14px] overflow-hidden border"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              {/* Units */}
              <div
                className="flex flex-col gap-1 px-4 py-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-[10px] text-[rgba(255,255,255,0.45)] tracking-[-0.2px] leading-none">
                  Unidades disponibles
                </span>
                <span className="text-white font-semibold text-[16px] tracking-[-0.48px] leading-tight">
                  {UNITS_AVAILABLE}
                </span>
              </div>

              {/* Price */}
              <div
                className="flex flex-col gap-1 px-4 py-3 border-l"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <span className="text-[10px] text-[rgba(255,255,255,0.45)] tracking-[-0.2px] leading-none">
                  Precio por NFT
                </span>
                <span className="text-white font-semibold text-[16px] tracking-[-0.48px] leading-tight">
                  {PRICE}
                </span>
                <span className="text-[9px] text-[rgba(255,255,255,0.30)] leading-tight tracking-[-0.18px]">
                  *Precio final con IVA (3.630€). La devolución del IVA
                  dependerá de tu situación fiscal.
                </span>
              </div>
            </div>
          </>
        )}
        {/* ── Step 1: form ── */}
        {step === 1 && (
          <>
            {/* Username + refBy row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Username field */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-white tracking-[-0.24px]">
                  Nombre de Usuario
                  <span className="text-[#1b5ffd] ml-0.5">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)] text-[14px] tracking-tighter">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.slice(0, 15))}
                    placeholder="Aparecerá en tu NFT"
                    maxLength={15}
                    className="w-full h-9 pl-7 pr-3 rounded-[10px] text-[12px] text-white placeholder:text-[rgba(255,255,255,0.30)] transition-colors outline-none"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(27,95,253,0.60)";
                      e.target.style.background = "rgba(255,255,255,0.09)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border =
                        "1px solid rgba(255,255,255,0.10)";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                    }}
                  />
                </div>

                <span className="text-[10px] text-[rgba(255,255,255,0.35)] tracking-[-0.2px]">
                  Máximo 15 caracteres.
                </span>
              </div>

              {/* Referral code field */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-white tracking-[-0.24px]">
                  Código de referido
                  <span className="text-[rgba(255,255,255,0.35)] ml-1 font-normal text-[11px]">
                    (opcional)
                  </span>
                </label>

                <input
                  type="text"
                  value={refBy}
                  onChange={(e) => setRefBy(e.target.value)}
                  placeholder="Ej: ABC123"
                  className="w-full h-9 px-3 rounded-[10px] text-[12px] text-white placeholder:text-[rgba(255,255,255,0.30)] transition-colors outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(27,95,253,0.60)";
                    e.target.style.background = "rgba(255,255,255,0.09)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.10)";
                    e.target.style.background = "rgba(255,255,255,0.06)";
                  }}
                />

                <span className="text-[10px] text-[rgba(255,255,255,0.35)] tracking-[-0.2px]">
                  Si alguien te refirió, ponlo aquí.
                </span>
              </div>
            </div>

            {/* Terms checkbox */}
            <DarkCheckbox
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            >
              Acepto los{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-[rgba(255,255,255,0.70)] underline hover:text-white transition-colors"
              >
                Términos y Condiciones
              </Link>
              .
            </DarkCheckbox>

            {/* CTA */}
            <button
              type="button"
              disabled
              // disabled={!canProceed}
              onClick={() => setStep(2)}
              className="w-full h-11 relative rounded-[100px] cursor-pointer overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{
                background: canProceed
                  ? "linear-gradient(135deg, #1b5ffd 0%, #0d40c8 100%)"
                  : "rgba(27,95,253,0.5)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <div className="flex gap-2 h-full items-center justify-center px-4">
                <Image src={fireSVG} alt="" className="size-3.5" />
                <span className="font-semibold text-[13px] text-white tracking-[-0.52px]">
                  Continuar
                </span>
              </div>
              <div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                  boxShadow: "inset 0 0 12px rgba(255,255,255,0.15)",
                }}
              />
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5">
              <Image src={shieldSVG} alt="" className="size-3 opacity-40" />
              <span className="text-[10px] text-[rgba(255,255,255,0.35)] tracking-[-0.2px]">
                Pago seguro y cifrado
              </span>
            </div>
          </>
        )}

        {/* ── Step 2: choose payment method ── */}
        {step === 2 && (
          <>
            {/* Summary card */}
            <div
              className="flex flex-col gap-3 p-4 rounded-[14px] border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-[11px] text-[rgba(255,255,255,0.50)] tracking-[-0.22px] uppercase font-semibold">
                Resumen del pedido
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[rgba(255,255,255,0.75)] tracking-[-0.26px]">
                  NFT Founder de Hyxora
                </span>
                <span className="text-[13px] font-semibold text-white tracking-[-0.26px]">
                  {PRICE}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-2.5">
                <span className="text-[12px] text-[rgba(255,255,255,0.50)] tracking-[-0.24px]">
                  Nombre de usuario
                </span>
                <span className="text-[12px] font-medium text-[#60a5fa] tracking-[-0.24px]">
                  @{username}
                </span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-white tracking-[-0.24px]">
                Elige tu método de pago
                <span className="text-[#1b5ffd] ml-0.5">*</span>
              </label>

              {/* Stripe */}
              <button
                type="button"
                onClick={() => setPaymentMethod("stripe")}
                className="flex items-center gap-3 w-full p-3.5 rounded-xl border text-left transition-all"
                style={{
                  background:
                    paymentMethod === "stripe"
                      ? "rgba(27,95,253,0.12)"
                      : "rgba(255,255,255,0.03)",
                  borderColor:
                    paymentMethod === "stripe"
                      ? "rgba(27,95,253,0.55)"
                      : "rgba(255,255,255,0.08)",
                }}
              >
                {/* Radio dot */}
                <div
                  className="shrink-0 size-4 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor:
                      paymentMethod === "stripe"
                        ? "#1b5ffd"
                        : "rgba(255,255,255,0.25)",
                  }}
                >
                  {paymentMethod === "stripe" && (
                    <div className="size-2 rounded-full bg-[#1b5ffd]" />
                  )}
                </div>
                {/* Icon */}
                <div
                  className="shrink-0 size-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      stroke="rgba(255,255,255,0.60)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M2 10h20"
                      stroke="rgba(255,255,255,0.60)"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="5"
                      y="14"
                      width="4"
                      height="2"
                      rx="0.5"
                      fill="rgba(255,255,255,0.60)"
                    />
                  </svg>
                </div>
                {/* Label */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-white tracking-[-0.26px]">
                    Tarjeta de crédito
                  </span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.40)] tracking-[-0.22px]">
                    Pago seguro con Stripe
                  </span>
                </div>
              </button>

              {/* Crypto */}
              <button
                type="button"
                onClick={() => setPaymentMethod("crypto")}
                className="flex items-center gap-3 w-full p-3.5 rounded-xl border text-left transition-all"
                style={{
                  background:
                    paymentMethod === "crypto"
                      ? "rgba(27,95,253,0.12)"
                      : "rgba(255,255,255,0.03)",
                  borderColor:
                    paymentMethod === "crypto"
                      ? "rgba(27,95,253,0.55)"
                      : "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="shrink-0 size-4 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor:
                      paymentMethod === "crypto"
                        ? "#1b5ffd"
                        : "rgba(255,255,255,0.25)",
                  }}
                >
                  {paymentMethod === "crypto" && (
                    <div className="size-2 rounded-full bg-[#1b5ffd]" />
                  )}
                </div>
                <div
                  className="shrink-0 size-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="rgba(255,255,255,0.60)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 8.5h4a2 2 0 0 1 0 4H9v4M9 8.5V7M9 16.5v1.5M13 12.5h1a2 2 0 0 1 0 4H9"
                      stroke="rgba(255,255,255,0.60)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-white tracking-[-0.26px]">
                    Cripto (USDC)
                  </span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.40)] tracking-[-0.22px]">
                    3.000 USDC en la red Base
                  </span>
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className="flex items-center gap-3 w-full p-3.5 rounded-xl border text-left transition-all"
                style={{
                  background:
                    paymentMethod === "bank"
                      ? "rgba(27,95,253,0.12)"
                      : "rgba(255,255,255,0.03)",
                  borderColor:
                    paymentMethod === "bank"
                      ? "rgba(27,95,253,0.55)"
                      : "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="shrink-0 size-4 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor:
                      paymentMethod === "bank"
                        ? "#1b5ffd"
                        : "rgba(255,255,255,0.25)",
                  }}
                >
                  {paymentMethod === "bank" && (
                    <div className="size-2 rounded-full bg-[#1b5ffd]" />
                  )}
                </div>
                <div
                  className="shrink-0 size-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 10.5L12 4l9 6.5"
                      stroke="rgba(255,255,255,0.60)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="2"
                      y="19"
                      width="20"
                      height="2"
                      rx="1"
                      fill="rgba(255,255,255,0.60)"
                    />
                    <rect
                      x="5"
                      y="11"
                      width="3"
                      height="8"
                      rx="0.5"
                      fill="rgba(255,255,255,0.60)"
                    />
                    <rect
                      x="10.5"
                      y="11"
                      width="3"
                      height="8"
                      rx="0.5"
                      fill="rgba(255,255,255,0.60)"
                    />
                    <rect
                      x="16"
                      y="11"
                      width="3"
                      height="8"
                      rx="0.5"
                      fill="rgba(255,255,255,0.60)"
                    />
                  </svg>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-white tracking-[-0.26px]">
                    Transferencia Bancaria
                  </span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.40)] tracking-[-0.22px]">
                    IBAN · Hyxora Finance SL
                  </span>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={!paymentMethod || isPending}
                onClick={() => handlePaymentContinue()}
                className="w-full h-11 relative rounded-[100px] cursor-pointer overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, #1b5ffd 0%, #0d40c8 100%)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <div className="flex gap-2 h-full items-center justify-center px-4">
                  {isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <>
                      <Image src={fireSVG} alt="" className="size-3.5" />
                      <span className="font-semibold text-[13px] text-white tracking-[-0.52px]">
                        Continuar
                      </span>
                    </>
                  )}
                </div>
                <div
                  className="absolute inset-0 pointer-events-none rounded-[inherit]"
                  style={{
                    boxShadow: "inset 0 0 12px rgba(255,255,255,0.15)",
                  }}
                />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full h-9 rounded-[100px] cursor-pointer transition-colors text-[12px] text-[rgba(255,255,255,0.45)] hover:text-[rgba(255,255,255,0.70)] tracking-[-0.24px]"
              >
                ← Volver
              </button>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5">
              <Image src={shieldSVG} alt="" className="size-3 opacity-40" />
              <span className="text-[10px] text-[rgba(255,255,255,0.35)] tracking-[-0.2px]">
                Pago seguro y cifrado
              </span>
            </div>
            <Error
              error={paymentLinkError}
              className="bg-transparent"
              message={
                paymentLinkError?.response?.data?.message ||
                paymentLinkError?.message ||
                "Ha ocurrido un error al generar el enlace de pago. Por favor, inténtalo de nuevo."
              }
            />
          </>
        )}

        {/* ── Step 3: bank transfer details ── */}
        {step === 3 && (
          <>
            <h3 className="text-white font-semibold text-[15px] tracking-[-0.45px] leading-tight -mt-1">
              Finaliza tu compra mediante transferencia
            </h3>

            {/* Intro box */}
            <div
              className="px-4 py-3 rounded-xl border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-[11px] text-[rgba(255,255,255,0.50)] tracking-[-0.22px] leading-relaxed text-center">
                Para adquirir tu NFT, realiza una transferencia bancaria con los
                siguientes datos:
              </p>
            </div>

            {/* Bank details + note */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left: bank data */}
              <div
                className="flex flex-col gap-2.5 p-4 rounded-[14px] border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[rgba(255,255,255,0.40)] tracking-[-0.2px]">
                    • Importe:
                  </span>
                  <span className="text-[12px] font-semibold text-white tracking-[-0.24px]">
                    {PRICEIVA}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[rgba(255,255,255,0.40)] tracking-[-0.2px]">
                    • IBAN:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-white tracking-[-0.22px] break-all">
                      ES64 0182 0187 2902 0163 5449
                    </span>
                    <CopyButton text="ES64 0182 0187 2902 0163 5449" />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[rgba(255,255,255,0.40)] tracking-[-0.2px]">
                    • Beneficiario:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-white tracking-[-0.24px]">
                      Hyxora Finance SL
                    </span>
                    <CopyButton text="Hyxora Finance SL" />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[rgba(255,255,255,0.40)] tracking-[-0.2px]">
                    • CIF:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-white tracking-[-0.24px]">
                      B24879702
                    </span>
                    <CopyButton text="B24879702" />
                  </div>
                </div>
              </div>

              {/* Right: reassurance note */}
              <div
                className="flex items-center p-4 rounded-[14px] border"
                style={{
                  background: "rgba(27,95,253,0.07)",
                  borderColor: "rgba(27,95,253,0.40)",
                }}
              >
                <p className="text-[12px] font-semibold text-white tracking-[-0.24px] leading-relaxed">
                  No te preocupes, te mandaremos un mail con estos datos de la
                  transferencia para que los tengas a mano.
                </p>
              </div>
            </div>

            {/* Concepto field */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-white tracking-[-0.24px]">
                Concepto
                <span className="text-[#1b5ffd] ml-0.5">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={DEFAULT_CONCEPT + username}
                  placeholder="Tu nombre completo"
                  className="w-full h-9 px-3 rounded-[10px] text-[12px] text-white placeholder:text-[rgba(255,255,255,0.30)] transition-colors outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(27,95,253,0.60)";
                    e.target.style.background = "rgba(255,255,255,0.09)";
                  }}
                  readOnly
                />
                <CopyButton text={DEFAULT_CONCEPT + username} />
              </div>
            </div>

            <p className="text-[9px] text-[rgba(255,255,255,0.30)] tracking-[-0.18px] leading-relaxed -mt-1">
              *Precio final con IVA. La aplicación o devolución del IVA
              dependerá de tu país y situación fiscal. Más adelante podrás
              rellenar un formulario para solicitar no pagarlo o recuperarlo, si
              corresponde.
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 h-11 rounded-[100px] cursor-pointer transition-colors text-[12px] font-medium text-[rgba(255,255,255,0.60)] hover:text-white tracking-[-0.24px] border border-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.20)]"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                Volver
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={async () => {
                  try {
                    await mutateAsync({
                      type: "Transfer",
                      username,
                      refBy,
                      referenceNumber: DEFAULT_CONCEPT + username,
                    });
                    setStep(4);
                  } catch {
                    toast.error(
                      "Error al procesar la transferencia. Inténtalo de nuevo.",
                    );
                  }
                }}
                className="flex-2 h-11 relative rounded-[100px] cursor-pointer overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, #1b5ffd 0%, #0d40c8 100%)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <div className="flex gap-2 h-full items-center justify-center px-4">
                  {isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <span className="font-semibold text-[13px] text-white tracking-[-0.52px]">
                      Confirmar Transferencia
                    </span>
                  )}
                </div>
                <div
                  className="absolute inset-0 pointer-events-none rounded-[inherit]"
                  style={{
                    boxShadow: "inset 0 0 12px rgba(255,255,255,0.15)",
                  }}
                />
              </button>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5">
              <Image src={shieldSVG} alt="" className="size-3 opacity-40" />
              <span className="text-[10px] text-[rgba(255,255,255,0.35)] tracking-[-0.2px]">
                Pago seguro y cifrado
              </span>
            </div>
          </>
        )}

        {/* ── Step 4: success ── */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-5 py-3">
            {/* Checkmark */}
            <div
              className="flex items-center justify-center size-14 rounded-full"
              style={{
                background: "rgba(27,95,253,0.15)",
                border: "1.5px solid rgba(27,95,253,0.40)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5L9.5 17L19 7"
                  stroke="#1b5ffd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Heading */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-[13px] font-bold text-[#1b5ffd] tracking-[0.5px] uppercase leading-tight">
                Proceso realizado correctamente
              </p>
              <p className="text-[14px] font-semibold text-white tracking-[-0.42px] leading-tight">
                Esperamos tu transferencia a:
              </p>
            </div>

            {/* Bank details card */}
            <div
              className="w-full flex flex-col gap-3 p-5 rounded-[16px] border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.09)",
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[rgba(255,255,255,0.45)] tracking-[-0.22px]">
                  • Importe:
                </span>
                <span className="text-[13px] font-semibold text-white tracking-[-0.26px]">
                  {PRICEIVA}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[rgba(255,255,255,0.45)] tracking-[-0.22px]">
                  • IBAN:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-white tracking-[-0.26px]">
                    ES64 0182 0187 2902 0163 5449
                  </span>
                  <CopyButton text="ES64 0182 0187 2902 0163 5449" />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[rgba(255,255,255,0.45)] tracking-[-0.22px]">
                  • Beneficiario:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-white tracking-[-0.26px]">
                    Hyxora Finance SL
                  </span>
                  <CopyButton text="Hyxora Finance SL" />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[rgba(255,255,255,0.45)] tracking-[-0.22px]">
                  • CIF:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-white tracking-[-0.26px]">
                    B24879702
                  </span>
                  <CopyButton text="B24879702" />
                </div>
              </div>
            </div>

            {/* Concept reminder */}
            <div
              className="w-full px-4 py-3 rounded-[12px] border text-center"
              style={{
                background: "rgba(27,95,253,0.07)",
                borderColor: "rgba(27,95,253,0.30)",
              }}
            >
              <p className="text-[12px] text-[#60a5fa] tracking-[-0.24px] leading-relaxed">
                No te olvides de poner el concepto en la transferencia para que
                sea más fácil tu identificación
              </p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <p className="text-[13px] font-semibold text-white tracking-[-0.26px]">
                  Compra NFT Founder_{username}
                </p>
                <CopyButton text={`Compra NFT Founder_${username}`} />
              </div>
            </div>

            {/* Welcome */}
            <p className="text-[15px] font-bold text-white tracking-[-0.45px]">
              Bienvenid@ a Hyxora
            </p>

            {/* Close */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-11 relative rounded-[100px] cursor-pointer overflow-hidden transition-opacity"
              style={{
                background: "linear-gradient(135deg, #1b5ffd 0%, #0d40c8 100%)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <span className="font-semibold text-[13px] text-white tracking-[-0.52px]">
                Cerrar
              </span>
              <div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.15)" }}
              />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PurchaseNFTModal;
