"use client";

import Button from "@/app/components/elements/Button";
import Loader from "@/app/components/elements/Loader";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import type { EducationModel } from "@/app/models/education_model";
import type { ErrorModel } from "@/app/models/error_model";
import type { PfPlanDailies, PfPlanExerciseModel } from "@/app/models/pfplan_model";
import {
	type PfPlanDailyInput,
	createPfPlanDaily,
	deletePfPlanDaily,
	listPfPlanDailies,
	reorderPfPlanDaily,
	updatePfPlanDaily,
} from "@/app/services/client_side/pfplan-dailies";
import { usePfPlanDailiesStore } from "@/app/store/store";
import { DragDropContext, Draggable, type DropResult, Droppable } from "@hello-pangea/dnd";
import { IconCopy } from "@tabler/icons-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "../elements/Card";
import MoveTaskIcon from "../icons/move_task_icon";
import PencilIcon from "../icons/pencil_icon";
import TrashbinIcon from "../icons/trashbin_icon";
import AddDayPanel from "./add-day-panel";

const ConfirmModal = dynamic(() => import("@/app/components/elements/ConfirmModal"), { ssr: false });

const PAGE_ITEMS = 10;

interface Props {
	pfPlanId: number | null;
	isArchived: boolean;
	/**
	 * When true, all mutating actions (add, copy, edit, delete, reorder) are
	 * hidden. Used in the patient-personalized flow before the original plan
	 * has been saved as a personalized copy — at that point any edit would
	 * mutate the source-of-truth template, not the patient's copy.
	 */
	readOnly?: boolean;
	/** Notice shown above the list when readOnly is true. */
	readOnlyNotice?: string;
}

/**
 * Normalize the API daily content shape into the flatter form AddDayPanel expects.
 * API returns each content row as `{ id, exercise: {...} | null, education: {...} | null }`.
 * AddDayPanel expects exercises as `{ id, exercise_id, sets, reps, hold, rest, exercise }`
 * and education as `EducationModel & { pfPlanDayContentId }`.
 */
const normalizeDaily = (daily: PfPlanDailies): PfPlanDailies => ({
	...daily,
	contents: (daily.contents ?? []).map((rawContent: unknown) => {
		const apiContent = (rawContent ?? {}) as {
			id?: number;
			exercise?: PfPlanExerciseModel["exercise"];
			education?: EducationModel;
		};
		if (apiContent.exercise) {
			const exercise = apiContent.exercise;
			return {
				id: apiContent.id,
				exercise_id: exercise.id,
				sets: exercise.sets,
				reps: exercise.reps,
				hold: exercise.hold,
				rest: exercise.rest,
				exercise,
			} as PfPlanExerciseModel;
		}
		if (apiContent.education) {
			const education = apiContent.education as EducationModel & {
				pfPlanDayContentId?: number;
			};
			education.pfPlanDayContentId = apiContent.id;
			return education;
		}
		return rawContent as EducationModel | PfPlanExerciseModel;
	}),
});

const buildDailyInput = (day: PfPlanDailies): PfPlanDailyInput => ({
	day: day.day,
	name: day.name,
	requires_pfdi_update: day.requires_pfdi_update ?? false,
	custom_form_ids: day.custom_forms?.map((form) => form.id) ?? [],
	contents: day.contents
		.map((content) => {
			if ("exercise" in content && content.exercise) {
				const exercise = content as PfPlanExerciseModel;
				return {
					content_id: exercise.id,
					exercise_id: exercise.exercise_id,
					sets: exercise.sets,
					reps: exercise.reps,
					hold: exercise.hold,
					rest: exercise.rest,
				};
			}
			const education = content as EducationModel & {
				pfPlanDayContentId?: number;
			};
			return {
				content_id: education.pfPlanDayContentId,
				education_id: education.id,
			};
		})
		.filter(Boolean),
});

