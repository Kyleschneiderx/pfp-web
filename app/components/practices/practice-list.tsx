"use client";

import Badge from "@/app/components/elements/Badge";
import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import type { Practice } from "@/app/models/practice";
import type { PaginationModel, List } from "@/app/models/global_model";
import Image from "next/image";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/contexts/ModalContext";
import { deletePractice } from "@/app/services/client_side/practices";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import { IconUserScan } from "@tabler/icons-react";

export default function PracticeList({
	data,
}: {
	data: List<Practice>;
}) {
	const router = useRouter();
	const modal = useModal();
	const [practices, setPractices] = useState<Practice[]>(data.data);
	const [pagination, setPagination] = useState<PaginationModel>(() => {
		const { data: list, ...metadata } = data;

		return metadata;
	});
	const [page, setPage] = useState(1);
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalRenameOpen, setModalRenameOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const handleOpenModal = () => setModalOpen(true);
	const handleCloseModal = () => {
		if (!isProcessing) {
			setModalOpen(false);
			setModalRenameOpen(false);
		}
	};

	// const loadMoreExercises = async () => {
	// 	const next = page + 1;
	// 	const { exerciseList } = await fetchExercises({
	// 		page: next,
	// 		name,
	// 		sort,
	// 		category_id,
	// 		sets_from,
	// 		sets_to,
	// 		reps_from,
	// 		reps_to,
	// 	});
	// 	if (exerciseList.length) {
	// 		setPage(next);
	// 		setExercises((prev: ExerciseModel[]) => [...(prev?.length ? prev : []), ...exerciseList]);
	// 	}
	// };

	// useEffect(() => {
	// 	if (inView && page < maxPage) {
	// 		loadMoreExercises();
	// 	}
	// }, [inView]);

	// useEffect(() => {
	// 	setExercises(initialList);
	// 	setPage(1);
	// }, [sort, name, category_id, initialList]);

	const handleDelete = async (practice: Practice) => {
		modal.open({
			type: "confirm",
			title: "Delete Practice",
			message: "Are you sure you want to remove this practice?",
			onConfirm: async () => {
				try {
					await deletePractice(practice.id!);

					await revalidatePage("/practices");

					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;

					showSnackBar({ message: error.msg, success: false });
				}
			},
		});
	};

	return (
		<>
			<div className="flex flex-wrap">
				{practices.map((practice) => (
					<Card key={practice.id} className="p-2 w-[351px] flex mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<div className="!p-0 w-full">
							<div className="flex flex-col space-y-2">
								<div className="flex items-center">
									<Image
										src={practice.photo || "/images/avatar.png"}
										width={50}
										height={50}
										alt="Profile pic"
										quality={100}
										className="self-start w-[50px] h-[50px] mr-3 shrink-0 rounded-full object-cover"
									/>
									<div className="flex flex-col flex-grow">
										<div className="flex items-center">
											<p className="text-lg font-semibold mb-1 mr-auto">{practice.name}</p>
											<ResponsiveActionMenu
												title={practice.name}
												className="-mr-2"
												onEdit={() => {
													router.push(`/practices/${practice.id}/edit`);
												}}
												onDelete={() => handleDelete(practice)}
											/>
										</div>
										<div className="flex items-center space-x-1 text-sm">
											<IconUserScan stroke={2} width={18} />
											<span>{practice.npi}</span>
										</div>
									</div>
								</div>
								<div className="flex flex-col space-y-1 text-sm text-neutral-700">
									{/* <div className="flex items-center space-x-1">
										<IconUserScan stroke={2} width={18} />
										<span>{practice.npi}</span>
									</div>
									<div className="flex items-center space-x-1">
										<IconIdBadge2 stroke={2} width={18} />
										<span>{practice.license?.join(",") || "N/A"}</span>
									</div> */}
									<p className="line-clamp-5 text-sm" title={practice.bio}>
										{practice.bio}
									</p>
								</div>
							</div>
						</div>
					</Card>
				))}
			</div>
			{pagination.page < pagination.max_page && (
				<div ref={ref} className="flex justify-center mt-5">
					<Loader />
					<span>Loading...</span>
				</div>
			)}
		</>
	);
}
