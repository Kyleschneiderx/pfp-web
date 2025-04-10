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
	UPDATE_DESCRIPTION,
} from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDate, onPhoneNumKeyDown } from "@/app/lib/utils";
import { ErrorModel } from "@/app/models/error_model";
import { PatientModel, PatientSurveyModel, PfPlanProgressModel } from "@/app/models/patient_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { deletePatient, savePatient } from "@/app/services/client_side/patients";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressBar from "../elements/ProgressBar";
import { validateForm } from "./validation";

const PatientSurveyModal = dynamic(() => import("@/app/components/patients/patient-survey-modal"), { ssr: false });

interface Props {
	action: "Create" | "Edit";
	patient?: PatientModel;
	patientSurvey?: PatientSurveyModel[];
	pfPlanProgress?: PfPlanProgressModel | null;
}

export default function PatientForm({ action = "Create", patient, patientSurvey, pfPlanProgress }: Props) {
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
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

	useEffect(() => {
		if (action === "Edit" && patient) {
			setName(patient.user_profile?.name);
			setEmail(patient.email);
			setContactNo(patient.user_profile?.contact_number ?? "");
			setUserType(patient.user_type?.id);
			setDescription(patient.user_profile?.description ?? "");
			if (patient.user_profile.birthdate && !isNaN(new Date(patient.user_profile.birthdate).getTime())) {
				setBirthdate(handleSetBirthDate(patient.user_profile.birthdate));
			}
		}
	}, [patient]);

	const [modalOpen, setModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [surveyModalOpen, setSurveyModelOpen] = useState(false);

	const handleToggle = (label: string) => {
		setUserType(label === "Free" ? 1 : 2);
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

				if (apiError && apiError.msg) {
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
					message: `Patient successfully deleted.`,
					success: true,
				});
				setModalOpen(false);
				router.push("/patients");
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError && apiError.msg) {
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
	};

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
			<div className="flex flex-col sm:flex-row mt-3 sm:mt-8">
				<div className="mb-3 order-first sm:order-2">
					<div className="sm:w-[446px] sm:h-fit z-10 rounded-lg sm:bg-white sm:p-5 sm:drop-shadow-center">
						<UploadCmp
							label="Upload a Photo"
							onFileSelect={handleFileSelect}
							clearImagePreview={photo === null}
							type="image"
							previewImage={isMobile}
							isEdit={action === "Edit"}
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
					{action === "Edit" && patientSurvey && (
						<span
							className="text-sm text-neutral-600 cursor-pointer underline"
							onClick={() => setSurveyModelOpen(true)}
						>
							View survey
						</span>
					)}
					{action === "Edit" && pfPlanProgress && (
						<div>
							<p className="font-medium mb-2 text-center">Pf Plan Progress</p>
							<hr className="w-[130px] mx-auto mb-3" />
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
									<p className="text-sm text-neutral-600">{pfPlanProgress.description}</p>
								</div>
							</div>
							<ProgressBar value={pfPlanProgress.user_pf_plan_progress_percentage} />
						</div>
					)}
				</div>
				<div className="sm:hidden order-last flex flex-col w-full mt-4 space-y-3">
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
						{patientSurvey && (
							<PatientSurveyModal
								patientSurvey={patientSurvey}
								isOpen={surveyModalOpen}
								onClose={() => setSurveyModelOpen(false)}
							/>
						)}
					</>
				)}
			</div>
		</>
	);
}
