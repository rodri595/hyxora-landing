import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
  CloseButton,
} from "@headlessui/react";
import Icon from "@/components/Icon";
import { haptic } from "@/utils/haptics";

const Modal = ({
  className,
  classWrapper,
  open,
  onClose,
  children,
  hideCloseButton,
}) => {
  return (
    <Dialog
      className="relative z-50"
      open={open}
      onClose={onClose}
      data-lenis-prevent
    >
      <DialogBackdrop
        className="fixed inset-0 bg-shade-07/40 duration-300 ease-out data-[closed]:opacity-0"
        transition
      />
      <div
        className={`fixed inset-0 flex p-4 overflow-y-auto ${className || ""}`}
      >
        <DialogPanel
          className={`w-full m-auto shadow-popover  duration-300 ease-out data-[closed]:opacity-0 ${
            classWrapper || ""
          }`}
          transition
        >
          {children}
          {!hideCloseButton && (
            <CloseButton
              onClick={() => {
                haptic("light");
                onClose?.();
              }}
              className="absolute right-5 top-5 z-15 size-10 border border-s-02 bg-surface-01 rounded-xl transition-colors hover:bg-surface-03"
            >
              <Icon className="!size-4 fill-primary" name="close" />
            </CloseButton>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Modal;
