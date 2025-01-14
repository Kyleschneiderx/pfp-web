"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import {
  CONFIRM_DELETE_DESCRIPTION,
  CONFIRM_SAVE_DESCRIPTION,
  CREATE_WORKOUT_DESCRIPTION,
  UPDATE_DESCRIPTION,
} from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import { SelectOptionsModel } from "@/app/models/global_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { WorkoutExerciseModel, WorkoutModel } from "@/app/models/workout_model";
import {
  deleteWorkout,
  saveWorkout,
} from "@/app/services/client_side/workouts";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import clsx from "clsx";
import { CircleX } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "../elements/Card";
import Input from "../elements/Input";
import StatusBadge from "../elements/StatusBadge";
import Textarea from "../elements/Textarea";
import UploadCmp from "../elements/UploadCmp";
import MoveTaskIcon from "../icons/move_task_icon";
import PencilIcon from "../icons/pencil_icon";
import { validateForm } from "./validation";

const SelectCmp = dynamic(() => import("@/app/components/elements/SelectCmp"), {
  ssr: false,
});
const ExercisePanel = dynamic(
  () => import("@/app/components/workouts/exercise-panel"),
  { ssr: false }
);
const ConfirmModal = dynamic(
  () => import("@/app/components/elements/ConfirmModal"),
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
  const [exercises, setExercises] = useState<WorkoutExerciseModel[]>([]);
  const [statusId, setStatusId] = useState<"4" | "5">("4");

  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editInfo, setEditInfo] = useState<boolean>(
    action === "Create" ? true : false
  );

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const typeOptions = [
    { label: "Free", value: "1" },
    { label: "Premium", value: "2" },
  ];

  useEffect(() => {
    if (action === "Edit" && workout) {
      setName(workout.name);
      setDescription(workout.description);
      if (workout.is_premium) {
        setType({ label: "Premium", value: "2" });
      } else {
        setType({ label: "Free", value: "1" });
      }
      const exerciseData = workout.workout_exercises.map((exercise) => ({
        ...exercise,
        id: exercise.exercise.id,
        workout_exercise_id: exercise.id,
      }));
      setExercises(exerciseData);
    }
  }, [workout]);

  const handleFileSelect = (file: File | null) => {
    setPhoto(file);
  };

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  const onSelectExercise = (exercise: ExerciseModel) => {
    const itemExists = exercises.some((item) => item.id === exercise.id);
    const data: WorkoutExerciseModel = {
      id: exercise.id,
      sets: exercise.sets,
      reps: exercise.reps,
      hold: exercise.hold,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        photo: exercise.photo ?? undefined,
      },
    };
    if (!itemExists) {
      setExercises((prev) => [...prev, data]);
    }
  };

  const onRemoveExercise = (id: number) => {
    const updatedExercises = exercises.filter((item) => item.id !== id);
    setExercises(updatedExercises);
  };

  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    if (!destination) return;

    const updatedExercises = [...exercises];
    const [movedExercises] = updatedExercises.splice(source.index, 1);
    updatedExercises.splice(destination.index, 0, movedExercises);

    setExercises(updatedExercises);
  };

  const onChangeExercise = (
    index: number,
    value: number,
    type: "sets" | "reps" | "hold"
  ) => {
    if (index !== -1) {
      const updatedExercises = [...exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [type]: value,
      };
      setExercises(updatedExercises);
    }
  };

  const isValid = () => {
    const validationErrors = validateForm({
      name,
      description,
      type: type?.label,
      photo: photo ?? workout?.photo,
      exercises: exercises,
    });
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.message).join("\n");
      showSnackBar({ message: errorMessages, success: false });
    }
  }, [errors]);

  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
      setDeleteModalOpen(false);
    }
  };

  const onPublish = () => {
    if (isValid()) {
      setStatusId("5");
      setModalOpen(true);
    }
  };

  const onDraft = () => {
    if (isValid()) {
      setStatusId("4");
      setModalOpen(true);
    }
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const method = action === "Create" ? "POST" : "PUT";
        const id = action === "Edit" ? workout!.id : null;
        const body = new FormData();

        const exercisePayload = exercises.map((item) => ({
          workout_exercise_id: item.workout_exercise_id,
          exercise_id: item.id,
          sets: item.sets,
          reps: item.reps,
          hold: item.hold,
        }));

        body.append("name", name);
        if (description) body.append("description", description);
        body.append("status_id", statusId);
        body.append("is_premium", type?.label === "Premium" ? "true" : "false");
        if (photo) body.append("photo", photo);
        if (exercisePayload.length) {
          body.append("exercises", JSON.stringify(exercisePayload));
        }

        await saveWorkout({ method, id, body });
        await revalidatePage("/workouts");
        setIsProcessing(false);
        showSnackBar({
          message: `Workout successfully ${
            action === "Create" ? "created" : "updated"
          }.`,
          success: true,
        });
        setModalOpen(false);
        clearData();
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setModalOpen(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!isProcessing && action === "Edit") {
      try {
        setIsProcessing(true);
        await deleteWorkout(workout!.id);
        await revalidatePage("/workouts");
        setIsProcessing(false);
        showSnackBar({
          message: `Workout successfully deleted.`,
          success: true,
        });
        setModalOpen(false);
        router.push("/workouts");
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setDeleteModalOpen(false);
      }
    }
  };

  const clearData = () => {
    setName("");
    setType(null);
    setDescription("");
    setPhoto(null);
    setExercises([]);
  };

  const exerciseInputClass = "!w-[55px] sm:!w-[120px]";

  return (
    <>
      <div className="flex items-center mb-4 sm:mb-7">
        <div>
          <h1 className="text-2xl font-semibold">{action} Workout</h1>
          <p className="text-sm text-neutral-600">
            {action === "Create"
              ? CREATE_WORKOUT_DESCRIPTION
              : UPDATE_DESCRIPTION}
          </p>
        </div>
        <div className="hidden sm:flex ml-auto space-x-3">
          <Link href="/workouts">
            <Button label="Cancel" secondary />
          </Link>
          <Button label="Save as Draft" outlined onClick={onDraft} />
          <Button label="Save & Publish" onClick={onPublish} />
        </div>
      </div>
      <hr />
      {editInfo && (
        <div
          className={clsx(
            "flex flex-col mt-5 sm:mt-6 border-l-4 border-primary-500 pl-4 sm:space-x-4 items-start",
            editInfo && "sm:flex-row"
          )}
        >
          <div className="flex flex-col w-full sm:w-[468px] space-y-3">
            {editInfo && (
              <>
                <Input
                  type="text"
                  placeholder="Workout name"
                  value={name}
                  invalid={false}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className={clsx(editInfo ? "sm:w-[635px]" : "")}>
                  <Textarea
                    placeholder="Enter a description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="!h-[100px]"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex w-full items-center space-x-4 mt-2 sm:mt-0">
            {editInfo && (
              <SelectCmp
                options={typeOptions}
                value={type}
                invalid={false}
                onChange={(e) => setType(e)}
                placeholder="Select"
                className="sm:!w-[150px]"
                wrapperClassName="w-full sm:w-auto"
              />
            )}
            <StatusBadge label={workout ? workout.status.value : "Draft"} />
          </div>
        </div>
      )}
      {action === "Edit" && !editInfo && (
        <div className="mt-5 sm:mt-6 border-l-4 border-primary-500 pl-2 sm:pl-4">
          <div className="flex sm:space-x-4 space-y-2 sm:space-y-0 flex-col sm:flex-row">
            <div className="flex space-x-2 sm:space-x-4 items-center">
              <div
                className={clsx(
                  "flex items-center rounded-md py-[4px] px-[10px]",
                  type?.label === "Premium"
                    ? "text-[#D5A215] bg-[#D5A21514]"
                    : "text-primary-900 bg-secondary-100"
                )}
              >
                {type?.label === "Premium" && (
                  <Image
                    src="/images/orange-heart.png"
                    alt="orange heart"
                    width={20}
                    height={19}
                    quality={100}
                    className="mr-[5px] w-[20px] h-[19px]"
                  />
                )}
                <p>{type?.label}</p>
              </div>
              <div className="w-[230px] sm:w-auto">
                <p className="text-xl sm:text-2xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  {name}
                </p>
              </div>
            </div>
            <div className="flex sm:space-x-4 items-center">
              <div
                onClick={() => setEditInfo(true)}
                className="cursor-pointer mx-2 sm:mx-0"
              >
                <PencilIcon />
              </div>
              <StatusBadge label={workout ? workout.status.value : "Draft"} />
            </div>
          </div>
          <p className="hidden sm:block">{description}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row mt-4">
        <Card className="sm:w-[700px] min-h-[200px] sm:min-h-[500px] px-3 sm:px-5 sm:mr-5 mb-5 sm:mb-0">
          <div className="flex justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold">Workout Order</h1>
            {exercises.length > 0 && (
              <Button
                label="Add Exercise"
                outlined
                onClick={togglePanel}
                className="!py-[8px] !px-3 !sm:py-2 sm:!px-4"
              />
            )}
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="ExerciseList">
              {(provided) => (
                <div
                  className="space-y-6 mt-6"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {exercises.map((item, index) => (
                    <Draggable
                      key={"key" + item.id}
                      draggableId={item.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={clsx(
                            "flex items-center",
                            snapshot.isDragging
                              ? "drop-shadow-center !top-auto !left-auto bg-white !p-[20px] !h-[120px]"
                              : ""
                          )}
                        >
                          <div className="flex items-center group mr-6">
                            <MoveTaskIcon className="hidden group-hover:inline-block mr-4" />
                            <Image
                              src={
                                item.exercise.photo ||
                                "/images/exercise-banner.jpg"
                              }
                              width={120}
                              height={80}
                              alt="Banner"
                              placeholder="blur"
                              blurDataURL="/images/placeholder.jpg"
                              className="w-[80px] h-[50px] sm:w-[120px] sm:h-[80px]"
                            />
                            <div className="ml-3 sm:ml-6 w-[200px] sm:w-[450px]">
                              <p className="text-[18px] sm:text-[20px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                                {item.exercise.name}
                              </p>
                              <div className="flex space-x-4 sm:space-x-6">
                                <div>
                                  <p className="font-medium">Sets</p>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.sets}
                                    min={1}
                                    onChange={(e) =>
                                      onChangeExercise(
                                        index,
                                        parseInt(e.target.value),
                                        "sets"
                                      )
                                    }
                                    className={exerciseInputClass}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">Reps</p>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.reps}
                                    min={1}
                                    onChange={(e) =>
                                      onChangeExercise(
                                        index,
                                        parseInt(e.target.value),
                                        "reps"
                                      )
                                    }
                                    className={exerciseInputClass}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">Hold</p>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.hold}
                                    min={1}
                                    onChange={(e) =>
                                      onChangeExercise(
                                        index,
                                        parseInt(e.target.value),
                                        "hold"
                                      )
                                    }
                                    className={exerciseInputClass}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <CircleX
                            className="text-error-600"
                            onClick={() => onRemoveExercise(item.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {exercises.length === 0 && (
            <div className="flex flex-col justify-center text-center items-center h-full sm:mt-0">
              <p className="text-neutral-400 mb-3">
                Add exercise from the exercise panel to begin creating your
                workout
              </p>
              <Button label="Add Exercise" outlined onClick={togglePanel} />
            </div>
          )}
        </Card>
        <div>
          <Card className="sm:w-[446px] h-fit">
            <UploadCmp
              label="Upload a Photo"
              onFileSelect={handleFileSelect}
              clearImagePreview={photo === null}
              type="image"
              recommendedText="405 x 225 pixels"
              isEdit={action === "Edit"}
            />
          </Card>
          {action === "Edit" && (
            <Button
              label="Delete"
              outlined
              className="hidden sm:block mt-5 ml-auto"
              onClick={() => setDeleteModalOpen(true)}
            />
          )}
        </div>
        <div className="sm:hidden order-last flex flex-col w-full mt-6 space-y-3">
          <Link href="/workouts">
            <Button label="Cancel" secondary className="w-full" />
          </Link>
          <Button label="Save as Draft" outlined onClick={onDraft} />
          <Button label="Save & Publish" onClick={onPublish} />
        </div>
      </div>
      <ExercisePanel
        isOpen={isPanelOpen}
        onClose={togglePanel}
        onSelect={onSelectExercise}
      />
      <ConfirmModal
        title={`Are you sure you want to ${
          action === "Create" ? "create this workout?" : "save this changes?"
        } `}
        subTitle={CONFIRM_SAVE_DESCRIPTION}
        isOpen={modalOpen}
        confirmBtnLabel="Save"
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
      {action === "Edit" && (
        <ConfirmModal
          title="Are you sure you want to delete this workout?"
          subTitle={CONFIRM_DELETE_DESCRIPTION}
          isOpen={deleteModalOpen}
          confirmBtnLabel="Delete"
          isProcessing={isProcessing}
          onConfirm={handleDeleteConfirm}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
