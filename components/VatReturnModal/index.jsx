"use client";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Spinner from "@/components/Spinner";
import Error from "@/components/Error";
import { useState } from "react";
import { useVatReturn } from "@/hooks/useVatReturn";

const INITIAL_FORM = {
  nombre: "",
  direccion: "",
  email: "",
  pasaporte: "",
  nacionalidad: "",
};

const VatReturnModal = ({ open, onClose, tokenId }) => {
  const { mutateAsync, isPending, error, isSuccess, reset } = useVatReturn();
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    reset();
    setFormData(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mutateAsync({ ...formData, tokenId });
  };

  if (isSuccess) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        classWrapper="max-w-[500px] overflow-hidden"
      >
        <div className="flex flex-col gap-4 items-center pb-5 px-[20px] rounded-[16px] w-full bg-[#FCFDFD]">
          <p className="w-full font-medium leading-normal text-[24px] tracking-[-4%] text-left mt-4">
            ¡Solicitud enviada!
          </p>
          <p className="text-[14px] text-[#5E7279]">
            Hemos recibido tu solicitud de devolución de IVA para el NFT #
            {tokenId}. Nos pondremos en contacto contigo pronto.
          </p>
          <Button isPrimary onClick={handleClose} className="w-full mt-2">
            Cerrar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      classWrapper="max-w-[500px] overflow-hidden"
    >
      <div className="flex flex-col gap-4 items-start overflow-clip pb-5 relative rounded-[16px] w-full bg-[#FCFDFD]">
        {/* Header */}
        <div className="px-[20px] pt-4 w-full">
          <p className="font-medium leading-normal text-[24px] tracking-[-4%] text-left">
            Solicitud de devolución de IVA
          </p>
          <p className="text-[14px] text-[#5E7279] mt-1">NFT #{tokenId}</p>
        </div>

        <form
          className="flex flex-col gap-[16px] px-[20px] w-full"
          onSubmit={handleSubmit}
        >
          <Field
            label="Nombre completo"
            placeholder="Tu nombre completo"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <Field
            label="Dirección"
            placeholder="Tu dirección postal"
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            autoComplete="street-address"
          />

          <Field
            label="Email"
            placeholder="tu@email.com"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <Field
            label="Pasaporte / DNI"
            placeholder="Número de documento"
            type="text"
            name="pasaporte"
            value={formData.pasaporte}
            onChange={handleChange}
            required
            autoComplete="off"
          />

          <Field
            label="Nacionalidad"
            placeholder="Tu nacionalidad"
            type="text"
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            required
            autoComplete="country-name"
          />

          {isPending ? (
            <Spinner className="size-[80px]" />
          ) : (
            <Button
              isPrimary
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              Enviar solicitud
            </Button>
          )}

          <Error
            error={error}
            message={
              error?.response?.data?.message ||
              "Ocurrió un error al enviar la solicitud. Inténtalo de nuevo."
            }
          />
        </form>
      </div>
    </Modal>
  );
};

export default VatReturnModal;
