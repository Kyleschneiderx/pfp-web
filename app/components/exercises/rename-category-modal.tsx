"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ModalCmp from "@/app/components/elements/ModalCmp";
import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onSaveClick: (name: string) => void;
  isProcessing: boolean;
}

export default function RenameCategoryModal({
  isOpen,
  onClose,
  categoryName,
  onSaveClick,
  isProcessing,
}: Props) {
  const [name, setName] = useState<string>("");

  const handlSaveClick = () => {
    onSaveClick(name);
  };

  useEffect(() => {
    if (isOpen) {
      setName("");
    }
  }, [isOpen]);

  return (
    <ModalCmp isOpen={isOpen} contentLabel="Example Modal">
      <div className="w-[450px] py-5 px-3">
        <p className="text-2xl font-semibold mb-7 text-center">
          Rename a Category
        </p>
        <div className="border border-neutral-200 rounded py-[9px] px-4 mb-6">
          <span>{categoryName}</span>
        </div>
        <Input
          type="text"
          placeholder="Enter a new category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
