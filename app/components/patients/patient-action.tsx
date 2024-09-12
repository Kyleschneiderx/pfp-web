"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { PatientModel } from "@/app/models/patient_model";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";

interface Props {
  patient: PatientModel;
}

export default function PatientAction({ patient }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleConfirm = () => {
    console.log("Confirmed!");
    setModalOpen(false);
  };

  return (
    <>
      <ActionMenu
        editUrl={`patients/${patient.id}/edit`}
        onDeleteClick={handleOpenModal}
      />
      <ConfirmModal
        title="Are you sure you want to delete this account?"
        subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
        isOpen={modalOpen}
        confirmBtnLabel="Delete"
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
    </>
  );
}
