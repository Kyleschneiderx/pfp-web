"use client";

import Button from "./Button";
import ModalCmp from "./ModalCmp";

interface Props {
  title: string;
  subTitle?: string;
  isOpen: boolean;
  confirmBtnLabel: string;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  title,
  subTitle,
  isOpen,
  confirmBtnLabel,
  onClose,
  onConfirm,
  isProcessing,
}: Props) {
  return (
    <ModalCmp isOpen={isOpen} contentLabel="Example Modal">
      <div className="text-center w-[300px] sm:w-[450px]">
        <p className="text-xl sm:text-2xl font-semibold mb-5">{title}</p>
        <p className="text-neutral-600 mb-[40px]">{subTitle}</p>
        <div className="flex justify-center space-x-3">
          <Button label="Cancel" secondary onClick={onClose} className="sm:px-[50px]" disabled={isProcessing} />
          <Button label={confirmBtnLabel} onClick={onConfirm} className="sm:px-[50px]" isProcessing={isProcessing} />
        </div>
      </div>
    </ModalCmp>
  );
}
