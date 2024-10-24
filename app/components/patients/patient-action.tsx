"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { PatientModel } from "@/app/models/patient_model";
import { deletePatient, sendInvite } from "@/app/services/client_side/patients";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";

interface Props {
  patient: PatientModel;
}

export default function PatientAction({ patient }: Props) {
  const { showSnackBar } = useSnackBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSendInviteOpen, setModalSendInviteOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
      setModalSendInviteOpen(false);
    }
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await deletePatient(patient.id);
        await revalidatePage("/patients");
        setIsProcessing(false);
        showSnackBar({
          message: `Patient successfully deleted.`,
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

  const handleSendInviteConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await sendInvite(patient.id);
        await revalidatePage("/patients");
        setIsProcessing(false);
        showSnackBar({
          message: `Invitation successfully sent.`,
          success: true,
        });
        setModalSendInviteOpen(false);
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setModalSendInviteOpen(false);
      }
    }
  }

  return (
    <>
      <ActionMenu
        editUrl={`patients/${patient.id}/edit`}
        onDeleteClick={handleOpenModal}
        canInvite={patient.can_invite}
        onSendInviteClick={() => setModalSendInviteOpen(true)}
      />
      <ConfirmModal
        title="Are you sure you want to delete this account?"
        subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
        isOpen={modalOpen}
        confirmBtnLabel="Delete"
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
      <ConfirmModal
        title="Are you sure you want to send this invitation?"
        subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
        isOpen={modalSendInviteOpen}
        confirmBtnLabel="Send"
        isProcessing={isProcessing}
        onConfirm={handleSendInviteConfirm}
        onClose={handleCloseModal}
      />
    </>
  );
}
