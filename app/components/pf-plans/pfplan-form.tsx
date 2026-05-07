"use client";

import Button from "@/app/components/elements/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/elements/Tabs";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import useAuth from "@/app/hooks/useAuth";
import {
	CONFIRM_DELETE_DESCRIPTION,
	CONFIRM_SAVE_DESCRIPTION,
	CREATE_PFPLAN_DESCRIPTION,
	PERMISSIONS,
	UPDATE_DESCRIPTION,
} from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { getFileContentType } from "@/app/lib/utils";
import type { OptionsModel } from "@/app/models/common_model";
import type { ErrorModel } from "@/app/models/error_model";
import type { PatientModel } from "@/app/models/patient_model";
import type { CategoryOptionsModel, PfPlanModel } from "@/app/models/pfplan_model";
import type { ValidationErrorModel } from "@/app/models/validation_error_model";
import { savePersonalizedPfPlan } from "@/app/services/client_side/patients";
import { deletePfPlan, savePfPlan } from "@/app/services/client_side/pfplans";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ContentCategory from "../content-category";
import Card from "../elements/Card";
import { FormSkeletons } from "../elements/FormSkeletons";
import InfoPopover from "../elements/InfoPopover";
import Input from "../elements/Input";
import SelectCmp from "../elements/SelectCmp";
import StatusBadge from "../elements/StatusBadge";
import TipTapEditor from "../elements/TipTapEditor";
import ToggleSwitch from "../elements/ToggleSwitch";
import UploadCmp from "../elements/UploadCmp";
import PencilIcon from "../icons/pencil_icon";
import PfPlanDailiesTab from "./pfplan-dailies-tab";
import { validateForm } from "./validation";

const ConfirmModal = dynamic(() => import("@/app/components/elements/ConfirmModal"), { ssr: false });

interface Props {
	action: "Create" | "Edit";
	pfPlan?: PfPlanModel;
	patient?: PatientModel;
}

