"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { PfPlanModel } from "@/app/models/pfplan_model";
import { deletePfPlan, duplicatePfPlan, savePfPlan } from "@/app/services/client_side/pfplans";
import { useActionMenuStore } from "@/app/store/store";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import ConfirmModal from "../elements/ConfirmModal";
import Loader from "../elements/Loader";
import ActionMenuMobile from "../elements/mobile/ActionMenuMobile";
import ModalRename from "../elements/ModalRename";
import StatusBadge from "../elements/StatusBadge";
import { fetchPfPlans } from "./action";
import PfPlanAction from "./pfplan-action";

interface Props {
	name: string;
	sort: string;
	initialList: PfPlanModel[] | [];
	maxPage: number;
}

export default function PfPlanList({ name, sort, initialList, maxPage }: Props) {
	const { pfPlan, setPfPlan, setEditUrl, setIsOpen } = useActionMenuStore();

	const [pfPlans, setPfPlans] = useState(initialList);
	const [page, setPage] = useState(1);
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalDuplicateOpen, setModalDuplicateOpen] = useState(false);
	const [modalRenameOpen, setModalRenameOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const handleOpenModal = () => setModalOpen(true);
	const handleCloseModal = () => {
		if (!isProcessing) {
			setModalOpen(false);
			setModalRenameOpen(false);
			setModalDuplicateOpen(false);
		}
	};

	const loadMorePfPlans = async () => {
		const next = page + 1;
		const { pfPlanList } = await fetchPfPlans({
			page: next,
			name,
			sort,
		});
		if (pfPlanList.length) {
			setPage(next);
			setPfPlans((prev: PfPlanModel[]) => [...(prev?.length ? prev : []), ...pfPlanList]);
		}
	};

	useEffect(() => {
		if (inView && page < maxPage) {
			loadMorePfPlans();
		}
	}, [inView]);

	useEffect(() => {
		setPfPlans(initialList);
		setPage(1);
	}, [sort, name, initialList]);

	const handleActionMenuClick = (pfPlan: PfPlanModel) => {
		setIsOpen(true);
		setPfPlan(pfPlan);
		setEditUrl(`pf-plans/${pfPlan.id}/edit`);
	};

	const handleConfirm = async () => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				await deletePfPlan(pfPlan!.id);
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: `PF Plan successfully deleted.`,
					success: true,
				});
				setModalOpen(false);
				setIsOpen(false);
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError && apiError.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setModalOpen(false);
				setIsOpen(false);
			}
		}
	};

	const handleConfirmDuplicate = async () => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				await duplicatePfPlan(pfPlan!.id);
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: "PF Plan successfully duplicated.",
					success: true,
				});
				setModalDuplicateOpen(false);
				setIsOpen(false);
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError?.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setModalDuplicateOpen(false);
				setIsOpen(false);
			}
		}
	};

	const handleRenameConfirm = async (newName: string) => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				const body = new FormData();
				body.append("name", newName);
				await savePfPlan({ method: "PUT", id: pfPlan!.id, body });
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: `PF plan successfully renamed.`,
					success: true,
				});
				setModalRenameOpen(false);
				setIsOpen(false);
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError && apiError.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setModalRenameOpen(false);
				setIsOpen(false);
			}
		}
	};

	return (
		<>
			<div className="flex flex-wrap">
				{pfPlans.map((pfplan) => (
					<div key={pfplan.id} className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<CardBanner url={pfplan.photo} />
						<Card className="min-h-[158px] rounded-t-none py-4 px-5">
							<div className="flex">
								<StatusBadge label={pfplan.status.value} />
								{/* For desktop */}
								<PfPlanAction pfplan={pfplan} />
								{/* For mobile */}
								<EllipsisVertical
									size={21}
									className="text-neutral-900 cursor-pointer sm:hidden"
									onClick={() => handleActionMenuClick(pfplan)}
								/>
							</div>
							<p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">{pfplan.name}</p>
							<p className="text-sm text-neutral-700 mt-1">{pfplan.description}</p>
						</Card>
					</div>
				))}
				{/* For mobile */}
				<ActionMenuMobile
					onDeleteClick={handleOpenModal}
					onDuplicateClick={() => setModalDuplicateOpen(true)}
					onRenameClick={() => setModalRenameOpen(true)}
				/>
				<ConfirmModal
					title="Are you sure you want to delete this PF Plan?"
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
				<ModalRename
					isOpen={modalRenameOpen}
					onClose={handleCloseModal}
					name={pfPlan?.name || ""}
					onSaveClick={handleRenameConfirm}
					isProcessing={isProcessing}
					label="Pf Plan"
				/>
			</div>
			{page < maxPage && (
				<div ref={ref} className="flex justify-center mt-5">
					<Loader />
					<span>Loading...</span>
				</div>
			)}
		</>
	);
}
