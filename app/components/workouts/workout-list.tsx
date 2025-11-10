"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { PERMISSIONS } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import type { WorkoutModel } from "@/app/models/workout_model";
import { deleteWorkout, saveWorkout } from "@/app/services/client_side/workouts";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import Loader from "../elements/Loader";
import StatusBadge from "../elements/StatusBadge";
import { fetchWorkouts } from "./actions";
import DataList from "../data-list";
import SearchCmp from "../elements/SearchCmp";
import CommonSort from "../common-sort";
import Link from "next/link";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import { useModal } from "@/app/contexts/ModalContext";
import useAuth from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { IconTransfer } from "@tabler/icons-react";
import { toFormData } from "@/app/lib/utils";
import RenameModal from "../modals/rename-modal";

interface Props {
	name: string;
	sort: string;
	initialList: WorkoutModel[] | [];
	maxPage: number;
}

export default function WorkoutList({ name, sort, initialList, maxPage }: Props) {
	const modal = useModal();
	const { hasPermission } = useAuth();
	const router = useRouter();

	const [workouts, setWorkouts] = useState(initialList);
	const [page, setPage] = useState(1);
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	const loadMoreWorkouts = async () => {
		const next = page + 1;
		const { workoutList } = await fetchWorkouts({
			page: next,
			name,
			sort,
		});
		if (workoutList.length) {
			setPage(next);
			setWorkouts((prev: WorkoutModel[]) => [...(prev?.length ? prev : []), ...workoutList]);
		}
	};

	useEffect(() => {
		if (inView && page < maxPage) {
			loadMoreWorkouts();
		}
	}, [inView]);

	useEffect(() => {
		setWorkouts(initialList);
		setPage(1);
	}, [sort, name, initialList]);

	const handleDelete = async (workout: WorkoutModel) => {
		modal.open({
			type: "confirm",
			title: "Delete Workout",
			message: "Are you you want to delete this workout?",
			onConfirm: async () => {
				try {
					await deleteWorkout(workout!.id);
					await revalidatePage("/contents/workouts");
					showSnackBar({
						message: "Workout successfully deleted.",
						success: true,
					});
					modal.closeAll();
				} catch (error) {
					const apiError = error as ErrorModel;

					if (apiError?.msg) {
						showSnackBar({ message: apiError.msg, success: false });
					}
				}
			},
		});
	};

	const handleRename = async (workout: WorkoutModel) => {
		modal.open({
			type: "default",
			title: "Rename Workout",
			component: ({ close }) => {
				return (
					<RenameModal
						data={workout}
						type={"workout"}
						onClose={close}
						onSubmit={async ({ name }) => {
							try {
								const formData = toFormData({ name });
								await saveWorkout({ method: "PUT", id: workout!.id, body: formData });
								await revalidatePage("/contents/workouts");
								showSnackBar({
									message: "Workout successfully renamed.",
									success: true,
								});
								modal.closeAll();
							} catch (error) {
								const apiError = error as ErrorModel;

								if (apiError?.msg) {
									showSnackBar({ message: apiError.msg, success: false });
								}
							}
						}}
					/>
				);
			},
		});
	};

	return (
		<DataList data={workouts}>
			<div className="flex items-center mb-8">
				<SearchCmp placeholder="Search workouts" className="mr-4 sm:mr-0" />
				<CommonSort field="name" />
				{hasPermission(PERMISSIONS.WORKOUT_CREATE) && (
					<Link href="/contents/workouts/create" className="ml-auto">
						<Button label="Add Workout" showIcon className="hidden sm:flex" />
						<IconAddButton className="sm:hidden" />
					</Link>
				)}
			</div>
			<div className="flex flex-wrap">
				{workouts.map((workout) => (
					<div key={workout.id} className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<CardBanner url={workout.photo} />
						<Card className="min-h-[158px] rounded-t-none py-4 px-5">
							<div className="flex">
								<StatusBadge label={workout.status.value} />
								{hasPermission([PERMISSIONS.WORKOUT_EDIT, PERMISSIONS.WORKOUT_DELETE]) && (
									<ResponsiveActionMenu
										title={workout.name}
										className="cursor-pointer ml-auto"
										onEdit={
											hasPermission(PERMISSIONS.WORKOUT_EDIT)
												? () => router.push(`/contents/workouts/${workout.id}/edit`)
												: undefined
										}
										onDelete={hasPermission(PERMISSIONS.WORKOUT_DELETE) ? () => handleDelete(workout) : undefined}
										customActions={[
											...(hasPermission(PERMISSIONS.WORKOUT_EDIT)
												? [
														{
															label: "Rename",
															icon: <IconTransfer size={16} />,
															onClick: () => handleRename(workout),
														},
													]
												: []),
										]}
									/>
								)}
							</div>
							<p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">{workout.name}</p>
							<p className="text-sm text-neutral-700 mt-1">{workout.description}</p>
						</Card>
					</div>
				))}
			</div>
			{page < maxPage && (
				<div ref={ref} className="flex justify-center mt-5">
					<Loader />
					<span>Loading...</span>
				</div>
			)}
		</DataList>
	);
}