export default function PfPlanForm({ action = "Create", pfPlan, patient }: Props) {
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
	const { hasPermission, isLoaded } = useAuth();

	const [name, setName] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [category, setCategory] = useState<CategoryOptionsModel[] | null>(null);
	const [isCustom, setIsCustom] = useState<boolean>(false);
	const [content, setContent] = useState("");
	const [trimester, setTrimester] = useState<number | undefined>();
	const [photo, setPhoto] = useState<File | null>(null);
	const [mediaUrl, setMediaUrl] = useState<string>("");
	const [mediaUpload, setMediaUpload] = useState<File | null>(null);
	const [statusId, setStatusId] = useState<"4" | "5">("4");

	const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [editInfo, setEditInfo] = useState<boolean>(action === "Create");

	const [activeTab, setActiveTab] = useState<"details" | "dailies">("details");
	const [modalOpen, setModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
			setTrimester(pfPlan.trimester ?? undefined);
			setIsCustom(pfPlan.is_custom ?? false);
			setMediaUrl(pfPlan.media_url ?? "");
		}
	}, [pfPlan, action]);

	const handleFileSelect = (file: File | null) => {
		setPhoto(file);
	};

	const handleMediaSelect = (file: File | null) => {
		setMediaUpload(file);
	};

	const isValid = () => {
		const validationErrors = validateForm({
			name,
			description,
			content: content,
			photo:
				photo ??
				(action === "Edit" && ((patient && pfPlan?.user_id === patient.id) || !patient) ? pfPlan?.photo : undefined),
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

				body.append("name", name);
				if (description) body.append("description", description);
				body.append("category_id", JSON.stringify(category?.map((el: CategoryOptionsModel) => Number(el.value)) ?? []));
				body.append("content", content);
				body.append("trimester", trimester?.toString() ?? "0");
				body.append("status_id", statusId);
				body.append("is_custom", patient ? "false" : isCustom.toString());
				if (photo) body.append("photo", photo);
				body.append("media_url", mediaUrl);
				if (mediaUpload) {
					const ext = mediaUpload.name.split(".").pop()?.toLowerCase() ?? "";
					if (["mp4", "avi", "mov", "wmv", "mkv"].includes(ext)) {
						const blob = new Blob([mediaUpload], {
							type: getFileContentType(mediaUpload),
						});
						body.append("media_upload", blob, mediaUpload.name);
					} else {
						body.append("media_upload", mediaUpload, mediaUpload.name);
					}
				}

				if (patient) {
					const personalizedPfPlanId = pfPlan?.user_id === patient.id ? id : undefined;
					const personalizedPfPlan = await savePersonalizedPfPlan({
						method: personalizedPfPlanId ? "PUT" : "POST",
						id: personalizedPfPlanId,
						body,
						userId: patient.id,
					});
					await revalidatePage(`/patients/${patient.id}/edit`);
					if (pfPlan) {
						router.replace(`${personalizedPfPlan.id.toString()}`);
					} else {
						router.replace(`pf-plan/${personalizedPfPlan.id.toString()}`);
					}
				} else {
					await savePfPlan({ method, id, body });
					await revalidatePage("/contents/pf-plans");
				}

				setIsProcessing(false);
				showSnackBar({
					message: `Pf Plan successfully ${action === "Create" ? "created" : "updated"}.`,
					success: true,
				});
				setModalOpen(false);
				clearData();
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
				if (!patient) await revalidatePage("/contents/pf-plans");
				setIsProcessing(false);
				showSnackBar({
					message: "Pf Plan successfully deleted.",
					success: true,
				});
				setModalOpen(false);
				if (patient) {
					await revalidatePage(`/patients/${patient.id}/edit`);
					router.push(`/patients/${patient.id}/edit`);
				} else {
					router.push("/contents/pf-plans");
				}
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

	const clearData = () => {
		setName("");
		setCategory(null);
		setIsCustom(false);
		setDescription("");
		setContent("");
		setPhoto(null);
		setMediaUrl("");
		setMediaUpload(null);
		setTrimester(undefined);
	};

	const onToggleSwitch = (value: string) => {
		setIsCustom(value.toLowerCase() === "custom");
	};

	if (!isLoaded) return <FormSkeletons />;

	if (isLoaded && patient && !hasPermission(PERMISSIONS.PATIENT_ASSIGN_PFPLAN)) return notFound();

	if (isLoaded && pfPlan && !hasPermission(PERMISSIONS.PFPLAN_EDIT)) return notFound();

	if (isLoaded && !pfPlan && !hasPermission(PERMISSIONS.PFPLAN_CREATE)) return notFound();

	return (
		<>
			<div className="flex items-center mb-4 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">{patient ? patient.user_profile.name : action} PF Plan</h1>
					<p className="text-sm text-neutral-600">
						{action === "Create" ? CREATE_PFPLAN_DESCRIPTION : UPDATE_DESCRIPTION}
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
					{patient ? (
						<>
							{!pfPlan?.is_archived && (
								<>
									<Button label="Cancel" onClick={() => router.back()} secondary />
									<Button label="Save" onClick={onPublish} />
								</>
							)}
						</>
					) : (
						<>
							<Link href="/contents/pf-plans">
								<Button label="Cancel" secondary />
							</Link>
							<Button label="Save as Draft" outlined onClick={onDraft} />
							<Button label="Save & Publish" onClick={onPublish} />
						</>
					)}
				</div>
			</div>
			<hr />
			<div className="mt-5 sm:mt-6 border-l-4 border-primary-500 pl-4">
				<div className="flex flex-row items-center justify-center sm:w-[674px]">
					{!patient && (
						<>
							<div>
								<StatusBadge label={pfPlan ? pfPlan.status.value : "Draft"} />
							</div>
							<div className="ml-auto">
								<div className="flex items-center space-x-2">
									<ToggleSwitch
										label1="Public"
										label2="Custom"
										active={!isCustom ? "Public" : "Custom"}
										onToggle={onToggleSwitch}
									/>
									<InfoPopover side="right" className="!z-[99]">
										<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1 !z-[99]">
											<span className="font-semibold">PF Plan Visibility</span>
											<p className="text-xs">
												<b>Public</b> - PF Plans are visible to all users. <br />
												<b>Custom</b> - PF Plans are only available for auto suggestions when users go through the
												PFDI-20 assessment and Pregnancy Screening.
											</p>
											<p className="text-xs">
												<i className="text-error-600">
													Note: Custom PF Plans that are linked to trimester will only be used for users who are
													pregnant and have selected the corresponding trimester or postpartum months.
												</i>
											</p>
										</div>
									</InfoPopover>
								</div>
							</div>
						</>
					)}
				</div>
				<div className="flex space-x-4 items-center mt-3">
					{editInfo ? (
						<Input
							type="text"
							placeholder="Treatment name"
							value={name}
							invalid={false}
							onChange={(e) => setName(e.target.value)}
							className="sm:!w-[674px]"
						/>
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
			</div>

			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "dailies")} className="mt-6">
				<TabsList>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger
						value="dailies"
						disabled={action === "Create" || !pfPlan?.id}
						className={clsx((action === "Create" || !pfPlan?.id) && "opacity-50 cursor-not-allowed")}
					>
						PF Plan Dailies
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="mt-4">
					<div className="flex flex-col sm:flex-row">
						<Card className="sm:w-[693px] px-3 sm:px-5 sm:mr-5 mb-5 sm:mb-0">
							<ContentCategory
								className="z-[99]"
								categories={category}
								onChange={(e) => setCategory(e as OptionsModel[])}
							/>
							<div className="mt-4">
								<div className="flex space-x-1 items-end mb-2">
									<p className="font-medium">Trimester</p>
									<InfoPopover side="right" className="!z-[99]">
										<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1 !z-[99]">
											<span className="font-semibold">Trimester</span>
											<p className="text-xs">
												A trimester marks one of the three stages of pregnancy. Selecting a trimester in the pelvic
												floor plan lets the system match the appropriate plan to pregnant users during signup. Selecting
												4th trimester will match the plan to users who are 36 weeks pregnant or later.
											</p>
										</div>
									</InfoPopover>
								</div>
								<SelectCmp
									options={Array.from({ length: 4 }, (_, index) => ({
										label: `Trimester ${index + 1}`,
										value: (index + 1).toString(),
									}))}
									isClearable={true}
									value={
										trimester
											? {
													label: `Trimester ${trimester}`,
													value: trimester.toString(),
												}
											: undefined
									}
									onChange={(e) => setTrimester(e?.value ? Number(e?.value) : undefined)}
								/>
							</div>
							<div className="mt-4">
								<p className="font-medium mb-2">Description</p>
								<TipTapEditor
									placeholder="Create a description for your treatment plan"
									content={description ?? undefined}
									onChange={(value) => setDescription(value)}
									editorClassName="!h-[200px]"
								/>
							</div>
							<div className="mt-4">
								<p className="font-medium mb-2">Content</p>
								<TipTapEditor
									placeholder="Enter the PF Plan's content here"
									content={content ?? undefined}
									onChange={(value) => setContent(value)}
								/>
							</div>
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
									previewImage={patient ? patient.id === pfPlan?.user_id : true}
									fileUrl={patient ? (patient.id === pfPlan?.user_id ? pfPlan?.photo : undefined) : pfPlan?.photo}
								/>
							</Card>
							{action === "Edit" && !pfPlan?.is_archived && (
								<Button
									label="Delete"
									outlined
									className="hidden sm:block mt-5 ml-auto"
									onClick={() => setDeleteModalOpen(true)}
								/>
							)}
						</div>
					</div>

					<Card className="sm:w-[694px] space-y-3 mt-5">
						<p className="font-medium">Upload Video/Image or URL</p>
						<hr />
						<div>
							<p className="font-medium mb-2">Video/Image URL</p>
							<Input
								type="text"
								placeholder="www.yourvideolink.com"
								value={mediaUrl}
								onChange={(e) => setMediaUrl(e.target.value)}
							/>
						</div>
						<p className="text-sm font-medium mb-2 text-center">OR</p>
						<UploadCmp
							key="pfplan-media-upload"
							label="Upload a video/image"
							onFileSelect={handleMediaSelect}
							clearImagePreview={mediaUpload === null}
							type="image/video"
							isEdit={action === "Edit"}
							previewImage={patient ? patient.id === pfPlan?.user_id : true}
							fileUrl={
								patient
									? patient.id === pfPlan?.user_id
										? (pfPlan?.media_upload ?? undefined)
										: undefined
									: (pfPlan?.media_upload ?? undefined)
							}
						/>
					</Card>
				</TabsContent>

				<TabsContent value="dailies" className="mt-4">
					<PfPlanDailiesTab
						pfPlanId={pfPlan?.id ?? null}
						isArchived={pfPlan?.is_archived ?? false}
						readOnly={!!patient && pfPlan?.user_id !== patient.id}
						readOnlyNotice={
							patient && pfPlan?.user_id !== patient.id
								? "This is the original PF Plan. Save it for this patient first to start customizing daily content."
								: undefined
						}
					/>
				</TabsContent>
			</Tabs>

			<div className="sm:hidden order-last flex flex-col w-full mt-6 space-y-3">
				<Link href="/contents/pf-plans">
					<Button label="Cancel" secondary className="w-full" />
				</Link>
				<Button label="Save as Draft" outlined onClick={onDraft} />
				<Button label="Save & Publish" onClick={onPublish} />
			</div>

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
