"use client";

import ActionMenu from "@/app/components/elements/ActionMenu";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import { deletePfPlan, duplicatePfPlan, savePfPlan } from "@/app/services/client_side/pfplans";
import { useState } from "react";
import ConfirmModal from "../elements/ConfirmModal";
import ModalRename from "../elements/ModalRename";

interface Props {
	pfplan: PfPlanModel;
}

export default function PfPlanAction({ pfplan }: Props) {
	const { showSnackBar } = useSnackBar();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalDuplicateOpen, setModalDuplicateOpen] = useState(false);
	const [modalRenameOpen, setModalRenameOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const handleCloseModal = () => {
		if (!isProcessing) {
			setModalOpen(false);
			setModalRenameOpen(false);
			setModalDuplicateOpen(false);
		}
	};

	const handleConfirm = async () => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				await deletePfPlan(pfplan.id);
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: "Pf Plan successfully deleted.",
					success: true,
				});
				setModalOpen(false);
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError?.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setModalOpen(false);
			}
		}
	};

	const handleConfirmDuplicate = async () => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				await duplicatePfPlan(pfplan.id);
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: "Pf Plan successfully duplicated.",
					success: true,
				});
				setModalDuplicateOpen(false);
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError?.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setModalDuplicateOpen(false);
			}
		}
	};

	const handleRenameConfirm = async (newName: string) => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				const body = new FormData();
				body.append("name", newName);
				await savePfPlan({ method: "PUT", id: pfplan.id, body });
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: "Pf Plan successfully renamed.",
					success: true,
				});
				setModalRenameOpen(false);
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError?.msg) {
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
				editUrl={`pf-plans/${pfplan.id}/edit`}
				onRenameClick={() => setModalRenameOpen(true)}
				onDeleteClick={() => setModalOpen(true)}
				onDuplicateClick={() => setModalDuplicateOpen(true)}
			/>
			<ModalRename
				isOpen={modalRenameOpen}
				onClose={handleCloseModal}
				name={pfplan.name}
				onSaveClick={handleRenameConfirm}
				isProcessing={isProcessing}
				label="Pf Plan"
			/>
			<ConfirmModal
				title="Are you sure you want to delete this Pf Plan?"
				subTitle={CONFIRM_DELETE_DESCRIPTION}
				isOpen={modalOpen}
				confirmBtnLabel="Delete"
				isProcessing={isProcessing}
				onConfirm={handleConfirm}
				onClose={handleCloseModal}
			/>
			<ConfirmModal
				title="Are you sure you want to duplicate this PF Plan?"
				subTitle="Are you sure want to duplicate this? The duplicated record will have Duplicate appended to its title."
				isOpen={modalDuplicateOpen}
				confirmBtnLabel="Duplicate"
				isProcessing={isProcessing}
				onConfirm={handleConfirmDuplicate}
				onClose={handleCloseModal}
			/>
		</div>
	);
}
