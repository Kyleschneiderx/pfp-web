import { WorkoutModel } from "@/app/models/workout_model";
import dynamic from "next/dynamic";
import { useState } from "react";
import Button from "../elements/Button";
const WorkoutList = dynamic(() => import("./workout-list"), {ssr: false});

interface Props {
  onClose: () => void;
}

export default function WorkoutEducationPanel({ onClose }: Props) {
  const [tab, setTab] = useState<number>(1);

  const onSelect = (workout: WorkoutModel) => {};

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4 w-[450px]">
        <WorkoutList onSelect={onSelect} />
      </div>
      <div className="p-4">
        <Button
          label="Done"
          secondary
          className="right-4 !py-2 !px-4 ml-auto"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
