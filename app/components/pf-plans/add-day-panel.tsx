import ArrowLeft from "@/public/svg/arrow-left.svg";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import Button from "../elements/Button";
import Card from "../elements/Card";
import Input from "../elements/Input";
import WorkoutEducationPanel from "./workout-education-panel";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDayPanel({ isOpen = false, onClose }: Props) {
  const [name, setName] = useState("");
  const [isOpenSelectList, setIsOpenSelectList] = useState(false);

  const handleOnClose = () => {
    setIsOpenSelectList(false);
    onClose();
  };

  return (
    <div
      className={clsx(
        "fixed flex top-[83px] right-0 h-[calc(100vh-83px)] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        isOpenSelectList ? "w-[1033px]" : "w-[583px]"
      )}
    >
      {isOpenSelectList && (
        <WorkoutEducationPanel onClose={() => setIsOpenSelectList(false)} />
      )}
      <div className="flex flex-col h-full shadow-left">
        <div className="flex-grow overflow-auto p-4">
          <div className="flex items-center mb-4">
            <Image
              src={ArrowLeft}
              alt="Arrow left"
              onClick={() => setIsOpenSelectList(true)}
            />
            <p className="text-2xl font-semibold ml-2">Add Day</p>
            <Button
              label="Cancel"
              secondary
              className="ml-auto mr-3"
              onClick={handleOnClose}
            />
            <Button label="Save" />
          </div>
          <Card className="p-4">
            <div className="flex items-center justify-center mb-4">
              <label className="text-[22px] font-medium mr-2">
                Day&nbsp;1&nbsp;-
              </label>
              <Input
                type="text"
                placeholder="Name your Day 1 Workout"
                value={name}
                invalid={false}
                onChange={(e) => setName(e.target.value)}
                className="!w-[440px]"
              />
            </div>
            <Button
              label="Add"
              outlined
              className="ml-auto"
              onClick={() => setIsOpenSelectList(true)}
            />
            <p className="text-center text-neutral-400 my-[100px]">
              You don't have any workout or education added yet
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
