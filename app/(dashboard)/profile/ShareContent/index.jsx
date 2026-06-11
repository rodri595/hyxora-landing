"use client";
import { useState } from "react";
import Tab from "../Tab";
import Icon from "@/components/Icon";
import InvoiceModal from "./InvoiceModal";

const ShareContent = () => {
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-start justify-between gap-[16px] flex-row! flex-wrap">
        <Tab
          className="w-full"
          icon={
            <Icon
              name={"pencil"}
              className="size-[16px] aspect-square"
              size={20}
            />
          }
          title="Factura"
          description="Rellena los datos de factución"
          onClick={() => setInvoiceOpen(true)}
        />
        <Tab
          className="w-full"
          icon={
            <Icon
              name={"message"}
              className="size-[16px] aspect-square"
              size={20}
            />
          }
          title="Contacto"
          description="Contacta con soporte"
          to="mailto:future@hyxora.com"
          target="_blank"
        />
        <Tab
          className="w-full"
          icon={
            <Icon
              name={"checkmark"}
              className="size-[16px] aspect-square"
              size={20}
            />
          }
          title="Terms & Conditions"
          description="Lee los términos y condiciones"
          to="/docs/2026_05_01_nft_terms.pdf"
          download="2026_05_01_nft_terms.pdf"
          target="_blank"
        />
        <Tab
          className="w-full"
          icon={
            <Icon
              name={"add-document"}
              className="size-[16px] aspect-square"
              size={20}
            />
          }
          title="Política de privacidad"
          description="Lee la política de privacidad"
          to="/privacy"
          target="_blank"
        />
        <Tab
          className="w-full"
          icon={
            <Icon
              name={"add-document"}
              className="size-[16px] aspect-square"
              size={20}
            />
          }
          title="Nota a los Founders"
          description="Descarga el documento FASE 1"
          to="/docs/nota-founders-fase1.pdf"
          download="nota-founders-fase1.pdf"
          target="_blank"
        />
      </div>

      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} />
    </>
  );
};

export default ShareContent;
