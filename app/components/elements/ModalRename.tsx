"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ModalCmp from "@/app/components/elements/ModalCmp";
import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onSaveClick: (newName: string) => void;
  isProcessing: boolean;
  label: string;
}

export default function ModalRename({
  isOpen,
  onClose,
  name,
  onSaveClick,
  isProcessing,
  label,
}: Props) {
  const [newName, setNewName] = useState<string>("");

  const handlSaveClick = () => {
    onSaveClick(newName);
  };

  useEffect(() => {
    if (isOpen) {
      setNewName("");
    }
  }, [isOpen]);

  return (
    <ModalCmp isOpen={isOpen} contentLabel="Example Modal">
      <div className="w-[450px] py-5 px-3">
        <p className="text-2xl font-semibold mb-7 text-center">
          Rename {label}
        </p>
        <div className="border border-neutral-200 rounded py-[9px] px-4 mb-6">
          <span>{name}</span>
        </div>
        <Input
          type="text"
          placeholder={`Enter the New ${label} name`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <div className="flex justify-center space-x-3 mt-9">
          <Button
            label="Cancel"
            secondary
            onClick={onClose}
            className="px-[50px]"
            disabled={isProcessing}
          />
          <Button
            label="Save"
            onClick={handlSaveClick}
            className="px-[50px]"
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </ModalCmp>
  );
}
