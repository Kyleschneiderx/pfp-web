"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { EducationModel } from "@/app/models/education_model";
import { ErrorModel } from "@/app/models/error_model";
import {
  deleteEducation,
  saveEducation,
} from "@/app/services/client_side/educations";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";
import ModalRename from "../elements/ModalRename";

interface Props {
  education: EducationModel;
}

export default function EducationAction({ education }: Props) {
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
        await deleteEducation(education.id);
        await revalidatePage("/education");
        setIsProcessing(false);
        showSnackBar({
          message: `Education successfully deleted.`,
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

  const handleRenameConfirm = async (newTitle: string) => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const body = new FormData();
        body.append("title", newTitle);
        await saveEducation({ method: "PUT", id: education.id, body });
        await revalidatePage("/education");
        setIsProcessing(false);
        showSnackBar({
          message: `Education successfully renamed.`,
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
        editUrl={`education/${education.id}/edit`}
        onRenameClick={() => setModalRenameOpen(true)}
        onDeleteClick={() => setModalOpen(true)}
      />
      <ModalRename
        isOpen={modalRenameOpen}
        onClose={handleCloseModal}
        name={education.title}
        onSaveClick={handleRenameConfirm}
        isProcessing={isProcessing}
        label="Education"
      />
      <ConfirmModal
        title="Are you sure you want to delete this education?"
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
