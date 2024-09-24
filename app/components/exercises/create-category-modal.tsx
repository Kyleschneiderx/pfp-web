"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ModalCmp from "@/app/components/elements/ModalCmp";
import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddClick: (name: string) => void;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onAddClick,
}: Props) {
  const [name, setName] = useState<string>("");

  const handleAddclick = () => {
    onAddClick(name);
  };

  useEffect(() => {
    if (isOpen) {
      setName("");
    }
  }, [isOpen]);

  return (
    <ModalCmp isOpen={isOpen} contentLabel="Example Modal">
      <div className="text-center w-[450px] py-5 px-3">
        <p className="text-2xl font-semibold mb-7">Add a New Category</p>
        <Input
          type="text"
          placeholder="Enter new category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-center space-x-3 mt-9">
          <Button
            label="Cancel"
            secondary
            onClick={onClose}
            className="px-[50px]"
          />
          <Button label="Add" onClick={handleAddclick} className="px-[50px]" />
        </div>
      </div>
    </ModalCmp>
  );
}