export default function PfPlanDailiesTab({ pfPlanId, isArchived, readOnly = false, readOnlyNotice }: Props) {
	const { showSnackBar } = useSnackBar();
	const { setSelectedDay } = usePfPlanDailiesStore();

	const [dailies, setDailies] = useState<PfPlanDailies[]>([]);
	const [page, setPage] = useState<number>(1);
	const [maxPage, setMaxPage] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
	const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
	const [dayToDelete, setDayToDelete] = useState<PfPlanDailies | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	const observerRef = useRef<IntersectionObserver | null>(null);
	const scrollParentRef = useRef<HTMLElement | null>(null);
	const lastFireScrollTopRef = useRef<number>(Number.NEGATIVE_INFINITY);
	const loadingRef = useRef<boolean>(false);
	const reorderInFlightRef = useRef<boolean>(false);
	const pfPlanIdRef = useRef<number | null>(pfPlanId);
	const pageRef = useRef<number>(page);
	const maxPageRef = useRef<number>(maxPage);

	useEffect(() => {
		pfPlanIdRef.current = pfPlanId;
	}, [pfPlanId]);

	useEffect(() => {
		pageRef.current = page;
	}, [page]);

	useEffect(() => {
		maxPageRef.current = maxPage;
	}, [maxPage]);

	useEffect(() => {
		return () => {
			observerRef.current?.disconnect();
			observerRef.current = null;
		};
	}, []);

	const fetchPage = useCallback(
		async (targetPage: number, replace: boolean) => {
			if (!pfPlanIdRef.current) return;
			if (loadingRef.current) return;
			loadingRef.current = true;
			setIsLoading(true);
			try {
				const response = await listPfPlanDailies(pfPlanIdRef.current, {
					page: targetPage,
					pageItems: PAGE_ITEMS,
				});
				const normalized = response.data.map(normalizeDaily);
				setDailies((prev) => (replace ? normalized : [...prev, ...normalized]));
				setPage(response.page);
				setMaxPage(response.max_page);
			} catch (error) {
				const apiError = error as ErrorModel;
				showSnackBar({
					message: apiError?.msg ?? "Failed to load PF Plan Dailies.",
					success: false,
				});
			} finally {
				loadingRef.current = false;
				setIsLoading(false);
				setIsInitialLoad(false);
			}
		},
		[showSnackBar],
	);

	const reload = useCallback(async () => {
		if (!pfPlanIdRef.current) return;
		setIsInitialLoad(true);
		setDailies([]);
		setPage(1);
		setMaxPage(1);
		lastFireScrollTopRef.current = Number.NEGATIVE_INFINITY;
		await fetchPage(1, true);
	}, [fetchPage]);

	useEffect(() => {
		if (!pfPlanId) {
			setDailies([]);
			setIsInitialLoad(false);
			return;
		}
		void reload();
	}, [pfPlanId, reload]);

	// Callback ref keeps a single persistent observer attached to whatever
	// sentinel node is in the tree. IntersectionObserver only fires on
	// intersection-state transitions, so re-fires after each page load are
	// avoided as long as we don't disconnect/reconnect on every render.
	const sentinelRefCallback = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) {
				observerRef.current?.disconnect();
				observerRef.current = null;
				return;
			}
			if (observerRef.current) return;

			const findScrollParent = (el: HTMLElement | null): HTMLElement | null => {
				let current = el?.parentElement ?? null;
				while (current) {
					const style = window.getComputedStyle(current);
					const overflowY = style.overflowY;
					if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
						return current;
					}
					current = current.parentElement;
				}
				return null;
			};

			const scrollParent = findScrollParent(node);
			scrollParentRef.current = scrollParent;

			observerRef.current = new IntersectionObserver(
				(entries) => {
					const entry = entries[0];
					if (!entry?.isIntersecting) return;
					if (loadingRef.current) return;
					if (reorderInFlightRef.current) return;
					if (!pfPlanIdRef.current) return;
					if (pageRef.current >= maxPageRef.current) return;

					// Require the user to scroll meaningfully between fires. Without
					// this, a short list keeps the sentinel inside the expanded root
					// (rootMargin) the entire time and pages cascade-load on re-render.
					const scrollTop = scrollParentRef.current?.scrollTop ?? window.scrollY;
					if (scrollTop <= lastFireScrollTopRef.current + 80) return;
					lastFireScrollTopRef.current = scrollTop;

					void fetchPage(pageRef.current + 1, false);
				},
				// Positive rootMargin fires while the sentinel is still well below the
				// viewport, so by the time the user keeps scrolling the next page is
				// already loaded — new items end up below the fold instead of jumping
				// into view at the user's current position.
				{ root: scrollParent, rootMargin: "300px 0px", threshold: 0 },
			);
			observerRef.current.observe(node);
		},
		[fetchPage],
	);

	const togglePanel = () => {
		setIsPanelOpen((prev) => !prev);
	};

	const onAddDay = () => {
		setSelectedDay(null);
		setIsPanelOpen(true);
	};

	const handleEditDay = (day: PfPlanDailies) => {
		setSelectedDay(day);
		setIsPanelOpen(true);
	};

	const handlePersistDay = async (day: PfPlanDailies): Promise<void> => {
		if (!pfPlanIdRef.current) throw new Error("PF Plan must be saved before adding dailies.");
		const input = buildDailyInput(day);
		if (day.id) {
			await updatePfPlanDaily(pfPlanIdRef.current, day.id, input);
		} else {
			await createPfPlanDaily(pfPlanIdRef.current, input);
		}
		setIsPanelOpen(false);
		await reload();
	};

	const handleCopyDay = async (day: PfPlanDailies) => {
		if (!pfPlanIdRef.current) return;
		try {
			const newDayNumber = (dailies[dailies.length - 1]?.day ?? dailies.length) + 1;
			const input = buildDailyInput({
				...day,
				id: undefined,
				day: newDayNumber,
				name: `${day.name} - Copy`,
				contents: day.contents.map((content) => {
					if ("exercise" in content && content.exercise) {
						const exercise = content as PfPlanExerciseModel;
						return { ...exercise, id: undefined };
					}
					const education = content as EducationModel & {
						pfPlanDayContentId?: number;
					};
					return { ...education, pfPlanDayContentId: undefined };
				}),
			});
			await createPfPlanDaily(pfPlanIdRef.current, input);
			showSnackBar({ message: "Day copied successfully.", success: true });
			await reload();
		} catch (error) {
			const apiError = error as ErrorModel;
			showSnackBar({
				message: apiError?.msg ?? "Failed to copy day.",
				success: false,
			});
		}
	};

	const handleDeleteConfirm = async () => {
		if (!pfPlanIdRef.current || !dayToDelete?.id || isDeleting) return;
		try {
			setIsDeleting(true);
			await deletePfPlanDaily(pfPlanIdRef.current, dayToDelete.id);
			showSnackBar({ message: "Day deleted successfully.", success: true });
			setDayToDelete(null);
			await reload();
		} catch (error) {
			const apiError = error as ErrorModel;
			showSnackBar({
				message: apiError?.msg ?? "Failed to delete day.",
				success: false,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const onDragEnd = async (result: DropResult) => {
		const { destination, source, draggableId } = result;
		if (!destination || destination.index === source.index) return;
		if (!pfPlanIdRef.current) return;

		const dailyId = Number(draggableId);
		const targetDaily = dailies[destination.index];
		if (!targetDaily) return;
		const newDay = targetDaily.day;

		// Optimistic local reorder. Loaded dailies always form a contiguous
		// day:asc prefix from day 1, so reindexing by position mirrors the
		// server-side shift (see API contract: contiguous shift between oldDay
		// and newDay) without needing a refetch.
		const previous = dailies;
		const next = [...dailies];
		const [moved] = next.splice(source.index, 1);
		next.splice(destination.index, 0, moved);
		const reindexed = next.map((daily, index) => ({
			...daily,
			day: index + 1,
		}));
		setDailies(reindexed);
		reorderInFlightRef.current = true;

		try {
			await reorderPfPlanDaily(pfPlanIdRef.current, dailyId, newDay);
		} catch (error) {
			setDailies(previous);
			const apiError = error as ErrorModel;
			showSnackBar({
				message: apiError?.msg ?? "Failed to reorder day.",
				success: false,
			});
		} finally {
			reorderInFlightRef.current = false;
		}
	};

	if (!pfPlanId) {
		return (
			<Card className="min-h-[300px] flex flex-col items-center justify-center text-center px-3 sm:px-5">
				<h2 className="text-xl font-semibold mb-2">Save the plan first</h2>
				<p className="text-neutral-500 max-w-md">
					Save this PF Plan as a draft to start adding daily content. Dailies are managed independently once a plan
					exists.
				</p>
			</Card>
		);
	}

	const showEmpty = !isInitialLoad && dailies.length === 0;
	const canMutate = !isArchived && !readOnly;

	return (
		<>
			<Card className="min-h-[300px] px-3 sm:px-5">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-semibold">PF Plan Dailies</h1>
					{dailies.length > 0 && canMutate && (
						<Button label="Add Day" outlined onClick={onAddDay} className="!py-2 !px-4" />
					)}
				</div>

				{readOnly && readOnlyNotice && (
					<p className="mt-3 rounded-md bg-primary-50 border border-primary-100 px-3 py-2 text-sm text-neutral-700">
						{readOnlyNotice}
					</p>
				)}

				{isInitialLoad ? (
					<div className="flex justify-center items-center py-16">
						<Loader />
					</div>
				) : showEmpty ? (
					<div className="flex flex-col justify-center items-center text-center py-16">
						<p className="text-neutral-400 mb-3">
							{isArchived
								? "No PF Plan Daily Content"
								: "Add day from the Add Day Panel to begin creating your PF Plan"}
						</p>
						{canMutate && <Button label="Add Day" outlined onClick={onAddDay} />}
					</div>
				) : (
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable droppableId="DailiesList">
							{(provided) => (
								<div className="space-y-4 mt-6" ref={provided.innerRef} {...provided.droppableProps}>
									{dailies.map((item, index) => (
										<Draggable
											key={`daily-${item.id ?? item.day}`}
											draggableId={(item.id ?? item.day).toString()}
											index={index}
											isDragDisabled={!canMutate}
										>
											{(provided, snapshot) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													className={clsx(
														"flex items-center border rounded-md border-neutral-300 group p-3 sm:p-4",
														snapshot.isDragging ? "drop-shadow-center !top-auto !left-auto bg-white" : "",
													)}
												>
													{canMutate && (
														<MoveTaskIcon className="inline-block mr-2 cursor-grab active:cursor-grabbing" />
													)}
													<div className="text-xl sm:text-[22px] font-medium whitespace-nowrap">Day {item.day} -</div>
													<div className="ml-2 mr-3 text-[18px] font-semibold">{item.name}</div>
													{canMutate && (
														<div className="flex space-x-3 ml-auto">
															<IconCopy
																size={24}
																className="text-primary-500 cursor-pointer"
																onClick={() => void handleCopyDay(item)}
															/>
															<PencilIcon
																onClick={(e) => {
																	e.stopPropagation();
																	handleEditDay(item);
																}}
															/>
															<TrashbinIcon
																className="text-error-600 ml-auto cursor-pointer"
																onClick={() => setDayToDelete(item)}
															/>
														</div>
													)}
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				)}

				{!isInitialLoad && dailies.length > 0 && (
					<div ref={sentinelRefCallback} className="flex justify-center items-center py-4 mt-2 [overflow-anchor:none]">
						{page < maxPage && <Loader />}
					</div>
				)}
			</Card>

			<AddDayPanel
				isOpen={isPanelOpen}
				onClose={togglePanel}
				onPersistDay={handlePersistDay}
				currentDayCount={(dailies[dailies.length - 1]?.day ?? dailies.length) + 1}
				daysForValidation={dailies}
			/>

			<ConfirmModal
				title="Are you sure you want to delete this day?"
				subTitle={CONFIRM_DELETE_DESCRIPTION}
				isOpen={dayToDelete !== null}
				confirmBtnLabel="Delete"
				isProcessing={isDeleting}
				onConfirm={handleDeleteConfirm}
				onClose={() => {
					if (!isDeleting) setDayToDelete(null);
				}}
			/>
		</>
	);
}
