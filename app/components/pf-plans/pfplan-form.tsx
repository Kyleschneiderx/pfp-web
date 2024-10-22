"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { convertDraftjsToHtml } from "@/app/lib/utils";
import { EducationModel } from "@/app/models/education_model";
import { ErrorModel } from "@/app/models/error_model";
import {
  PfPlanDailies,
  PfPlanExerciseModel,
  PfPlanModel,
} from "@/app/models/pfplan_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { deletePfPlan, savePfPlan } from "@/app/services/client_side/pfplans";
import { usePfPlanDailiesStore } from "@/app/store/store";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import clsx from "clsx";
import { ContentState, EditorState } from "draft-js";
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
import TrashbinIcon from "../icons/trashbin_icon";
import AddDayPanel from "./add-day-panel";
import { validateForm } from "./validation";

const ConfirmModal = dynamic(
  () => import("@/app/components/elements/ConfirmModal"),
  { ssr: false }
);

const RichTextEditor = dynamic(
  () => import("@/app/components/elements/RichTextEditor"),
  { ssr: false }
);

interface Props {
  action: "Create" | "Edit";
  pfPlan?: PfPlanModel;
}

export default function PfPlanForm({ action = "Create", pfPlan }: Props) {
  const { showSnackBar } = useSnackBar();
  const router = useRouter();
  const { days, removeDay, setDays, setSelectedDay } = usePfPlanDailiesStore();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState(EditorState.createEmpty());
  const [photo, setPhoto] = useState<File | null>(null);
  const [statusId, setStatusId] = useState<"4" | "5">("4");

  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [editInfo, setEditInfo] = useState<boolean>(
    action === "Create" ? true : false
  );

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (action === "Edit" && pfPlan) {
      setName(pfPlan.name);
      setDescription(pfPlan.description);

      if (typeof window !== "undefined") {
        const htmlToDraft = require("html-to-draftjs").default;
        const blocksFromHtml = htmlToDraft(pfPlan.content);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setContent(EditorState.createWithContent(contentState));
      }

      const dailies = pfPlan.pf_plan_dailies.map(
        (item: {
          id?: number;
          name: string;
          day: number;
          contents: any[];
        }) => ({
          id: item.id,
          name: item.name,
          day: item.day,
          contents: item.contents.map((el) => {
            if (el.exercise) {
              return {
                id: el.id,
                exercise_id: el.exercise.id,
                sets: el.exercise.sets,
                reps: el.exercise.reps,
                hold: el.exercise.hold,
                exercise: el.exercise,
              };
            } else if (el.education) {
              let education = el.education;
              education.pfPlanDayContentId = el.id;
              return education;
            }
          }),
        })
      );
      setDays(dailies);
    }
    return () => {
      setDays([]);
    };
  }, [pfPlan]);

  const handleFileSelect = (file: File | null) => {
    setPhoto(file);
  };

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    if (!destination) return;

    const updatedDays = [...days];
    // Remove the dragged day from its original position
    const [movedDays] = updatedDays.splice(source.index, 1);
    // Insert the dragged day into its new position
    updatedDays.splice(destination.index, 0, movedDays);
    // Reassign the 'day' property (or id) for each day based on its new position
    const reindexedDays = updatedDays.map((day, index) => ({
      ...day,
      day: index + 1,
    }));

    // Replace the current days with the reindexed days
    setDays(reindexedDays);
  };

  const isValid = () => {
    const validationErrors = validateForm({
      name,
      description,
      content,
      photo: photo ?? pfPlan?.photo,
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
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const method = action === "Create" ? "POST" : "PUT";
        const id = action === "Edit" ? pfPlan!.id : null;
        const body = new FormData();

        const dailiesPayload = days.map((item) => ({
          daily_id: item.id,
          name: item.name,
          day: item.day,
          contents: item.contents
            .map((el) => {
              if ("exercise" in el) {
                const exercise = el as PfPlanExerciseModel;
                const data = {
                  content_id: el.id,
                  exercise_id: exercise.exercise_id,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  hold: exercise.hold,
                };
                return data;
              } else if (el && !("exercise" in el)) {
                const education = el as EducationModel;
                return {
                  content_id: education.pfPlanDayContentId,
                  education_id: education.id,
                };
              }
              return null;
            })
            .filter(Boolean),
        }));

        const htmlContent = convertDraftjsToHtml(content);

        body.append("name", name);
        if (description) body.append("description", description);
        body.append("content", htmlContent);
        body.append("status_id", statusId);
        if (photo) body.append("photo", photo);
        if (dailiesPayload.length) {
          body.append("dailies", JSON.stringify(dailiesPayload));
        }

        await savePfPlan({ method, id, body });
        await revalidatePage("/pf-plans");
        setIsProcessing(false);
        showSnackBar({
          message: `Pf Plan successfully ${
            action === "Create" ? "created" : "updated"
          }.`,
          success: true,
        });
        setModalOpen(false);
        clearData();
        setIsSaved(true);
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
        await deletePfPlan(pfPlan!.id);
        await revalidatePage("/pf-plans");
        setIsProcessing(false);
        showSnackBar({
          message: `Pf Plan successfully deleted.`,
          success: true,
        });
        setModalOpen(false);
        router.push("/pf-plans");
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

  const handleEditDay = (day: PfPlanDailies) => {
    setSelectedDay(day);
    setIsPanelOpen(true);
  };

  const handleEditorChange = (content: EditorState) => {
    setContent(content);
    setIsSaved(false);
  };

  const clearData = () => {
    setName("");
    setDescription("");
    setPhoto(null);
    setSelectedDay(null);
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
          <StatusBadge label={pfPlan ? pfPlan.status.value : "Draft"} />
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
        <Card className="w-[693px] min-h-[300px] p-[22px] mr-5">
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold">PF Plan</h1>
            {days.length > 0 && (
              <Button
                label="Add Day"
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
                  className="space-y-4 mt-6"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {days.map((item, index) => (
                    <Draggable
                      key={"key" + item.day}
                      draggableId={item.day.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={clsx(
                            "flex items-center border rounded-md border-neutral-300 group p-4",
                            snapshot.isDragging
                              ? "drop-shadow-center !top-auto !left-auto bg-white"
                              : ""
                          )}
                        >
                          <MoveTaskIcon className="hidden group-hover:inline-block mr-2" />
                          <div className="text-[22px] font-medium">
                            Day {item.day} -
                          </div>
                          <div className="ml-2 mr-3 text-[18px] font-semibold">
                            {item.name}
                          </div>
                          <PencilIcon onClick={() => handleEditDay(item)} />
                          <TrashbinIcon
                            className="text-error-600 ml-auto"
                            onClick={() => removeDay(item.day)}
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
                Add day from the Add Day Panel to begin creating your PF Plan
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
      <Card className="w-[694px] p-5 mt-5">
        <p className="font-medium mb-2">Content</p>
        <RichTextEditor
          placeholder="Enter the PF Plan's content here"
          content={pfPlan?.content ?? null}
          onChange={handleEditorChange}
          isSaved={isSaved}
          isEdit={action === "Edit"}
        />
      </Card>
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