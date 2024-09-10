"use client";

import Button from "./Button";
import ModalCmp from "./ModalCmp";

interface Props {
  title: string;
  subTitle?: string;
  isOpen: boolean;
  confirmBtnLabel: string;
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
}: Props) {
  return (
    <ModalCmp isOpen={isOpen} onClose={onClose} contentLabel="Example Modal">
      <div className="text-center w-[450px]">
        <p className="text-2xl font-semibold mb-5">{title}</p>
        <p className="text-neutral-600 mb-[40px]">{subTitle}</p>
        <div className="flex justify-center space-x-3">
          <Button label="Cancel" secondary onClick={onClose} className="px-[50px]" />
          <Button label={confirmBtnLabel} onClick={onConfirm} className="px-[50px]"/>
        </div>
      </div>
    </ModalCmp>
  );
}
