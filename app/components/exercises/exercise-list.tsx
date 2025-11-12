"use client";

import Badge from "@/app/components/elements/Badge";
import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { PERMISSIONS } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import type { ExerciseModel } from "@/app/models/exercise_model";
import { deleteExercise, saveExercise } from "@/app/services/client_side/exercises";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import Loader from "../elements/Loader";
import { fetchExercises } from "./actions";
import DataList from "../data-list";
import SearchCmp from "../elements/SearchCmp";
import ExerciseFilterSort from "./exercise-filter-sort";
import Link from "next/link";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import { useModal } from "@/app/contexts/ModalContext";
import useAuth from "@/app/hooks/useAuth";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { useRouter } from "next/navigation";
import { IconTransfer, IconUser } from "@tabler/icons-react";
import RenameModal from "../modals/rename-modal";
import { toFormData } from "@/app/lib/utils";

export default function ExerciseList({
	name,
	sort,
	category_id,
	initialList,
	maxPage,
	sets_from,
	sets_to,
	reps_from,
	reps_to,
}: {
	name: string;
	sort: string;
	category_id: string;
	sets_from: string;
	sets_to: string;
	reps_from: string;
	reps_to: string;
	initialList: ExerciseModel[] | [];
	maxPage: number;
}) {
	const modal = useModal();
	const { hasPermission } = useAuth();
	const router = useRouter();

	const [exercises, setExercises] = useState(initialList);
	const [page, setPage] = useState(1);
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	const loadMoreExercises = async () => {
		const next = page + 1;
		const { exerciseList } = await fetchExercises({
			page: next,
			name,
			sort,
			category_id,
			sets_from,
			sets_to,
			reps_from,
			reps_to,
		});
		if (exerciseList.length) {
			setPage(next);
			setExercises((prev: ExerciseModel[]) => [...(prev?.length ? prev : []), ...exerciseList]);
		}
	};

	useEffect(() => {
		if (inView && page < maxPage) {
			loadMoreExercises();
		}
	}, [inView]);

	useEffect(() => {
		setExercises(initialList);
		setPage(1);
	}, [sort, name, category_id, initialList]);

	const handleDelete = async (exercise: ExerciseModel) => {
		modal.open({
			type: "confirm",
			title: "Delete Exercise",
			message: "Are you you want to delete this exercise?",
			onConfirm: async () => {
				try {
					await deleteExercise(exercise!.id);
					await revalidatePage("/contents/exercises");
					showSnackBar({
						message: "Exercise successfully deleted.",
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

	const handleRename = async (exercise: ExerciseModel) => {
		modal.open({
			type: "default",
			title: "Rename Exercise",
			component: ({ close }) => {
				return (
					<RenameModal
						data={exercise}
						type={"exercise"}
						onClose={close}
						onSubmit={async ({ name }) => {
							try {
								const formData = toFormData({ name });

								await saveExercise({ method: "PUT", id: exercise!.id, body: formData });
								await revalidatePage("/contents/exercises");
								showSnackBar({
									message: "Exercise successfully renamed.",
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
		<DataList
			data={exercises}
			header={
				<div className="flex items-center mb-8">
					<SearchCmp placeholder="Search exercises" className="mr-4 sm:mr-0" />
					<ExerciseFilterSort />
					{hasPermission(PERMISSIONS.EXERCISE_CREATE) && (
						<Link href="/contents/exercises/create" className="ml-auto">
							<Button label="Add Exercise" showIcon className="hidden sm:flex" />
							<IconAddButton className="sm:hidden" />
						</Link>
					)}
				</div>
			}
		>
			<div className="flex flex-wrap">
				{exercises.map((exercise) => (
					<div key={exercise.id} className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<div className="relative h-[200px]">
							<CardBanner url={exercise.photo} />
							<Badge
								label={`${exercise.exercise_category.value}`}
								className="text-white !bg-primary-500 absolute top-4 left-5"
							/>
						</div>
						<Card className="min-h-[158px] rounded-t-none py-4 px-5">
							<div className="flex">
								<Badge label={`${exercise.sets} sets`} />
								<Badge label={`${exercise.reps} reps`} />
								{hasPermission([PERMISSIONS.EXERCISE_EDIT, PERMISSIONS.EXERCISE_DELETE]) && (
									<ResponsiveActionMenu
										title={exercise.name}
										className="cursor-pointer ml-auto"
										onEdit={
											hasPermission(PERMISSIONS.EXERCISE_EDIT)
												? () => router.push(`/contents/exercises/${exercise.id}/edit`)
												: undefined
										}
										onDelete={hasPermission(PERMISSIONS.EXERCISE_DELETE) ? () => handleDelete(exercise) : undefined}
										customActions={[
											...(hasPermission(PERMISSIONS.EXERCISE_EDIT)
												? [
														{
															label: "Rename",
															icon: <IconTransfer size={16} />,
															onClick: () => handleRename(exercise),
														},
													]
												: []),
										]}
									/>
								)}
							</div>
							<p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">{exercise.name}</p>
							<p className="text-sm text-neutral-700 mt-1 line-clamp-5" title={exercise.description || ""}>
								{exercise.description}
							</p>
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
