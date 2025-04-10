"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import {
	CONFIRM_DELETE_DESCRIPTION,
	CONFIRM_SAVE_DESCRIPTION,
	CREATE_PFPLAN_DESCRIPTION,
	UPDATE_DESCRIPTION,
} from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { convertDraftjsToHtml } from "@/app/lib/utils";
import type { EducationModel } from "@/app/models/education_model";
import type { ErrorModel } from "@/app/models/error_model";
import type { CategoryOptionsModel, PfPlanDailies, PfPlanExerciseModel, PfPlanModel } from "@/app/models/pfplan_model";
import type { ValidationErrorModel } from "@/app/models/validation_error_model";
import { deletePfPlan, savePfPlan } from "@/app/services/client_side/pfplans";
import { usePfPlanDailiesStore } from "@/app/store/store";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import clsx from "clsx";
import { ContentState, EditorState } from "draft-js";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "../elements/Card";
import Input from "../elements/Input";
import StatusBadge from "../elements/StatusBadge";
import Textarea from "../elements/Textarea";
import UploadCmp from "../elements/UploadCmp";
import MoveTaskIcon from "../icons/move_task_icon";
import PencilIcon from "../icons/pencil_icon";
import TrashbinIcon from "../icons/trashbin_icon";
import AddDayPanel from "./add-day-panel";
import { validateForm } from "./validation";
import TipTapEditor from "../elements/TipTapEditor";
import SelectCmp from "../elements/SelectCmp";
import { getSurveyGroups } from "@/app/services/client_side/surveys";
import ToggleSwitch from "../elements/ToggleSwitch";

const ConfirmModal = dynamic(() => import("@/app/components/elements/ConfirmModal"), { ssr: false });

interface Props {
	action: "Create" | "Edit";
	pfPlan?: PfPlanModel;
}

