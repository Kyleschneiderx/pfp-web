"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import { deleteExercise } from "@/app/services/client_side/exercises";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";

interface Props {
  exercise: ExerciseModel;
}

export default function ExerciseAction({ exercise }: Props) {
  const { showSnackBar } = useSnackBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
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

  return (
    <div className="ml-auto">
      <ActionMenu
        editUrl={`exercises/${exercise.id}/edit`}
        onDeleteClick={handleOpenModal}
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
