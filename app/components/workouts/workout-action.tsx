"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { WorkoutModel } from "@/app/models/workout_model";
import { deleteWorkout, saveWorkout } from "@/app/services/client_side/workouts";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";
import ModalRename from "../elements/ModalRename";

interface Props {
  workout: WorkoutModel;
}

export default function WorkoutAction({ workout }: Props) {
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
        await deleteWorkout(workout.id);
        await revalidatePage("/workouts");
        setIsProcessing(false);
        showSnackBar({
          message: `Workout successfully deleted.`,
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
        await saveWorkout({ method: "PUT", id: workout.id, body });
        await revalidatePage("/workouts");
        setIsProcessing(false);
        showSnackBar({
          message: `Workout successfully renamed.`,
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
        editUrl={`workouts/${workout.id}/edit`}
        onRenameClick={() => setModalRenameOpen(true)}
        onDeleteClick={() => setModalOpen(true)}
      />
      <ModalRename
        isOpen={modalRenameOpen}
        onClose={handleCloseModal}
        name={workout.name}
        onSaveClick={handleRenameConfirm}
        isProcessing={isProcessing}
        label="Workout"
      />
      <ConfirmModal
        title="Are you sure you want to delete this workout?"
        subTitle={CONFIRM_DELETE_DESCRIPTION}
        isOpen={modalOpen}
        confirmBtnLabel="Delete"
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
    </div>
  );
}
