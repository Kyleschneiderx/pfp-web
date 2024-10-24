"use client";

import ModalCmp from "@/app/components/elements/ModalCmp";
import { LIST_CATEGORIES_DESCRIPTION } from "@/app/lib/constants";
import { CategoryOptionsModel } from "@/app/models/exercise_model";
import FilePen from "@/public/svg/file-pen.svg";
import TrashBin from "@/public/svg/trash-bin.svg";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOptionsModel[];
  onEditClick: (category: CategoryOptionsModel) => void;
  onDeleteClick: (category: CategoryOptionsModel) => void;
}

export default function CategoryListModal({
  isOpen,
  onClose,
  categories,
  onEditClick,
  onDeleteClick,
}: Props) {
  return (
    <ModalCmp
      isOpen={isOpen}
      handleClose={onClose}
      showCloseBtn
      contentLabel="Example Modal"
    >
      <div className="text-center w-[450px] py-5 px-3">
        <p className="text-2xl font-semibold mb-2">All Categories</p>
        <p className="text-neutral-600 mb-[40px]">
          {LIST_CATEGORIES_DESCRIPTION}
        </p>
        <ul className="border border-neutral-300 rounded-lg text-start overflow-auto h-[200px]">
          {categories.map((item) => (
            <li
              key={item.value}
              className="flex w-full py-2 px-4 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 group"
            >
              <span>{item.label}</span>
              <Image
                src={FilePen}
                alt="file pen"
                className="ml-auto mr-2 hidden group-hover:inline-block cursor-pointer"
                onClick={() => onEditClick(item)}
              />
              <Image
                src={TrashBin}
                alt="file pen"
                className="hidden group-hover:inline-block cursor-pointer"
                onClick={() => onDeleteClick(item)}
              />
            </li>
          ))}
        </ul>
      </div>
    </ModalCmp>
  );
}
