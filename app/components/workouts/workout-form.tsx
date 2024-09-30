"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { ExerciseModel } from "@/app/models/exercise_model";
import { SelectOptionsModel } from "@/app/models/global_model";
import { WorkoutModel } from "@/app/models/workout_model";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "../elements/Card";
import Input from "../elements/Input";
import SelectCmp from "../elements/SelectCmp";
import StatusBadge from "../elements/StatusBadge";
import Textarea from "../elements/Textarea";
import UploadCmp from "../elements/UploadCmp";
const ExercisePanel = dynamic(
  () => import("@/app/components/workouts/exercise-panel"),
  { ssr: false }
);

interface Props {
  action: "Create" | "Edit";
  workout?: WorkoutModel;
}

export default function WorkoutForm({ action = "Create", workout }: Props) {
  const { showSnackBar } = useSnackBar();
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [type, setType] = useState<SelectOptionsModel | null>(null);
  const [description, setDescription] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [exercises, setExercises] = useState<ExerciseModel[]>([]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const typeOptions = [
    { label: "Free", value: "1" },
    { label: "Premium", value: "2" },
  ];

  const handleFileSelect = (file: File | null) => {
    setPhoto(file);
  };

  const onPublish = () => {};

  const onDraft = () => {};

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  const onSelectExercise = (exercise: ExerciseModel) => {
    setExercises(prev => [...prev, exercise]);
  }

  return (
    <>
      <div className="flex items-center mb-7">
        <div>
          <h1 className="text-2xl font-semibold">{action} Workout</h1>
          <p className="text-sm text-neutral-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ante ipsum
            primis in faucibus.
          </p>
        </div>
        <div className="flex ml-auto space-x-3">
          <Link href="/workouts">
            <Button label="Cancel" secondary />
          </Link>
          <Button label="Save as Draft" outlined onClick={onDraft} />
          <Button label="Save & Publish" onClick={onPublish} />
        </div>
      </div>
      <hr />
      <div className="mt-6 w-[800px] border-l-4 border-primary-500 pl-4">
        <div className="flex space-x-4 items-center">
          <Input
            type="text"
            placeholder="Workout name"
            value={name}
            invalid={false}
            onChange={(e) => setName(e.target.value)}
            className="!w-[468px]"
          />
          <SelectCmp
            options={typeOptions}
            value={type}
            invalid={false}
            onChange={(e) => setType(e)}
            placeholder="Select"
            className="!w-[150px]"
          />
          <StatusBadge label={workout ? workout.status.value : "Draft"} />
        </div>
        <div className="mt-3 w-[635px]">
          <Textarea
            placeholder="Enter a description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="flex mt-4">
        <Card className="w-[655px] min-h-[450px] p-[22px] mr-5">
          <h1 className="text-2xl font-semibold">Workout Order</h1>
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-neutral-400 mb-3">
              Add exercise form the exercise panel to begin creating your
              workout
            </p>
            <Button label="Add Exercise" outlined onClick={togglePanel} />
          </div>
        </Card>
        <Card className="w-[446px] h-fit p-[22px]">
          <UploadCmp
            onFileSelect={handleFileSelect}
            clearImagePreview={photo === null}
            type="image"
            recommendedText="405 x 225 pixels"
          />
        </Card>
      </div>
      <ExercisePanel isOpen={isPanelOpen} onClose={togglePanel} onSelect={onSelectExercise} />
    </>
  );
}
