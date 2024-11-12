import { EducationModel } from "@/app/models/education_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Button from "../elements/Button";
import SearchCmp from "../elements/SearchCmp";
const ExerciseList = dynamic(() => import("./exercise-list"), { ssr: false });
const EducationList = dynamic(() => import("./education-list"), { ssr: false });

interface Props {
  tab: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseModel) => void;
  onSelectEducation: (education: EducationModel) => void;
}

export default function ExerciseEducationPanel({
  tab,
  isOpen = false,
  onClose,
  onSelectExercise,
  onSelectEducation,
}: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const [name, setName] = useState("");

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const tabClass = "w-1/2 py-3 mt-3 font-medium text-center cursor-pointer";
  const activeTabClass = "border-b-[3px] border-primary-500 bg-primary-100";

  return (
    <div
      className={clsx(
        "flex flex-col h-full w-screen sm:w-[450px]",
        !isOpen && "hidden"
      )}
    >
      <div className="flex-grow overflow-auto p-4">
        <SearchCmp
          placeholder="Search exercise or education"
          className="!w-full mt-2"
          onChange={setName}
        />
        <div className="flex">
          <div
            className={clsx(tabClass, activeTab === 1 && activeTabClass)}
            onClick={() => setActiveTab(1)}
          >
            Exercises
          </div>
          <div
            className={clsx(tabClass, activeTab === 2 && activeTabClass)}
            onClick={() => setActiveTab(2)}
          >
            Education
          </div>
        </div>
        <ExerciseList
          onSelect={onSelectExercise}
          isOpen={activeTab === 1}
          name={name}
        />
        <EducationList
          onSelect={onSelectEducation}
          isOpen={activeTab === 2}
          title={name}
        />
      </div>
      <div className="p-4">
        <Button
          label="Done"
          secondary
          className="mr-2 sm:mr-0 mb-2 !py-2 !px-4 ml-auto"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
