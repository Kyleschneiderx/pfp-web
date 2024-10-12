"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { PfPlanDailies, PfPlanModel } from "@/app/models/pfplan_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { deleteWorkout } from "@/app/services/client_side/workouts";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import clsx from "clsx";
import { CircleX } from "lucide-react";
import dynamic from "next/dynamic";
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
import AddDayPanel from "./add-day-panel";
import { validateForm } from "./validation";
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
  workout?: PfPlanModel;
}

export default function PfPlanForm({ action = "Create", workout }: Props) {
  const { showSnackBar } = useSnackBar();
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [statusId, setStatusId] = useState<"4" | "5">("4");
  const [days, setDays] = useState<PfPlanDailies[]>([]);

  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editInfo, setEditInfo] = useState<boolean>(
    action === "Create" ? true : false
  );

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (action === "Edit" && workout) {
      setName(workout.name);
      setDescription(workout.description);
    }
  }, [workout]);

  const handleFileSelect = (file: File | null) => {
    setPhoto(file);
  };

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  const onRemoveDay = (id: number) => {
    const updatedDays = days.filter((item) => item.id !== id);
    setDays(updatedDays);
  };

  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    if (!destination) return;
  };

  const onChangeExercise = (
    index: number,
    value: number,
    type: "sets" | "reps" | "hold"
  ) => {
    if (index !== -1) {
    }
  };

  const isValid = () => {
    const validationErrors = validateForm({
      name,
      description,
      photo: photo ?? workout?.photo,
      dayLength: days.length,
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
    // if (!isProcessing) {
    //   try {
    //     setIsProcessing(true);
    //     const method = action === "Create" ? "POST" : "PUT";
    //     const id = action === "Edit" ? workout!.id : null;
    //     const body = new FormData();
    //     const exercisePayload = exercises.map((item) => ({
    //       exercise_id: item.id,
    //       sets: item.sets,
    //       reps: item.reps,
    //       hold: item.hold,
    //     }));
    //     body.append("name", name);
    //     if (description) body.append("description", description);
    //     body.append("status_id", statusId);
    //     body.append("is_premium", type?.label === "Premium" ? "true" : "false");
    //     if (photo) body.append("photo", photo);
    //     if (exercisePayload.length) {
    //       body.append("exercises", JSON.stringify(exercisePayload));
    //     }
    //     await saveWorkout({ method, id, body });
    //     await revalidatePage("/workouts");
    //     setIsProcessing(false);
    //     showSnackBar({
    //       message: `Workout successfully ${
    //         action === "Create" ? "created" : "updated"
    //       }.`,
    //       success: true,
    //     });
    //     setModalOpen(false);
    //     clearData();
    //   } catch (error) {
    //     const apiError = error as ErrorModel;
    //     if (apiError && apiError.msg) {
    //       showSnackBar({ message: apiError.msg, success: false });
    //     }
    //     setIsProcessing(false);
    //     setModalOpen(false);
    //   }
    // }
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
    setDescription("");
    setPhoto(null);
    setDays([]);
  };

  return (
    <>
      <div className="flex items-center mb-7">
        <div>
          <h1 className="text-2xl font-semibold">{action} PF Plan</h1>
          <p className="text-sm text-neutral-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ante ipsum
            primis in faucibus.
          </p>
        </div>
        <div className="flex ml-auto space-x-3">
          <Link href="/pf-plans">
            <Button label="Cancel" secondary />
          </Link>
          <Button label="Save as Draft" outlined onClick={onDraft} />
          <Button label="Save & Publish" onClick={onPublish} />
        </div>
      </div>
      <hr />
      <div className="mt-6 border-l-4 border-primary-500 pl-4">
        <div className="flex space-x-4 items-center">
          {editInfo ? (
            <>
              <Input
                type="text"
                placeholder="Treatment name"
                value={name}
                invalid={false}
                onChange={(e) => setName(e.target.value)}
                className="!w-[600px]"
              />
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold">{name}</p>
              <div onClick={() => setEditInfo(true)} className="cursor-pointer">
                <PencilIcon />
              </div>
            </>
          )}
          <StatusBadge label={workout ? workout.status.value : "Draft"} />
        </div>
        <div className={clsx(editInfo ? "w-[674px]" : "")}>
          {editInfo ? (
            <Textarea
              placeholder="Create a description for your treatment plan"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-3"
            />
          ) : (
            <p>{description}</p>
          )}
        </div>
      </div>
      <div className="flex mt-4">
        <Card className="w-[693px] min-h-[500px] p-[22px] mr-5">
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold">PF Plan</h1>
            {days.length > 0 && (
              <Button
                label="Add Exercise"
                outlined
                onClick={togglePanel}
                className="!py-2 !px-4"
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
                  {days.map((item, index) => (
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
                            <div className="ml-6"></div>
                          </div>
                          <CircleX
                            className="text-error-600"
                            onClick={() => onRemoveDay(item.id)}
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
          {days.length === 0 && (
            <div className="flex flex-col justify-center items-center h-full">
              <p className="text-neutral-400 mb-3">
                Add day from the Add Day Panel to begin creating your
                PF Plan
              </p>
              <Button label="Add Day" outlined onClick={togglePanel} />
            </div>
          )}
        </Card>
        <div>
          <Card className="w-[446px] h-fit p-[22px]">
            <UploadCmp
              label="Upload a Photo"
              onFileSelect={handleFileSelect}
              clearImagePreview={photo === null}
              type="image"
              recommendedText="405 x 225 pixels"
            />
          </Card>
          {action === "Edit" && (
            <Button
              label="Delete"
              outlined
              className="mt-5 ml-auto"
              onClick={() => setDeleteModalOpen(true)}
            />
          )}
        </div>
      </div>
      <AddDayPanel isOpen={isPanelOpen} onClose={togglePanel} />
      <ConfirmModal
        title={`Are you sure you want to ${
          action === "Create" ? "create this PF Plan?" : "save this changes?"
        } `}
        subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
        isOpen={modalOpen}
        confirmBtnLabel="Save"
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
      {action === "Edit" && (
        <ConfirmModal
          title="Are you sure you want to delete this PF Plan?"
          subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
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
