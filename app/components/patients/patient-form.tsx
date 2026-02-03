"use client";

import Button from "@/app/components/elements/Button";
import ConfirmModal from "@/app/components/elements/ConfirmModal";
import DateInput from "@/app/components/elements/DateInput";
import Input from "@/app/components/elements/Input";
import ReqIndicator from "@/app/components/elements/ReqIndicator";
import Textarea from "@/app/components/elements/Textarea";
import ToggleSwitch from "@/app/components/elements/ToggleSwitch";
import UploadCmp from "@/app/components/elements/UploadCmp";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import {
	CONFIRM_DELETE_DESCRIPTION,
	CONFIRM_SAVE_DESCRIPTION,
	CREATE_PATIENT_DESCRIPTION,
	PERMISSIONS,
	UPDATE_DESCRIPTION,
} from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDate, onPhoneNumKeyDown } from "@/app/lib/utils";
import type {
	BladderDiaryEntryModel,
	BladderDiaryTimeSlot,
} from "@/app/models/bladder_diary_model";
import type {
	BowelDiaryEntryModel,
	BowelDiaryTimeSlot,
} from "@/app/models/bowel_diary_model";
import type { ErrorModel } from "@/app/models/error_model";
import type { PatientModel, PatientSurveyModel, PfPlanProgressModel } from "@/app/models/patient_model";
import type { UserToolsModel } from "@/app/models/user_tools_model";
import type { ValidationErrorModel } from "@/app/models/validation_error_model";
import { deletePatient, savePatient } from "@/app/services/client_side/patients";
import { updateUserTools } from "@/app/services/client_side/user-tools";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "../elements/DataTable";
import ProgressBar from "../elements/ProgressBar";
import { validateForm } from "./validation";
import { PfPlanListModal } from "./pf-plan-list.modal";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import clsx from "clsx";
import useAuth from "@/app/hooks/useAuth";
import { FormSkeletons } from "../elements/FormSkeletons";
import SelectCmp from "../elements/SelectCmp";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../elements/Tabs";
import { capitalizeFirstLetter, formatDateToLocal } from "@/app/lib/utils";
import { parseISO } from "date-fns";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../elements/Accordion";
import { useInView } from "react-intersection-observer";
import { getPatientSurvey } from "@/app/services/client_side/patients";
import type { PaginationModel } from "@/app/models/global_model";
import { PAGE_ITEMS } from "@/app/lib/constants";
import Loader from "../elements/Loader";

const PatientSurveyModal = dynamic(() => import("@/app/components/patients/patient-survey-modal"), { ssr: false });

const BLADDER_DIARY_COLUMNS: {
	header: string;
	accessor: keyof BladderDiaryTimeSlot | ((row: BladderDiaryTimeSlot) => React.ReactNode);
}[] = [
	{ header: "Time", accessor: "time" },
	{
		header: "Drinks",
		accessor: (row) =>
			row.drinks_kind
				? `${row.drinks_kind}${row.drinks_amount ? ` (${row.drinks_amount})` : ""}`
				: "—",
	},
	{ header: "Bathroom", accessor: "trips_to_bathroom" },
	{ header: "Urine", accessor: "urine_amount" },
	{
		header: "Leaks",
		accessor: (row) => (row.accidental_leaks ? "Yes" : "—"),
	},
	{
		header: "Strong Urge",
		accessor: (row) => (row.strong_urge ? "Yes" : "—"),
	},
	{ header: "Activity", accessor: "activity" },
];

const BOWEL_DIARY_COLUMNS: {
	header: string;
	accessor: keyof BowelDiaryTimeSlot | ((row: BowelDiaryTimeSlot) => React.ReactNode);
}[] = [
	{ header: "Time", accessor: "time" },
	{ header: "Food/Drink/Med", accessor: "food_drink_medication" },
	{
		header: "Bowel Movement",
		accessor: (row) => (row.bowel_movement ? "Yes" : "—"),
	},
	{ header: "Urgency", accessor: "bowel_urgency" },
	{ header: "Pains", accessor: "pains_discomfort" },
	{ header: "Stool Type", accessor: "stool_type" },
	{
		header: "Accidents",
		accessor: (row) => (row.accidents_leakage ? "Yes" : "—"),
	},
];

