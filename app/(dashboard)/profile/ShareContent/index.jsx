import Tab from "../Tab";
import Icon from "@/components/Icon";

const ShareContent = () => {
  return (
    <div className="flex w-full items-start justify-between gap-[16px] flex-row! flex-wrap">
      <Tab
        icon={
          <Icon
            name={"pencil"}
            className="size-[16px] aspect-square"
            size={20}
          />
        }
        title="Factura"
        description="Rellena los datos de factución"
        disabled
      />
      <Tab
        icon={
          <Icon
            name={"message"}
            className="size-[16px] aspect-square"
            size={20}
          />
        }
        title="Contacto"
        description="Contacta con soporte"
        to="mailto:support@hyxora.com"
        target="_blank"
      />
      <Tab
        icon={
          <Icon
            name={"checkmark"}
            className="size-[16px] aspect-square"
            size={20}
          />
        }
        title="Terms & Conditions"
        description="Lee los términos y condiciones"
        to="/terms"
        disabled
      />
      <Tab
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
        disabled
      />
    </div>
  );
};

export default ShareContent;
