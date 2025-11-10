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
import { formatDate, hasFieldError, onPhoneNumKeyDown, toFormData } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import { deletePatient, savePatient } from "@/app/services/client_side/patients";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressBar from "../elements/ProgressBar";
import clsx from "clsx";
import type { Practice, PracticeFormSchema, PracticeLicense } from "@/app/models/practice";
import { useModal } from "@/app/contexts/ModalContext";
import { Controller, type ControllerRenderProps, useForm } from "react-hook-form";
import type { ValidationErrorModel } from "@/app/models/validation_error_model";
import { savePractice } from "@/app/services/client_side/practices";
import MultiInput from "../elements/MultiInput";
import SelectCmp from "../elements/SelectCmp";
import { PlusIcon, XIcon } from "lucide-react";

export default function PracticeForm({ practice }: { practice?: Practice }) {
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
	const modal = useModal();
	const modalData = modal.getData();
	const { isMobile } = useWindowSizeCheck();
	const [formError, setFormError] = useState<ErrorModel>();

	const form = useForm<PracticeFormSchema>({
		defaultValues: modalData?.data ?? {
			id: practice?.id,
			name: practice?.name,
			bio: practice?.bio,
			npi: practice?.npi,
			license: practice?.license ?? [{}],
		},
	});

	const handleSubmit = (data: PracticeFormSchema) => {
		modal.setData({
			data: data,
		});

		modal.open({
			type: "confirm",
			title: "Practice",
			message: `Are you sure you want to ${practice ? "update" : "create"} this practice?`,
			onConfirm: async () => {
				try {
					const formData = toFormData(data);

					const response = await savePractice({
						id: practice?.id,
						body: formData,
						method: practice ? "PUT" : "POST",
					});

					await revalidatePage("/practices");

					modal.closeAll();

					router.push(`/practices/${response.id}/edit`);
				} catch (e) {
					const error = e as ErrorModel;

					setFormError(error);

					if (error?.msg) {
						showSnackBar({ message: error.msg, success: false });
					}
				}
			},
		});
	};

	const handleRemoveLicense = (field: ControllerRenderProps<PracticeFormSchema, "license">, index: number) => {
		field.onChange(field.value?.filter((v, i) => i !== index));
	};

	const handleAddLicense = (field: ControllerRenderProps<PracticeFormSchema, "license">) => {
		field.onChange([...(field.value ?? []), {}]);
	};

	const handleChangeLicense = (
		field: ControllerRenderProps<PracticeFormSchema, "license">,
		index: number,
		value: PracticeLicense,
	) => {
		const currentValue = field.value ?? [];
		currentValue[index] = value;
		field.onChange(currentValue);
	};

	return (
		<form>
			<div className="flex items-center mb-5 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">{practice ? "Update" : "Create"} Practice</h1>
					<p className="text-sm text-neutral-600">
						{practice
							? "Update the details of the existing information below. Make sure to review all changes before saving."
							: "Fill out the form below to create a new practice profile with the required details."}
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
					<Link href="/practices">
						<Button label="Cancel" secondary />
					</Link>
					<Button label="Save" type="button" onClick={() => form.handleSubmit(handleSubmit)()} />
				</div>
			</div>
			<hr />
			<div className="flex flex-col sm:flex-row mt-3 sm:mt-8">
				<div className="mb-3 order-first sm:order-2">
					<div className="sm:w-[446px] sm:h-fit z-10 rounded-lg sm:bg-white sm:p-5 sm:drop-shadow-center">
						<Controller
							name="photo"
							control={form.control}
							render={({ field }) => (
								<UploadCmp
									label="Upload a Photo"
									onFileSelect={(file) => field.onChange(file)}
									clearImagePreview={!!practice?.photo}
									type="image"
									previewImage={isMobile || !!practice?.photo}
									fileUrl={practice?.photo}
									isEdit={!!practice}
								/>
							)}
						/>
					</div>
					{practice && <Button label="Delete" outlined className="mt-5 ml-auto hidden sm:block" onClick={undefined} />}
				</div>
				<div className="w-full order-2 sm:order-first sm:w-[636px] sm:p-5 space-y-4 sm:mr-6 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium">
								Name <ReqIndicator />
							</p>
						</div>
						<Controller
							name="name"
							control={form.control}
							render={({ field }) => (
								<Input
									type="text"
									placeholder="Enter name"
									value={field.value}
									invalid={hasFieldError("name", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					<div>
						<p className="font-medium mb-2">
							National Provider Identity <ReqIndicator />
						</p>
						<Controller
							name="npi"
							control={form.control}
							render={({ field }) => (
								<Input
									type="text"
									placeholder="National Provider Identity"
									value={field.value}
									invalid={hasFieldError("npi", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					<div>
						<p className="font-medium mb-2">
							License <ReqIndicator />
						</p>
						<Controller
							name="license"
							control={form.control}
							render={({ field }) => {
								return (
									<>
										{field.value?.map((value, index) => {
											return (
												<div key={index} className="flex flex-row items-center mb-1">
													<div className="flex-1">
														<div className="flex flex-row items-center space-x-1">
															<Input
																type="text"
																className="!p-2 "
																containerClassName="w-full"
																value={value.license}
																placeholder="License"
																onChange={(e) => {
																	handleChangeLicense(field, index, { license: e.target.value, state: value.state });
																}}
															/>
															<Input
																type="text"
																className="!p-2"
																containerClassName="w-full"
																value={value.state}
																placeholder="State"
																onChange={(e) => {
																	handleChangeLicense(field, index, { license: value.license, state: e.target.value });
																}}
															/>
															<div className="flex items-center min-w-16">
																<Button onClick={() => handleAddLicense(field)} className="h-8 w-8 !p-0 ml-auto">
																	<PlusIcon className="h-4 w-4" />
																</Button>
																{field.value.length > 1 && (
																	<Button
																		onClick={() => handleRemoveLicense(field, index)}
																		className="h-8 w-8 !p-0 ml-auto"
																	>
																		<XIcon className="h-4 w-4" />
																	</Button>
																)}
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</>
								);
							}}
						/>
					</div>

					<div>
						<p className="font-medium mb-2">Bio</p>
						<Controller
							name="bio"
							control={form.control}
							render={({ field }) => (
								<Textarea
									className="resize-none !h-auto"
									placeholder="Write your bio..."
									value={field.value}
									onChange={field.onChange}
									rows={5}
								/>
							)}
						/>
					</div>
				</div>
				<div className="sm:hidden order-last flex flex-col w-full mt-4 space-y-3">
					<Link href="/patients">
						<Button type="button" label="Cancel" secondary className="w-full" />
					</Link>
					<Button type="button" label="Save" onClick={() => form.handleSubmit(handleSubmit)()} />
				</div>
			</div>
		</form>
	);
}
