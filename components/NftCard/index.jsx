import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Field from "@/components/Field";
import Button from "@/components/Button";
import { getTransactionUrl } from "@/utils/explorer";

const InfoPoint = ({ label, value }) => (
  <div className="flex justify-start items-center gap-[10px] flex-1">
    <div className="flex size-[34px] items-center justify-center aspect-square rounded-[8px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.06)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
      <Icon name="verification" className="size-[14px]" fill={"white"} />
    </div>
    <div className="flex flex-col gap-[4px] items-start">
      <span className="text-[rgba(255,255,255,0.70)] font-inter text-[12px] font-normal leading-[16px] tracking-[-0.24px]">
        {label}
      </span>
      <span className="text-white font-inter text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
        {value}
      </span>
    </div>
  </div>
);

const NftCard = ({ payment, onVatRefund }) => {
  const { tokenId, imageUrl, invoiceNumber, updatedAt, txHash, type, _id } =
    payment;

  const purchaseDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="relative max-w-[386px] mx-auto w-full flex items-center justify-center">
      {/* shadow 2 */}
      <div className="absolute w-[calc(100%-80px)] h-[calc(100%+16px)] top-[8px] left-[40px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] " />
      {/* shadow 1 */}
      <div className="absolute w-[calc(100%-40px)] h-[calc(100%+8px)] top-[4px] left-[20px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] " />
      {/* CONTAINER */}
      <div className="flex flex-col-reverse p-[20px] items-center h-full gap-[20px] w-full flex-1 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-md:flex-col max-md:gap-[24px] max-md:p-[24px]">
        {/* LEFT */}
        <div className="flex flex-col items-start gap-[16px] flex-1 h-full w-full">
          <div className="flex flex-col gap-[20px] items-start w-full">
            {/* Token badge */}
            <div className="bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.06)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
              <p className="font-medium text-[12px] text-[rgba(255,255,255,0.70)] tracking-[-0.48px] leading-[9px]">
                Hyxora Founder Pass #{tokenId}
              </p>
            </div>

            {/* NFT Image */}
            <Image
              src={imageUrl}
              alt={`NFT Hyxora #${tokenId}`}
              width={100}
              height={200}
              className="rounded-[10px] w-full h-auto "
              //   unoptimized
            />
            {/* Title */}
            {/* <span className="text-[rgba(255,255,255,0.70)] font-inter text-[16px] font-normal leading-[24px] tracking-[-0.32px]">
              NFT Hyxora
            </span> */}
          </div>

          <div className="flex flex-col gap-[20px] items-start self-stretch w-full">
            {txHash && (
              <Field
                label="Transacción"
                className="w-full"
                value={txHash}
                readOnly
                isDark
                validated
                icon="external-link"
                iconFill="#cdcdcd"
                // iconSize={20}
                iconClassName={
                  "hover:opacity-50 transition-opacity cursor-pointer size-[16px]"
                }
                iconHandler={() => {
                  const url = getTransactionUrl(8453, txHash);
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
              />
            )}
            <div className="flex items-start gap-[8px] self-stretch flex-col">
              {purchaseDate && (
                <InfoPoint label="Fecha de compra" value={purchaseDate} />
              )}
              {invoiceNumber && (
                <InfoPoint label="Factura" value={invoiceNumber} />
              )}
            </div>

            {/* Benefits */}
            <div className="flex flex-col gap-[10px] items-start self-stretch w-full">
              <span className="text-[rgba(255,255,255,0.70)] font-inter text-[12px] font-normal leading-[16px] tracking-[-0.24px]">
                Beneficios
              </span>
              {[
                "Acceso Temprano",
                "Contenido Exclusivo",
                "Estatus de Founder",
              ].map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center gap-2">
                  <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4 fill-primary2" />
                  </div>
                  <p className="text-[13px] tracking-[-0.01em] leading-[1.5] text-white">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            {/* VAT Refund */}
            {type !== "Stripe" && onVatRefund && (
              <Button
                type="button"
                onClick={() => onVatRefund(_id)}
                className="self-center mt-1"
                isSecondary
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.66669 6.66667L8.00002 10L11.3334 6.66667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10V2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Devolución de IVA
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftCard;
