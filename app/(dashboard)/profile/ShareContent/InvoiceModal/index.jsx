"use client";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

const InvoiceModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose} classWrapper="max-w-[500px] overflow-hidden">
      <div className="flex flex-col gap-4 items-start pb-5 relative rounded-[16px] w-full bg-[#FCFDFD]">
        {/* Header */}
        <div className="px-[20px] pt-[20px] flex flex-col gap-1">
          <p className="font-medium leading-normal text-[24px] tracking-[-0.04em] text-[#19363F]">
            Solicitar Factura
          </p>
          <p className="text-[14px] text-[#5E7279]">
            Te ayudaremos con tu factura
          </p>
        </div>

        <div className="px-[20px] w-full flex flex-col gap-4">
          <p className="text-[14px] text-[rgba(25,54,63,0.8)] leading-[1.5]">
            Envíanos un correo a{" "}
            <span className="font-semibold text-[#19363F]">future@hyxora.com</span>{" "}
            con tus datos completos para la factura:
          </p>

          <ul className="flex flex-col gap-[10px]">
            {[
              "Nombre completo o Razón Social",
              "DNI o CIF",
              "Dirección completa con CP y país",
              "Si puedes desgravarte el impuesto",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-[8px] text-[13px] text-[rgba(25,54,63,0.75)] leading-[1.5]"
              >
                <span className="mt-[3px] shrink-0 size-[6px] rounded-full bg-[#19363F] opacity-40" />
                {item}
              </li>
            ))}
          </ul>

          <p className="text-[13px] text-[rgba(25,54,63,0.55)] leading-[1.5]">
            Te la haremos llegar lo antes posible.
          </p>

          <a
            href="mailto:future@hyxora.com?subject=Solicitud de Factura&body=Hola,%0D%0A%0D%0ASolicito mi factura con los siguientes datos:%0D%0A%0D%0ANombre completo o Razón Social:%0D%0ADNI o CIF:%0D%0ADirección:%0D%0ACódigo Postal:%0D%0APaís:%0D%0A¿Puedes desgravarte el impuesto? (Sí/No):%0D%0A%0D%0AGracias."
            className="w-full mt-1"
          >
            <Button isPrimary className="w-full">
              Enviar solicitud
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
