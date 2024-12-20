"use client";

import ModalCmp from "@/app/components/elements/ModalCmp";
import { LIST_CATEGORIES_DESCRIPTION } from "@/app/lib/constants";
import { CategoryOptionsModel } from "@/app/models/exercise_model";
import FilePenIcon from "../icons/filepen_icon";
import TrashbinIcon from "../icons/trashbin_icon";

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
    >
      <div className="text-center w-[300px] sm:w-[450px] sm:py-5 sm:px-3">
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
              <FilePenIcon
                className="ml-auto mr-2 hidden group-hover:inline-block cursor-pointer"
                onClick={() => onEditClick(item)}
              />
              <TrashbinIcon
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