export default function PfPlanForm({ action = "Create", pfPlan }: Props) {
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
	const { days, removeDay, setDays, setSelectedDay } = usePfPlanDailiesStore();

	const [name, setName] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [category, setCategory] = useState<CategoryOptionsModel[] | null>(null);
	const [isCustom, setIsCustom] = useState<boolean>(false);
	const [content, setContent] = useState("");
	const [photo, setPhoto] = useState<File | null>(null);
	const [statusId, setStatusId] = useState<"4" | "5">("4");

	const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [isSaved, setIsSaved] = useState<boolean>(false);
	const [editInfo, setEditInfo] = useState<boolean>(action === "Create");

	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	const [categoryList, setCategoryList] = useState<CategoryOptionsModel[]>([]);

	useEffect(() => {
		if (action === "Edit" && pfPlan) {
			setName(pfPlan.name);
			setDescription(pfPlan.description);
			setContent(pfPlan.content);
			setCategory(
				pfPlan.categories
					? pfPlan.categories.map((el) => ({
							label: el.value,
							value: el.id.toString(),
						}))
					: null,
			);
			setIsCustom(pfPlan.is_custom ?? false);
			const dailies = pfPlan.pf_plan_dailies.map(
				(item: {
					id?: number;
					name: string;
					day: number;
					contents: Record<string, any>[];
				}) => ({
					id: item.id,
					name: item.name,
					day: item.day,
					contents: item.contents.map((el) => {
						if (el.exercise) {
							return {
								id: el.id,
								exercise_id: el.exercise.id,
								sets: el.exercise.sets,
								reps: el.exercise.reps,
								hold: el.exercise.hold,
								exercise: el.exercise,
							};
						}

						const education = el.education;
						education.pfPlanDayContentId = el.id;
						return education;
					}),
				}),
			);
			setDays(dailies);
		}
		return () => {
			setDays([]);
		};
	}, [pfPlan]);

	const handleFileSelect = (file: File | null) => {
		setPhoto(file);
	};

	const togglePanel = () => {
		setIsPanelOpen((prev) => !prev);
	};

	const onDragEnd = (result: any) => {
		const { destination, source } = result;
		if (!destination) return;

		const updatedDays = [...days];
		// Remove the dragged day from its original position
		const [movedDays] = updatedDays.splice(source.index, 1);
		// Insert the dragged day into its new position
		updatedDays.splice(destination.index, 0, movedDays);
		// Reassign the 'day' property (or id) for each day based on its new position
		const reindexedDays = updatedDays.map((day, index) => ({
			...day,
			day: index + 1,
		}));

		// Replace the current days with the reindexed days
		setDays(reindexedDays);
	};

	const isValid = () => {
		const validationErrors = validateForm({
			name,
			description,
			content: content,
			photo: photo ?? pfPlan?.photo,
			dayLength: days.length,
		});
		setErrors(validationErrors);
		return validationErrors.length === 0;
	};

	useEffect(() => {
		if (errors.length > 0) {
			const errorMessages = errors.map((error) => error.message).join("\n");
			showSnackBar({ message: errorMessages, success: false });
		}
	}, [errors]);

	const handleCloseModal = () => {
		if (!isProcessing) {
			setModalOpen(false);
			setDeleteModalOpen(false);
		}
	};

	const onPublish = () => {
		if (isValid()) {
			setStatusId("5");
			setModalOpen(true);
		}
	};

	const onDraft = () => {
		if (isValid()) {
			setStatusId("4");
			setModalOpen(true);
		}
	};

	const handleConfirm = async () => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				const method = action === "Create" ? "POST" : "PUT";
				const id = action === "Edit" ? pfPlan?.id : null;
				const body = new FormData();

				const dailiesPayload = days.map((item) => ({
					daily_id: item.id,
					name: item.name,
					day: item.day,
					contents: item.contents
						.map((el) => {
							if ("exercise" in el) {
								const exercise = el as PfPlanExerciseModel;
								const data = {
									content_id: el.id,
									exercise_id: exercise.exercise_id,
									sets: exercise.sets,
									reps: exercise.reps,
									hold: exercise.hold,
								};
								return data;
							}

							const education = el as EducationModel;
							return {
								content_id: education.pfPlanDayContentId,
								education_id: education.id,
							};
						})
						.filter(Boolean),
				}));

				body.append("name", name);
				if (description) body.append("description", description);
				body.append("category_id", JSON.stringify(category?.map((el: CategoryOptionsModel) => Number(el.value)) ?? []));
				body.append("content", content);
				body.append("status_id", statusId);
				body.append("is_custom", isCustom.toString());
				if (photo) body.append("photo", photo);
				if (dailiesPayload.length) {
					body.append("dailies", JSON.stringify(dailiesPayload));
				}

				await savePfPlan({ method, id, body });
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: `Pf Plan successfully ${action === "Create" ? "created" : "updated"}.`,
					success: true,
				});
				setModalOpen(false);
				clearData();
				// setIsSaved(true);
			} catch (error) {
				const apiError = error as ErrorModel;
				if (apiError.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setModalOpen(false);
			}
		}
	};

	const handleDeleteConfirm = async () => {
		if (!isProcessing && pfPlan && action === "Edit") {
			try {
				setIsProcessing(true);
				await deletePfPlan(pfPlan.id);
				await revalidatePage("/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: "Pf Plan successfully deleted.",
					success: true,
				});
				setModalOpen(false);
				router.push("/pf-plans");
			} catch (error) {
				const apiError = error as ErrorModel;
				if (apiError.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setDeleteModalOpen(false);
			}
		}
	};

	const handleEditDay = (day: PfPlanDailies) => {
		setSelectedDay(day);
		setIsPanelOpen(true);
	};

	const handleEditorChange = (content: string) => {
		setContent(content);
		// setIsSaved(false);
	};

	const clearData = () => {
		setName("");
		setCategory(null);
		setIsCustom(false);
		setDescription("");
		setContent("");
		setPhoto(null);
		setSelectedDay(null);
		setDays([]);
	};

	const getCategories = async () => {
		try {
			const list = await getSurveyGroups();
			const transformList = list.map((el) => ({
				label: el.description,
				value: el.id.toString(),
			}));
			setCategoryList(transformList);
		} catch (error) {
			const apiError = error as ErrorModel;
			const errorMessage = apiError.msg || "Failed to fetch pf plan categories";
			throw new Error(errorMessage);
		}
	};

	useEffect(() => {
		getCategories();
	}, []);

	const onToggleSwitch = (value: string) => {
		setIsCustom(value.toLowerCase() === "custom");
	};

	return (
		<>
			<div className="flex items-center mb-4 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">{action} PF Plan</h1>
					<p className="text-sm text-neutral-600">
						{action === "Create" ? CREATE_PFPLAN_DESCRIPTION : UPDATE_DESCRIPTION}
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
					<Link href="/pf-plans">
						<Button label="Cancel" secondary />
					</Link>
					<Button label="Save as Draft" outlined onClick={onDraft} />
					<Button label="Save & Publish" onClick={onPublish} />
				</div>
			</div>
			<hr />
			<div className="mt-5 sm:mt-6 border-l-4 border-primary-500 pl-4">
				<div className="flex flex-row items-center justify-center sm:w-[674px]">
					<div>
						<StatusBadge label={pfPlan ? pfPlan.status.value : "Draft"} />
					</div>
					<div className="ml-auto">
						<ToggleSwitch
							label1="Public"
							label2="Custom"
							active={!isCustom ? "Public" : "Custom"}
							onToggle={onToggleSwitch}
						/>
					</div>
				</div>
				<div className="flex space-x-4 items-center mt-3">
					{editInfo ? (
						<>
							<Input
								type="text"
								placeholder="Treatment name"
								value={name}
								invalid={false}
								onChange={(e) => setName(e.target.value)}
								className="sm:!w-[674px]"
							/>
						</>
					) : (
						<>
							<p className="text-xl sm:text-2xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
								{name}
							</p>
							<div onClick={() => setEditInfo(true)} onKeyDown={() => {}} className="cursor-pointer">
								<PencilIcon />
							</div>
						</>
					)}
				</div>
				<div className={clsx(editInfo ? "sm:w-[674px]" : "")}>
					{editInfo ? (
						<Textarea
							placeholder="Create a description for your treatment plan"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="mt-3"
						/>
					) : (
						<p>{description}</p>
					)}
				</div>
			</div>
			<div className="flex flex-col sm:flex-row mt-4">
				<Card className="sm:w-[693px] min-h-[200px] sm:min-h-[300px] px-3 sm:px-5 sm:mr-5 mb-5 sm:mb-0">
					<div className="flex justify-between">
						<h1 className="text-2xl font-semibold">PF Plan</h1>
						{days.length > 0 && <Button label="Add Day" outlined onClick={togglePanel} className="!py-2 !px-4" />}
					</div>
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable droppableId="ExerciseList">
							{(provided) => (
								<div className="space-y-4 mt-6" ref={provided.innerRef} {...provided.droppableProps}>
									{days.map((item, index) => (
										<Draggable key={`key${item.day}`} draggableId={item.day.toString()} index={index}>
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
													<MoveTaskIcon className="hidden group-hover:inline-block mr-2" />
													<div className="text-xl sm:text-[22px] font-medium whitespace-nowrap">Day {item.day} -</div>
													<div className="ml-2 mr-3 text-[18px] font-semibold">{item.name}</div>
													<div className="flex space-x-3 ml-auto">
														<PencilIcon
															onClick={(e) => {
																e.stopPropagation();
																handleEditDay(item);
															}}
														/>
														<TrashbinIcon className="text-error-600 ml-auto" onClick={() => removeDay(item.day)} />
													</div>
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
					{days.length === 0 && (
						<div className="flex flex-col justify-center items-center text-center h-full sm:mt-0">
							<p className="text-neutral-400 mb-3">Add day from the Add Day Panel to begin creating your PF Plan</p>
							<Button label="Add Day" outlined onClick={togglePanel} />
						</div>
					)}
				</Card>
				<div>
					<Card className="sm:w-[446px] h-fit">
						<UploadCmp
							label="Upload a Photo"
							onFileSelect={handleFileSelect}
							clearImagePreview={photo === null}
							type="image"
							recommendedText="405 x 225 pixels"
							isEdit={action === "Edit"}
						/>
					</Card>
					{action === "Edit" && (
						<Button
							label="Delete"
							outlined
							className="hidden sm:block mt-5 ml-auto"
							onClick={() => setDeleteModalOpen(true)}
						/>
					)}
				</div>
			</div>
			<Card className="sm:w-[694px] mt-5 space-y-3">
				<div>
					<p className="font-medium mb-2">Category</p>
					<SelectCmp
						isMulti={true}
						options={categoryList}
						value={category}
						invalid={false}
						onChange={(e) => setCategory(e as CategoryOptionsModel[])}
						placeholder="Choose category"
					/>
				</div>
				<div>
					<p className="font-medium mb-2">Content</p>
					<TipTapEditor
						placeholder="Enter the PF Plan's content here"
						content={content ?? undefined}
						onChange={handleEditorChange}
					/>
				</div>
			</Card>
			<div className="sm:hidden order-last flex flex-col w-full mt-6 space-y-3">
				<Link href="/pf-plans">
					<Button label="Cancel" secondary className="w-full" />
				</Link>
				<Button label="Save as Draft" outlined onClick={onDraft} />
				<Button label="Save & Publish" onClick={onPublish} />
			</div>
			<AddDayPanel isOpen={isPanelOpen} onClose={togglePanel} />
			<ConfirmModal
				title={`Are you sure you want to ${action === "Create" ? "create this PF Plan?" : "save this changes?"} `}
				subTitle={CONFIRM_SAVE_DESCRIPTION}
				isOpen={modalOpen}
				confirmBtnLabel="Save"
				isProcessing={isProcessing}
				onConfirm={handleConfirm}
				onClose={handleCloseModal}
			/>
			{action === "Edit" && (
				<ConfirmModal
					title="Are you sure you want to delete this PF Plan?"
					subTitle={CONFIRM_DELETE_DESCRIPTION}
					isOpen={deleteModalOpen}
					confirmBtnLabel="Delete"
					isProcessing={isProcessing}
					onConfirm={handleDeleteConfirm}
					onClose={handleCloseModal}
				/>
			)}
		</>
	);
}
