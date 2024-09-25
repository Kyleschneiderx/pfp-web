"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import {
  deleteExercise,
  saveExercise,
} from "@/app/services/client_side/exercises";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";
import ModalRename from "../elements/ModalRename";

interface Props {
  exercise: ExerciseModel;
}

export default function ExerciseAction({ exercise }: Props) {
  const { showSnackBar } = useSnackBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRenameOpen, setModalRenameOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
      setModalRenameOpen(false);
    }
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await deleteExercise(exercise.id);
        await revalidatePage("/exercises");
        setIsProcessing(false);
        showSnackBar({
          message: `Exercise successfully deleted.`,
          success: true,
        });
        setModalOpen(false);
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

  const handleRenameConfirm = async (newName: string) => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const body = new FormData();
        body.append("name", newName);
        await saveExercise({ method: "PUT", id: exercise.id, body });
        await revalidatePage("/exercises");
        setIsProcessing(false);
        showSnackBar({
          message: `Exercise successfully renamed.`,
          success: true,
        });
        setModalRenameOpen(false);
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setModalRenameOpen(false);
      }
    }
  };

  return (
    <div className="ml-auto">
      <ActionMenu
        editUrl={`exercises/${exercise.id}/edit`}
        onRenameClick={() => setModalRenameOpen(true)}
        onDeleteClick={() => setModalOpen(true)}
      />
      <ModalRename
        isOpen={modalRenameOpen}
        onClose={handleCloseModal}
        name={exercise.name}
        onSaveClick={handleRenameConfirm}
        isProcessing={isProcessing}
        label="Exercise"
      />
      <ConfirmModal
        title="Are you sure you want to delete this exercise?"
        subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
        isOpen={modalOpen}
        confirmBtnLabel="Delete"
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
    </div>
  );
}
