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
    if (name.trim() !== "") {
      onAddClick(name);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setName("");
    }
  }, [isOpen]);

  return (
    <ModalCmp isOpen={isOpen} contentLabel="Example Modal">
      <div className="text-center w-[300px] sm:w-[450px] sm:py-5 sm:px-3">
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
            className="sm:px-[50px]"
          />
          <Button
            label="Add"
            onClick={handleAddclick}
            className="sm:px-[50px]"
            disabled={name.trim() === ""}
          />
        </div>
      </div>
    </ModalCmp>
  );
}
