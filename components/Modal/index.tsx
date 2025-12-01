import {
    Dialog,
    DialogPanel,
    DialogBackdrop,
    CloseButton,
} from "@headlessui/react";
import Icon from "@/components/Icon";

type ModalProps = {
    classWrapper?: string;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const Modal = ({ classWrapper, open, onClose, children }: ModalProps) => {
    return (
        <Dialog className="relative z-50" open={open} onClose={onClose}>
            <DialogBackdrop
                className="fixed inset-0 bg-[#282828]/90 duration-300 ease-out data-closed:opacity-0 max-md:bg-b-surface1"
                transition
            />
            <div className="fixed inset-0 flex p-4 overflow-y-auto max-md:p-0">
                <DialogPanel
                    className={`w-full max-w-120 m-auto p-16 rounded-4xl bg-b-surface1 duration-300 ease-out data-closed:opacity-0 max-md:px-6 max-md:pb-12 ${
                        classWrapper || ""
                    }`}
                    transition
                >
                    {children}
                    <CloseButton className="group absolute top-5 right-5 z-15 size-12 bg-b-surface2 rounded-full text-0 fill-t-secondary transition-all hover:shadow-hover hover:fill-t-primary dark:bg-b-surface3 max-md:top-2 max-md:right-2">
                        <Icon className="fill-inherit" name="close" />
                    </CloseButton>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default Modal;
