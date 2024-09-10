"use client";

import Button from "./Button";
import ModalCmp from "./ModalCmp";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm}: Props) {

  return (
    <ModalCmp
      isOpen={isOpen}
      onClose={onClose}
      contentLabel="Example Modal"
    >
      <p>Are you sure you want to continue?</p>
      <div className="flex justify-center">
        <Button label="Cancel" secondary onClick={onClose} />
        <Button label="Delete" onClick={onConfirm} />
      </div>
    </ModalCmp>
  );
}