interface Props {
	action: "Create" | "Edit";
	patient?: PatientModel;
	personalizedPfPlan?: PfPlanModel;
	pfPlanProgress?: PfPlanProgressModel | null;
	userTools?: UserToolsModel | null;
	bladderDiaryEntries?: BladderDiaryEntryModel[];
	bowelDiaryEntries?: BowelDiaryEntryModel[];
}

export default function PatientForm({
	action = "Create",
	patient,
	pfPlanProgress,
	personalizedPfPlan,
	userTools,
	bladderDiaryEntries = [],
	bowelDiaryEntries = [],
}: Props) {
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
	const { hasPermission, isLoaded } = useAuth();

	const { isMobile } = useWindowSizeCheck();

	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [contactNo, setContactNo] = useState<string>("");
	const [birthdate, setBirthdate] = useState<Date | null>(null);
	const [userType, setUserType] = useState<number>(1);
	const [description, setDescription] = useState<string>("");
	const [photo, setPhoto] = useState<File | null>(null);
	const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [isPfPlanListModalOpen, setIsPfPlanListModalOpen] = useState<boolean>(false);
	const [isPregnant, setIsPregnant] = useState<boolean>(false);
	const [trimester, setTrimester] = useState<number | undefined>(undefined);
	const [gender, setGender] = useState<string>("");
	const [givenBirthLastSixMonth, setGivenBirthLastSixMonth] = useState<boolean>(false);
	const [monthsPostpartum, setMonthsPostpartum] = useState<number | undefined>(undefined);
	const [bladderDiaryEnabled, setBladderDiaryEnabled] = useState<boolean>(false);
	const [bowelDiaryEnabled, setBowelDiaryEnabled] = useState<boolean>(false);
	const [isUpdatingTools, setIsUpdatingTools] = useState<boolean>(false);

	useEffect(() => {
		if (action === "Edit" && patient) {
			setName(patient.user_profile?.name);
			setEmail(patient.email);
			setContactNo(patient.user_profile?.contact_number ?? "");
			setUserType(patient.user_type?.id);
			setDescription(patient.user_profile?.description ?? "");
			if (patient.user_profile.birthdate && !Number.isNaN(new Date(patient.user_profile.birthdate).getTime())) {
				setBirthdate(handleSetBirthDate(patient.user_profile.birthdate));
			}
			setIsPregnant(patient.user_profile?.is_pregnant ?? false);
			setTrimester(patient.user_profile?.trimester ?? undefined);
			setGender(patient.user_profile?.gender ?? "female");
			setGivenBirthLastSixMonth(patient.user_profile?.given_birth_last_six_months ?? false);
			setMonthsPostpartum(patient.user_profile?.months_postpartum ?? undefined);
		}
	}, [patient]);

	useEffect(() => {
		if (userTools) {
			setBladderDiaryEnabled(userTools.bladder_diary_enabled);
			setBowelDiaryEnabled(userTools.bowel_diary_enabled);
		}
	}, [userTools]);

	const [modalOpen, setModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [surveyModalOpen, setSurveyModelOpen] = useState(false);
	const [patientSurvey, setPatientSurvey] = useState<PatientSurveyModel[]>([]);
	const [surveyPagination, setSurveyPagination] = useState<PaginationModel | null>(null);
	const [isLoadingSurvey, setIsLoadingSurvey] = useState<boolean>(false);
	const [surveyRef, surveyInView] = useInView();
	const isLoadingRef = useRef(false);

	const handleToggle = (label: string) => {
		setUserType(label === "Free" ? 1 : 2);
	};

	const handleBladderDiaryToggle = async (label: string) => {
		if (!patient?.id || isUpdatingTools) return;
		const enabled = label === "Enabled";
		setBladderDiaryEnabled(enabled);
		try {
			setIsUpdatingTools(true);
			await updateUserTools(patient.id, {
				bladder_diary_enabled: enabled,
				bowel_diary_enabled: bowelDiaryEnabled,
			});
			showSnackBar({ message: "Bladder diary setting updated.", success: true });
		} catch (error) {
			setBladderDiaryEnabled(!enabled);
			const apiError = error as ErrorModel;
			showSnackBar({ message: apiError?.msg || "Failed to update.", success: false });
		} finally {
			setIsUpdatingTools(false);
		}
	};

	const handleBowelDiaryToggle = async (label: string) => {
		if (!patient?.id || isUpdatingTools) return;
		const enabled = label === "Enabled";
		setBowelDiaryEnabled(enabled);
		try {
			setIsUpdatingTools(true);
			await updateUserTools(patient.id, {
				bladder_diary_enabled: bladderDiaryEnabled,
				bowel_diary_enabled: enabled,
			});
			showSnackBar({ message: "Bowel diary setting updated.", success: true });
		} catch (error) {
			setBowelDiaryEnabled(!enabled);
			const apiError = error as ErrorModel;
			showSnackBar({ message: apiError?.msg || "Failed to update.", success: false });
		} finally {
			setIsUpdatingTools(false);
		}
	};

	const handleCloseModal = () => {
		if (!isProcessing) {
			setModalOpen(false);
			setDeleteModalOpen(false);
		}
	};

	const handleSetBirthDate = (dateStr: string) => {
		const [year, month, day] = dateStr.split("-").map(Number);
		const localDate = new Date(year, month - 1, day); // Create date in local time
		return localDate;
	};

	const isValid = () => {
		const validationErrors = validateForm({
			name,
			email,
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

	const loadSurveyData = useCallback(
		async (page = 1) => {
			if (!patient?.id || isLoadingRef.current) return;

			try {
				isLoadingRef.current = true;
				setIsLoadingSurvey(true);
				const params = `page=${page}&page_items=${PAGE_ITEMS}`;
				const response = await getPatientSurvey(patient.id.toString(), params);
				const { data, ...metadata } = response;

				if (page === 1) {
					setPatientSurvey(data);
				} else {
					setPatientSurvey((prev) => [...prev, ...data]);
				}
				setSurveyPagination(metadata);
			} catch (error) {
				const apiError = error as ErrorModel;
				if (apiError?.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
			} finally {
				isLoadingRef.current = false;
				setIsLoadingSurvey(false);
			}
		},
		[patient?.id, showSnackBar],
	);

	useEffect(() => {
		if (action === "Edit" && patient?.id) {
			loadSurveyData(1);
		} else {
			setPatientSurvey([]);
			setSurveyPagination(null);
		}
	}, [patient?.id, action, loadSurveyData]);

	useEffect(() => {
		if (
			surveyInView &&
			surveyPagination &&
			surveyPagination.page < surveyPagination.max_page &&
			!isLoadingRef.current
		) {
			loadSurveyData(surveyPagination.page + 1);
		}
	}, [surveyInView, surveyPagination, loadSurveyData]);

	const handleFileSelect = (file: File | null) => {
		setPhoto(file);
	};

	const handleConfirm = async () => {
		if (!isProcessing) {
			try {
				setIsProcessing(true);
				const method = action === "Create" ? "POST" : "PUT";
				const id = action === "Edit" ? patient!.id : null;

				const body = new FormData();
				body.append("name", name);
				body.append("email", email);
				body.append("contact_number", contactNo);
				body.append("birthdate", birthdate ? formatDate(birthdate) : "");
				body.append("description", description);
				body.append("type_id", userType.toString());
				body.append("is_pregnant", isPregnant.toString());
				if (trimester) body.append("trimester", trimester.toString());
				if (gender) body.append("gender", gender);
				body.append("given_birth_last_six_months", givenBirthLastSixMonth.toString());
				if (monthsPostpartum) body.append("months_postpartum", monthsPostpartum.toString());
				if (photo) body.append("photo", photo);

				await savePatient({ method, id, body });
				await revalidatePage("/patients");
				setIsProcessing(false);
				showSnackBar({
					message: `Patient successfully ${action === "Create" ? "created" : "updated"}.`,
					success: true,
				});
				setModalOpen(false);
				clearData();
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

	const onSave = () => {
		if (isValid()) {
			setModalOpen(true);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!isProcessing && action === "Edit") {
			try {
				setIsProcessing(true);
				await deletePatient(patient!.id);
				await revalidatePage("/patients");
				setIsProcessing(false);
				showSnackBar({
					message: "Patient successfully deleted.",
					success: true,
				});
				setModalOpen(false);
				router.push("/patients");
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError?.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsProcessing(false);
				setDeleteModalOpen(false);
			}
		}
	};

	const hasError = (fieldName: string) => {
		return errors.some((error) => error.fieldName === fieldName);
	};

	const clearData = () => {
		setName("");
		setEmail("");
		setContactNo("");
		setBirthdate(null);
		setUserType(1);
		setDescription("");
		setPhoto(null);
		setIsPregnant(false);
		setTrimester(undefined);
		setGender("");
		setGivenBirthLastSixMonth(false);
		setMonthsPostpartum(undefined);
	};

	if (!isLoaded) return <FormSkeletons />;

	if (isLoaded && patient && !hasPermission(PERMISSIONS.PATIENT_EDIT)) return notFound();

	if (isLoaded && !patient && !hasPermission(PERMISSIONS.PATIENT_CREATE)) return notFound();

	return (
		<>
			<div className="flex items-center mb-5 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">{action} Patients</h1>
					<p className="text-sm text-neutral-600">
						{action === "Create" ? CREATE_PATIENT_DESCRIPTION : UPDATE_DESCRIPTION}
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
					<Link href="/patients">
						<Button label="Cancel" secondary />
					</Link>
					<Button label="Save" onClick={onSave} />
				</div>
			</div>
			<hr />
			<Tabs defaultValue="details" className="mt-3 sm:mt-8">
				<TabsList>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger
						value="pf-plans"
						disabled={action === "Create"}
						className={clsx(action === "Create" && "opacity-50 cursor-not-allowed")}
					>
						PF Plans
					</TabsTrigger>
					<TabsTrigger
						value="patient-tools"
						disabled={action === "Create"}
						className={clsx(action === "Create" && "opacity-50 cursor-not-allowed")}
					>
						Patient Tools
					</TabsTrigger>
					<TabsTrigger
						value="pfdi-20"
						disabled={action === "Create"}
						className={clsx(action === "Create" && "opacity-50 cursor-not-allowed")}
					>
						PFDI-20
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="mt-5">
					<div className="flex flex-col sm:flex-row">
						<div className="mb-3 order-first sm:order-2">
							<div className="sm:w-[446px] sm:h-fit z-10 rounded-lg sm:bg-white sm:p-5 sm:drop-shadow-center">
								<UploadCmp
									label="Upload a Photo"
									onFileSelect={handleFileSelect}
									clearImagePreview={photo === null}
									type="image"
									previewImage={isMobile}
									isEdit={action === "Edit"}
									fileUrl={patient?.user_profile.photo ?? undefined}
								/>
							</div>
							{action === "Edit" && (
								<Button
									label="Delete"
									outlined
									className="mt-5 ml-auto hidden sm:block"
									onClick={() => setDeleteModalOpen(true)}
								/>
							)}
						</div>
						<div className="w-full order-2 sm:order-first sm:w-[636px] sm:p-5 space-y-4 sm:mr-6 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium">
								Patient Name <ReqIndicator />
							</p>
							<ToggleSwitch
								label1="Free"
								label2="Premium"
								active={userType === 1 ? "Free" : "Premium"}
								onToggle={handleToggle}
							/>
						</div>
						<Input
							type="text"
							placeholder="Enter patient name"
							value={name}
							invalid={hasError("name")}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div>
						<p className="font-medium mb-2">
							Email Address <ReqIndicator />
						</p>
						<Input
							type="email"
							placeholder="Enter patient's email address"
							value={email}
							invalid={hasError("email")}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="flex flex-col sm:flex-row sm:space-x-3">
						<div className="w-full mb-3 sm:mb-0">
							<p className="font-medium mb-2">Contact Number</p>
							<Input
								type="text"
								placeholder="xxx xxx xxx"
								value={contactNo}
								invalid={hasError("contactNo")}
								onChange={(e) => setContactNo(e.target.value)}
								onKeyDown={onPhoneNumKeyDown}
							/>
						</div>
						<div className="w-full">
							<p className="font-medium mb-2">Date of Birth</p>
							<DateInput
								selected={birthdate}
								invalid={hasError("birthdate")}
								maxDate={new Date()}
								onChange={(date) => setBirthdate(date)}
							/>
						</div>
					</div>
					<div>
						<p className="font-medium mb-2">Description</p>
						<Textarea
							placeholder="Enter the patient's description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium mb-2">Gender</p>
							<ToggleSwitch
								label1="Male"
								label2="Female"
								active={gender === "male" ? "Male" : gender === "female" ? "Female" : ""}
								onToggle={(label) => setGender(label.toLowerCase())}
							/>
						</div>
					</div>
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium">Is Pregnant</p>
							<ToggleSwitch
								label1="No"
								label2="Yes"
								active={isPregnant ? "Yes" : "No"}
								onToggle={(label) => setIsPregnant(label === "Yes")}
							/>
						</div>
					</div>
					{isPregnant && (
						<div>
							<p className="font-medium mb-2">Trimester</p>
							<SelectCmp
								options={Array.from({ length: 3 }, (_, index) => ({
									label: `Trimester ${index + 1}`,
									value: (index + 1).toString(),
								}))}
								value={
									trimester
										? {
												label: `Trimester ${trimester}`,
												value: trimester.toString(),
											}
										: undefined
								}
								onChange={(e) => setTrimester(e ? Number(e.value) : undefined)}
								placeholder="Select trimester"
							/>
						</div>
					)}
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium">Given Birth Last Six Months</p>
							<ToggleSwitch
								label1="No"
								label2="Yes"
								active={givenBirthLastSixMonth ? "Yes" : "No"}
								onToggle={(label) => setGivenBirthLastSixMonth(label === "Yes")}
							/>
						</div>
					</div>
					{givenBirthLastSixMonth && (
						<div>
							<p className="font-medium mb-2">Months Postpartum</p>
							<SelectCmp
								options={Array.from({ length: 6 }, (_, index) => ({
									label: `${index + 1} ${index === 0 ? "month" : "months"}`,
									value: (index + 1).toString(),
								}))}
								value={
									monthsPostpartum
										? {
												label: `${monthsPostpartum} ${monthsPostpartum === 1 ? "month" : "months"}`,
												value: monthsPostpartum.toString(),
											}
										: undefined
								}
								onChange={(e) => setMonthsPostpartum(e ? Number(e.value) : undefined)}
								placeholder="Select months postpartum"
							/>
						</div>
					)}
						</div>
						<div className="sm:hidden order-last flex flex-col w-full mt-4 space-y-3">
							<Link href="/patients">
								<Button label="Cancel" secondary className="w-full" />
							</Link>
							<Button label="Save" onClick={onSave} />
						</div>
					</div>
				</TabsContent>

				<TabsContent value="pf-plans" className="mt-5">
					<div className="w-full sm:max-w-2xl sm:p-5 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
						{action === "Edit" && (
							<div className="space-y-4">
								<div>
									<p className="font-medium mb-2">Personalized PF Plan</p>
									<div className={clsx("flex space-x-4 mb-3", !personalizedPfPlan && "items-center justify-center")}>
										{personalizedPfPlan ? (
											<Link href={`pf-plan/${personalizedPfPlan.id}`}>
												<div className="flex space-x-4 mb-3">
													<Image
														src={personalizedPfPlan.photo || "/images/exercise-banner.jpg"}
														width={80}
														height={56}
														alt="Thumbnail"
														className="w-[80px] h-[56px] mt-1"
													/>
													<div>
														<p>{personalizedPfPlan.name}</p>
														<p className="text-sm text-neutral-600 line-clamp-5" title={personalizedPfPlan.description}>
															{personalizedPfPlan.description}
														</p>
													</div>
												</div>
											</Link>
										) : (
											<Button label="Manage PF Plan" onClick={() => setIsPfPlanListModalOpen(true)} />
										)}
									</div>
								</div>

								{pfPlanProgress && (
									<div>
										<p className="font-medium mb-2">PF Plan Progress</p>
										<div className="flex space-x-4 mb-3">
											<Image
												src={pfPlanProgress.photo || "/images/exercise-banner.jpg"}
												width={80}
												height={56}
												alt="Thumbnail"
												className="w-[80px] h-[56px] mt-1"
											/>
											<div>
												<p>{pfPlanProgress.name}</p>
												<p className="text-sm text-neutral-600 line-clamp-5" title={pfPlanProgress.description}>
													{pfPlanProgress.description}
												</p>
											</div>
										</div>
										<ProgressBar value={pfPlanProgress.user_pf_plan_progress_percentage} />
									</div>
								)}
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="patient-tools" className="mt-5">
					<div className="w-full sm:max-w-2xl sm:p-5 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
						{action === "Edit" ? (
							<Tabs defaultValue="bladder-diary" className="w-full">
								<TabsList>
									<TabsTrigger value="bladder-diary">Bladder Diary</TabsTrigger>
									<TabsTrigger value="bowel-diary">Bowel Diary</TabsTrigger>
								</TabsList>
								<TabsContent value="bladder-diary" className="mt-5 space-y-4">
									<div>
										<p className="font-medium mb-2">Enable for patient</p>
										<div className="flex items-center gap-2">
											<ToggleSwitch
												label1="Disabled"
												label2="Enabled"
												active={bladderDiaryEnabled ? "Enabled" : "Disabled"}
												onToggle={handleBladderDiaryToggle}
											/>
											{isUpdatingTools && <Loader className="!h-5 !w-5" />}
										</div>
									</div>
									<div>
										<p className="font-medium text-lg mb-4">Entries</p>
										{bladderDiaryEntries.length > 0 ? (
											<Accordion type="single" collapsible className="w-full">
												{bladderDiaryEntries.map((entry) => {
													const slots = Array.isArray(entry.time_slots) ? entry.time_slots : [];
													const displayDate = formatDateToLocal(entry.diary_date);

													return (
														<AccordionItem key={entry.id} value={`bladder-${entry.id}`}>
															<AccordionTrigger className="text-left">
																<div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
																	<span className="font-medium">{displayDate}</span>
																	<span className="text-sm text-neutral-600 font-normal">
																		{slots.length} time slot{slots.length !== 1 ? "s" : ""}
																		{entry.pads_used != null && ` • Pads: ${entry.pads_used}`}
																		{entry.diapers_used != null && ` • Diapers: ${entry.diapers_used}`}
																	</span>
																</div>
															</AccordionTrigger>
															<AccordionContent>
																<DataTable<BladderDiaryTimeSlot>
																	columns={BLADDER_DIARY_COLUMNS}
																	data={slots}
																	getRowKey={(_, index) => index}
																/>
															</AccordionContent>
														</AccordionItem>
													);
												})}
											</Accordion>
										) : (
											<p className="text-neutral-600">No bladder diary entries.</p>
										)}
									</div>
								</TabsContent>
								<TabsContent value="bowel-diary" className="mt-5 space-y-4">
									<div>
										<p className="font-medium mb-2">Enable for patient</p>
										<div className="flex items-center gap-2">
											<ToggleSwitch
												label1="Disabled"
												label2="Enabled"
												active={bowelDiaryEnabled ? "Enabled" : "Disabled"}
												onToggle={handleBowelDiaryToggle}
											/>
											{isUpdatingTools && <Loader className="!h-5 !w-5" />}
										</div>
									</div>
									<div>
										<p className="font-medium text-lg mb-4">Entries</p>
										{bowelDiaryEntries.length > 0 ? (
											<Accordion type="single" collapsible className="w-full">
												{bowelDiaryEntries.map((entry) => {
													const slots = Array.isArray(entry.time_slots) ? entry.time_slots : [];
													const displayDate = formatDateToLocal(entry.diary_date);

													return (
														<AccordionItem key={entry.id} value={`bowel-${entry.id}`}>
															<AccordionTrigger className="text-left">
																<div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
																	<span className="font-medium">{displayDate}</span>
																	<span className="text-sm text-neutral-600 font-normal">
																		{entry.woke_up_at && `Wake: ${entry.woke_up_at}`}
																		{entry.went_to_sleep_at && ` • Sleep: ${entry.went_to_sleep_at}`}
																		{` • ${slots.length} time slot${slots.length !== 1 ? "s" : ""}`}
																	</span>
																</div>
															</AccordionTrigger>
															<AccordionContent>
																<DataTable<BowelDiaryTimeSlot>
																	columns={BOWEL_DIARY_COLUMNS}
																	data={slots}
																	getRowKey={(_, index) => index}
																/>
															</AccordionContent>
														</AccordionItem>
													);
												})}
											</Accordion>
										) : (
											<p className="text-neutral-600">No bowel diary entries.</p>
										)}
									</div>
								</TabsContent>
							</Tabs>
						) : (
							<div className="text-center py-8">
								<p className="text-neutral-600">Patient tools are available when editing a patient.</p>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="pfdi-20" className="mt-5">
					<div className="w-full sm:max-w-2xl sm:p-5 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
						{action === "Edit" ? (
							<div>
								<div className="mb-4">
									<p className="font-medium text-lg mb-2">PFDI-20 Survey History</p>
								</div>
								{patientSurvey.length > 0 ? (
									<>
										<Accordion type="single" collapsible className="w-full">
											{patientSurvey.map((surveyResponse, surveyIndex) => {
												const dateStr = surveyResponse.updated_at || surveyResponse.created_at;
												const displayDate = dateStr ? formatDateToLocal(parseISO(dateStr)) : "No Date";

												return (
													<AccordionItem key={surveyResponse.id || surveyIndex} value={`item-${surveyIndex}`}>
														<AccordionTrigger className="text-left">
															<div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
																<span className="font-medium">{displayDate}</span>
																{surveyResponse.pf_plan?.name && (
																	<span className="text-sm text-neutral-600 font-normal">
																		- {surveyResponse.pf_plan.name}
																	</span>
																)}
															</div>
														</AccordionTrigger>
														<AccordionContent>
															<div className="space-y-4">
																{surveyResponse.survey_questions && surveyResponse.survey_questions.length > 0 ? (
																	<>
																		{surveyResponse.survey_questions.map((question, questionIndex) => (
																			<div key={question.id || questionIndex} className="pb-3 last:pb-0">
																				<div className="flex mb-2">
																					<span className="font-medium">{questionIndex + 1}.&nbsp;</span>
																					<p className="font-medium">{question.question}</p>
																				</div>
																				<div className="text-sm ml-4 mt-2 space-y-1">
																					<div className="flex flex-wrap gap-2">
																						<span>Answer:</span>
																						<span className="font-semibold">
																							{capitalizeFirstLetter(question.user_survey_question_answer?.yes_no) || "Not answered"}
																						</span>
																					</div>

																					{question.user_survey_question_answer?.yes_no === "yes" && (
																						<div className="flex flex-wrap gap-2">
																							<span>How much does it bother you?:</span>
																							<span className="font-semibold">
																								{question.user_survey_question_answer?.if_yes_how_much_bother || "N/A"}
																							</span>
																						</div>
																					)}
																				</div>
																			</div>
																		))}
																	</>
																) : (
																	<p className="text-neutral-600">No questions available for this survey.</p>
																)}
															</div>
														</AccordionContent>
													</AccordionItem>
												);
											})}
										</Accordion>
										{surveyPagination && surveyPagination.page < surveyPagination.max_page && (
											<div ref={surveyRef} className="flex justify-center py-4">
												{isLoadingSurvey && <Loader />}
											</div>
										)}
									</>
								) : isLoadingSurvey ? (
									<div className="flex justify-center py-8">
										<Loader />
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-neutral-600">No PFDI-20 survey data available.</p>
									</div>
								)}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-neutral-600">No PFDI-20 survey data available.</p>
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>
			<div className="sm:hidden flex flex-col w-full mt-4 space-y-3">
				<Link href="/patients">
					<Button label="Cancel" secondary className="w-full" />
				</Link>
				<Button label="Save" onClick={onSave} />
			</div>
			<ConfirmModal
				title={`Are you sure you want to ${
					action === "Create" ? "create this Patient's account?" : "save this changes?"
				} `}
				subTitle={CONFIRM_SAVE_DESCRIPTION}
				isOpen={modalOpen}
				confirmBtnLabel="Save"
				isProcessing={isProcessing}
				onConfirm={handleConfirm}
				onClose={handleCloseModal}
			/>
			{action === "Edit" && (
				<>
					<ConfirmModal
						title="Are you sure you want to delete this account?"
						subTitle={CONFIRM_DELETE_DESCRIPTION}
						isOpen={deleteModalOpen}
						confirmBtnLabel="Delete"
						isProcessing={isProcessing}
						onConfirm={handleDeleteConfirm}
						onClose={handleCloseModal}
					/>
					{isPfPlanListModalOpen && <PfPlanListModal onClose={() => setIsPfPlanListModalOpen(false)} />}
					{patientSurvey.length > 0 && (
						<PatientSurveyModal
							patientSurvey={patientSurvey}
							isOpen={surveyModalOpen}
							onClose={() => setSurveyModelOpen(false)}
						/>
					)}
				</>
			)}
		</>
	);
}
