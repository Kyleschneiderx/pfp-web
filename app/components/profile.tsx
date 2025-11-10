"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ReqIndicator from "@/app/components/elements/ReqIndicator";
import UploadCmp from "@/app/components/elements/UploadCmp";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import { revalidatePage } from "@/app/lib/revalidate";
import { hasFieldError, toFormData } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import { useEffect, useState } from "react";
import { useModal } from "@/app/contexts/ModalContext";
import { Controller, type ControllerRenderProps, useForm } from "react-hook-form";
import { PlusIcon, XIcon } from "lucide-react";
import type { Account, AdminFormSchema, License, ProviderFormSchema } from "@/app/models/accounts";
import { saveAccount } from "@/app/services/client_side/accounts";
import AsyncSelectCmp from "./elements/AsyncSelectCmp";
import Textarea from "./elements/Textarea";
import useAuth from "../hooks/useAuth";

export default function ProfileForm({ account }: { account?: Account }) {
	const { showSnackBar } = useSnackBar();
	const { user, isAdmin } = useAuth();
	const modal = useModal();
	const modalData = modal.getData();
	const { isMobile } = useWindowSizeCheck();
	const [formError, setFormError] = useState<ErrorModel>();

	const form = useForm<ProviderFormSchema & AdminFormSchema>({
		defaultValues: modalData?.data ?? {
			id: user?.id,
			name: user?.user_profile.name || "",
			description: user?.user_profile.description || "",
			npi: user?.user_profile.npi || "",
			license: user?.user_profile.license ?? [],
			password: undefined,
			email: user?.email || "",
			photo: undefined,
		},
	});

	useEffect(() => {
		if (user) {
			console.log(user);
			form.reset({
				id: user.id,
				name: user.user_profile.name || "",
				description: user.user_profile.description || "",
				npi: user.user_profile.npi || "",
				license: user.user_profile.license ?? [],
				password: undefined,
				email: user.email || "",
				photo: undefined,
			});
		}
	}, [user]);

	const handleSubmit = (data: ProviderFormSchema) => {
		modal.setData({
			data: data,
		});

		modal.open({
			type: "confirm",
			title: "Update Profile",
			message: "Are you sure you want to update your profile?",
			onConfirm: async () => {
				try {
					const formData = toFormData(data);

					const response = await saveAccount({
						id: user?.id,
						body: formData,
						method: "PUT",
					});

					await revalidatePage("/profile");

					modal.closeAll();
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

	const handleRemoveLicense = (field: ControllerRenderProps<ProviderFormSchema, "license">, index: number) => {
		field.onChange(field.value?.filter((v, i) => i !== index));
	};

	const handleAddLicense = (field: ControllerRenderProps<ProviderFormSchema, "license">) => {
		field.onChange([...(field.value ?? []), {}]);
	};

	const handleChangeLicense = (
		field: ControllerRenderProps<ProviderFormSchema, "license">,
		index: number,
		value: License,
	) => {
		const currentValue = field.value ?? [];
		currentValue[index] = value;
		field.onChange(currentValue);
	};

	return (
		<form>
			<div className="flex items-center mb-5 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">Profile</h1>
					<p className="text-sm text-neutral-600">
						Update the details of the existing information below. Make sure to review all changes before saving.
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
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
									clearImagePreview={!!user?.user_profile.photo}
									type="image"
									previewImage={isMobile || !!user?.user_profile.photo}
									fileUrl={user?.user_profile.photo ?? undefined}
									isEdit={!!user}
								/>
							)}
						/>
					</div>
				</div>
				<div className="w-full self-start order-2 sm:order-first sm:w-[636px] sm:p-5 space-y-4 sm:mr-6 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium">
								Email <ReqIndicator />
							</p>
						</div>
						<Controller
							name="email"
							control={form.control}
							render={({ field }) => (
								<Input
									type="text"
									placeholder="Enter Email"
									value={field.value}
									invalid={hasFieldError("email", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
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
									placeholder="Enter Name"
									value={field.value}
									invalid={hasFieldError("name", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>

					{!isAdmin && (
						<>
							<div>
								<p className="font-medium mb-2">National Provider Identity</p>
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
								<p className="font-medium mb-2">License</p>
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
																			handleChangeLicense(field, index, {
																				license: e.target.value,
																				state: value.state,
																			});
																		}}
																	/>
																	<Input
																		type="text"
																		className="!p-2"
																		containerClassName="w-full"
																		value={value.state}
																		placeholder="State"
																		onChange={(e) => {
																			handleChangeLicense(field, index, {
																				license: value.license,
																				state: e.target.value,
																			});
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
									name="description"
									control={form.control}
									render={({ field }) => (
										<Textarea
											className="resize-none !h-auto"
											onChange={field.onChange}
											value={field.value}
											rows={5}
											placeholder="Write bio..."
										/>
									)}
								/>
							</div>
						</>
					)}
				</div>
				<div className="sm:hidden order-last flex flex-col w-full mt-4 space-y-3">
					<Button type="button" label="Save" onClick={() => form.handleSubmit(handleSubmit)()} />
				</div>
			</div>
		</form>
	);
}
