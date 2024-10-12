import { EducationModel } from "@/app/models/education_model";
import { WorkoutModel } from "@/app/models/workout_model";
import { useState } from "react";
import Button from "../elements/Button";

interface Props {
  onClose: () => void;
}

export default function EducationList({ onClose }: Props) {
  const [tab, setTab] = useState<number>(1);
  const [workoutList, setWorkoutList] = useState<WorkoutModel[]>([]);
  const [educationList, setEducationList] = useState<EducationModel[]>([]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4 w-[400px]">
        <p>test</p>
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
