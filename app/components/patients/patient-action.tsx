"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { Patients } from "@/app/models/patients";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";

interface Props {
  patient: Patients;
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
        isOpen={modalOpen}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
    </>
  );
}
