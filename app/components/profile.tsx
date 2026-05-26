"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ReqIndicator from "@/app/components/elements/ReqIndicator";
import Switch from "@/app/components/elements/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/elements/Tabs";
import UploadCmp from "@/app/components/elements/UploadCmp";
import { useModal } from "@/app/contexts/ModalContext";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import { STATES } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { hasFieldError, toFormData } from "@/app/lib/utils";
import type {
	Account,
	Address,
	AdminFormSchema,
	License,
	ProviderFormSchema,
	UserProfileSettings,
} from "@/app/models/accounts";
import type { OptionsModel } from "@/app/models/common_model";
import type { ErrorModel } from "@/app/models/error_model";
import { saveAccount, updateAccountAddresses, updateAccountSettings } from "@/app/services/client_side/accounts";
import clsx from "clsx";
import { PlusIcon, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Controller, type ControllerRenderProps, useForm, useWatch } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import Textarea from "./elements/Textarea";
import { ProfileAddressTab } from "./profile/profile-address-tab";

type ProfileFormSchema = ProviderFormSchema & AdminFormSchema;
type ProfileTabValue = "details" | "address" | "settings";
type TabSaveStatus = "idle" | "saving" | "saved" | "error";
type TabSaveState = {
	status: TabSaveStatus;
	message?: string;
};
type DetailsSnapshot = Pick<ProfileFormSchema, "email" | "name" | "description" | "npi" | "license">;

const SelectCmp = dynamic(() => import("./elements/SelectCmp"), { ssr: false });
const stateOptions = STATES.map((state) => ({
	label: state.name,
	value: state.abbreviation,
}));

function normalizeLicense(license: License): License {
	return {
		license: license.license ?? "",
		state: license.state ?? "",
	};
}

function cloneLicenses(licenses?: License[] | null): License[] {
	return (licenses ?? []).map(normalizeLicense);
}

function normalizeAddress(address: Address): Address {
	return {
		id: address.id,
		user_id: address.user_id,
		line1: address.line1 ?? "",
		line2: address.line2 ?? "",
		city: address.city ?? "",
		state: address.state ?? "",
		postal_code: address.postal_code ?? "",
		country: address.country ?? "",
		latitude: address.latitude != null && Number.isFinite(address.latitude) ? address.latitude : undefined,
		longitude: address.longitude != null && Number.isFinite(address.longitude) ? address.longitude : undefined,
	};
}

function cloneAddresses(addresses?: Address[] | null): Address[] {
	return (addresses ?? []).map(normalizeAddress);
}

function getSettingsSnapshot(account?: Account | null): UserProfileSettings {
	return {
		in_person_visit: account?.settings?.in_person_visit ?? false,
	};
}

function getDetailsSnapshot(account?: Account | null): DetailsSnapshot {
	return {
		email: account?.email ?? "",
		name: account?.user_profile.name ?? "",
		description: account?.user_profile.description ?? "",
		npi: account?.user_profile.npi ?? "",
		license: cloneLicenses(account?.user_profile.license),
	};
}

function serializeAddresses(addresses: Address[]): string {
	return JSON.stringify(cloneAddresses(addresses));
}

function getStatusMeta(dirty: boolean, state: TabSaveState) {
	if (state.status === "saving") {
		return {
			label: "Saving changes...",
			className: "text-neutral-600",
		};
	}

	if (state.status === "error") {
		return {
			label: state.message ?? "Could not save changes.",
			className: "text-error-500",
		};
	}

	if (dirty) {
		return {
			label: "You have unsaved changes.",
			className: "text-neutral-600",
		};
	}

	if (state.status === "saved") {
		return {
			label: state.message ?? "Changes saved.",
			className: "text-success-600",
		};
	}

	return {
		label: "No unsaved changes.",
		className: "text-neutral-500",
	};
}

function TabTriggerLabel({
	label,
	isDirty,
}: {
	label: string;
	isDirty: boolean;
}) {
	return (
		<span className="inline-flex items-center gap-2">
			<span>{label}</span>
			{isDirty && <span aria-hidden className="h-2 w-2 rounded-full bg-primary-500" />}
		</span>
	);
}

function TabActionRow({
	dirty,
	state,
	onReset,
	onSave,
	isSaving,
}: {
	dirty: boolean;
	state: TabSaveState;
	onReset: () => void;
	onSave: () => void;
	isSaving: boolean;
}) {
	const status = getStatusMeta(dirty, state);

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<p className={clsx("text-sm", status.className)}>{status.label}</p>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Button type="button" label="Reset" secondary onClick={onReset} disabled={!dirty || isSaving} />
				<Button
					type="button"
					label="Save changes"
					onClick={onSave}
					disabled={!dirty || isSaving}
					isProcessing={isSaving}
				/>
			</div>
		</div>
	);
}

function SettingsTabPanel({
	checked,
	onCheckedChange,
	footer,
}: {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	footer?: ReactNode;
}) {
	return (
		<div className="rounded-lg bg-white p-5 drop-shadow-center">
			<div className="space-y-5">
				<div>
					<h2 className="text-lg font-semibold text-neutral-900">Account settings</h2>
					<p className="mt-1 text-sm text-neutral-600">Manage your account preferences and connected tools.</p>
				</div>

				<div className="rounded-lg border border-neutral-200 px-4 py-4">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1 pr-4">
							<p className="font-medium text-neutral-900">Offer in-person visits</p>
							<p className="text-sm text-neutral-600">
								Show whether patients may book or inquire about in-person appointments.
							</p>
						</div>
						<Switch checked={checked} onCheckedChange={onCheckedChange} />
					</div>
					<p className="mt-4 text-sm text-neutral-500">
						{checked
							? "In-person visits are enabled for your profile."
							: "In-person visits are currently hidden from your profile."}
					</p>
				</div>

				{footer}
			</div>
		</div>
	);
}

export default function ProfileForm({ account }: { account?: Account }) {
	const { showSnackBar } = useSnackBar();
	const { user, isAdmin } = useAuth();
	const modal = useModal();
	const modalData = modal.getData();
	const { isMobile } = useWindowSizeCheck();
	const sourceAccount = account ?? user;
	const initialAccount = sourceAccount;
	const [activeTab, setActiveTab] = useState<ProfileTabValue>("details");
	const [profileUser, setProfileUser] = useState<Account | null | undefined>(initialAccount);
	const [formError, setFormError] = useState<ErrorModel>();
	const [detailsIsSaving, setDetailsIsSaving] = useState(false);
	const [addressSaveState, setAddressSaveState] = useState<TabSaveState>({
		status: "idle",
	});
	const [settingsSaveState, setSettingsSaveState] = useState<TabSaveState>({
		status: "idle",
	});
	const [savedDetails, setSavedDetails] = useState<DetailsSnapshot>(() => getDetailsSnapshot(initialAccount));
	const [savedAddresses, setSavedAddresses] = useState<Address[]>(() => cloneAddresses(initialAccount?.addresses));
	const [savedSettings, setSavedSettings] = useState<UserProfileSettings>(() => getSettingsSnapshot(initialAccount));

	const form = useForm<ProfileFormSchema>({
		defaultValues: modalData?.data ?? {
			id: initialAccount?.id,
			name: initialAccount?.user_profile.name || "",
			description: initialAccount?.user_profile.description || "",
			npi: initialAccount?.user_profile.npi || "",
			role_id: initialAccount?.roles?.[0],
			license: cloneLicenses(initialAccount?.user_profile.license),
			password: undefined,
			email: initialAccount?.email || "",
			photo: undefined,
			addresses: cloneAddresses(initialAccount?.addresses),
			in_person_visit: initialAccount?.settings?.in_person_visit ?? false,
		},
	});

	useEffect(() => {
		if (!sourceAccount) {
			return;
		}

		setProfileUser(sourceAccount);
		setSavedDetails(getDetailsSnapshot(sourceAccount));
		setSavedAddresses(cloneAddresses(sourceAccount.addresses));
		setSavedSettings(getSettingsSnapshot(sourceAccount));
		setAddressSaveState({ status: "idle" });
		setSettingsSaveState({ status: "idle" });
		form.reset({
			id: sourceAccount.id,
			name: sourceAccount.user_profile.name || "",
			description: sourceAccount.user_profile.description || "",
			npi: sourceAccount.user_profile.npi || "",
			role_id: sourceAccount.roles?.[0],
			license: cloneLicenses(sourceAccount.user_profile.license),
			password: undefined,
			email: sourceAccount.email || "",
			photo: undefined,
			addresses: cloneAddresses(sourceAccount.addresses),
			in_person_visit: sourceAccount.settings?.in_person_visit ?? false,
		});
	}, [form, sourceAccount]);

	const watchedEmail = useWatch({ control: form.control, name: "email" }) ?? "";
	const watchedName = useWatch({ control: form.control, name: "name" }) ?? "";
	const watchedDescription = useWatch({ control: form.control, name: "description" }) ?? "";
	const watchedNpi = useWatch({ control: form.control, name: "npi" }) ?? "";
	const watchedLicense = useWatch({ control: form.control, name: "license" }) ?? [];
	const watchedAddresses = useWatch({ control: form.control, name: "addresses" }) ?? [];
	const watchedInPersonVisit = useWatch({ control: form.control, name: "in_person_visit" }) ?? false;
	const watchedPhoto = useWatch({ control: form.control, name: "photo" });
	const addressValueRef = useRef(serializeAddresses(watchedAddresses));
	const settingsValueRef = useRef(watchedInPersonVisit);
	const detailsValue = JSON.stringify({
		email: watchedEmail,
		name: watchedName,
		description: watchedDescription,
		npi: watchedNpi,
		license: cloneLicenses(watchedLicense),
	});
	const savedDetailsValue = JSON.stringify({
		email: savedDetails.email,
		name: savedDetails.name,
		description: savedDetails.description,
		npi: savedDetails.npi,
		license: cloneLicenses(savedDetails.license),
	});
	const addressValue = serializeAddresses(watchedAddresses);
	const savedAddressValue = serializeAddresses(savedAddresses);

	const detailsDirty = detailsValue !== savedDetailsValue || Boolean(watchedPhoto);
	const addressDirty = addressValue !== savedAddressValue;
	const settingsDirty = watchedInPersonVisit !== savedSettings.in_person_visit;
	const profileId = profileUser?.id ?? user?.id;

	useEffect(() => {
		if (
			addressValueRef.current !== addressValue &&
			(addressSaveState.status === "saved" || addressSaveState.status === "error")
		) {
			setAddressSaveState({ status: "idle" });
		}
		addressValueRef.current = addressValue;
	}, [addressSaveState.status, addressValue]);

	useEffect(() => {
		if (
			settingsValueRef.current !== watchedInPersonVisit &&
			(settingsSaveState.status === "saved" || settingsSaveState.status === "error")
		) {
			setSettingsSaveState({ status: "idle" });
		}
		settingsValueRef.current = watchedInPersonVisit;
	}, [settingsSaveState.status, watchedInPersonVisit]);

	const updateStoredUser = (updater: (current: Account) => Account) => {
		const currentUser = profileUser ?? user ?? account;
		if (!currentUser) {
			return;
		}

		const nextUser = updater(currentUser);
		setProfileUser(nextUser);
		if (nextUser.id === user?.id) {
			localStorage.setItem("user", JSON.stringify(nextUser));
		}
	};

	const handleDetailsSubmit = (data: ProfileFormSchema) => {
		modal.setData({
			data,
		});

		modal.open({
			type: "confirm",
			title: "Update Profile",
			message: "Are you sure you want to update your profile?",
			onConfirm: async () => {
				if (!profileId) {
					return;
				}

				try {
					setDetailsIsSaving(true);
					const { addresses: _addresses, in_person_visit: _inPersonVisit, ...rest } = data;
					const formData = toFormData(rest);
					const response = await saveAccount({
						id: profileId,
						body: formData,
						method: "PUT",
					});

					const nextDetails = {
						email: data.email,
						name: data.name,
						description: data.description,
						npi: data.npi,
						license: cloneLicenses(data.license),
					};

					setSavedDetails(nextDetails);
					form.setValue("photo", undefined, { shouldDirty: false });
					setFormError(undefined);
					updateStoredUser((current) => ({
						...current,
						...response,
						email: response.email,
						user_profile: {
							...current.user_profile,
							...response.user_profile,
							name: nextDetails.name,
							description: nextDetails.description,
							npi: nextDetails.npi,
							license: nextDetails.license,
							addresses: current.addresses,
							settings: current.settings,
						},
					}));
					showSnackBar({
						message: "Profile details updated.",
						success: true,
					});
					await revalidatePage("/profile");
					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;

					setFormError(error);

					if (error?.msg) {
						showSnackBar({ message: error.msg, success: false });
					}
				} finally {
					setDetailsIsSaving(false);
				}
			},
		});
	};

	const handleSaveAddresses = async () => {
		if (!profileId) {
			return;
		}

		try {
			setAddressSaveState({ status: "saving" });
			const nextAddresses = await updateAccountAddresses(profileId, cloneAddresses(form.getValues("addresses")));
			const normalizedAddresses = cloneAddresses(nextAddresses);

			form.setValue("addresses", normalizedAddresses, {
				shouldDirty: false,
			});
			setSavedAddresses(normalizedAddresses);
			updateStoredUser((current) => ({
				...current,
				addresses: normalizedAddresses,
			}));
			setAddressSaveState({
				status: "saved",
				message: "Address changes saved.",
			});
			showSnackBar({
				message: "Addresses updated.",
				success: true,
			});
		} catch (e) {
			const error = e as ErrorModel;
			setAddressSaveState({
				status: "error",
				message: error.msg ?? "Could not save address changes.",
			});
			showSnackBar({
				message: error.msg ?? "Could not save address changes.",
				success: false,
			});
		}
	};

	const handleResetAddresses = () => {
		form.setValue("addresses", cloneAddresses(savedAddresses), {
			shouldDirty: false,
		});
		setAddressSaveState({ status: "idle" });
	};

	const handleSaveSettings = async () => {
		if (!profileId) {
			return;
		}

		try {
			setSettingsSaveState({ status: "saving" });
			const nextSettings = await updateAccountSettings(profileId, {
				in_person_visit: form.getValues("in_person_visit") ?? false,
			});

			form.setValue("in_person_visit", nextSettings.in_person_visit, {
				shouldDirty: false,
			});
			setSavedSettings(nextSettings);
			updateStoredUser((current) => ({
				...current,
				settings: nextSettings,
			}));
			setSettingsSaveState({
				status: "saved",
				message: "Settings changes saved.",
			});
			showSnackBar({
				message: "Visit preferences updated.",
				success: true,
			});
		} catch (e) {
			const error = e as ErrorModel;
			setSettingsSaveState({
				status: "error",
				message: error.msg ?? "Could not save visit preferences.",
			});
			showSnackBar({
				message: error.msg ?? "Could not save visit preferences.",
				success: false,
			});
		}
	};

	const handleResetSettings = () => {
		form.setValue("in_person_visit", savedSettings.in_person_visit, {
			shouldDirty: false,
		});
		setSettingsSaveState({ status: "idle" });
	};

	const handleRemoveLicense = (field: ControllerRenderProps<ProfileFormSchema, "license">, index: number) => {
		field.onChange(field.value?.filter((v, i) => i !== index));
	};

	const handleAddLicense = (field: ControllerRenderProps<ProfileFormSchema, "license">) => {
		field.onChange([...(field.value ?? []), { license: "", state: "" }]);
	};

	const handleChangeLicense = (
		field: ControllerRenderProps<ProfileFormSchema, "license">,
		index: number,
		value: License,
	) => {
		const nextValue = [...(field.value ?? [])];
		nextValue[index] = value;
		field.onChange(nextValue);
	};

	return (
		<form>
			<div className="mb-5 flex items-center sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">Profile</h1>
					<p className="text-sm text-neutral-600">
						Update the details of the existing information below. Make sure to review all changes before saving.
					</p>
				</div>
				{activeTab === "details" && (
					<div className="ml-auto hidden space-x-3 sm:flex">
						<Button
							label="Save"
							type="button"
							onClick={() => form.handleSubmit(handleDetailsSubmit)()}
							disabled={!detailsDirty || detailsIsSaving}
							isProcessing={detailsIsSaving}
						/>
					</div>
				)}
			</div>
			<hr />
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as ProfileTabValue)}
				className="mt-3 sm:mt-8"
			>
				<TabsList>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="address">
						<TabTriggerLabel label="Address" isDirty={addressDirty} />
					</TabsTrigger>
					<TabsTrigger value="settings">
						<TabTriggerLabel label="Settings" isDirty={settingsDirty} />
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="mt-5">
					<div className="flex flex-col sm:flex-row">
						<div className="order-first mb-3 sm:order-2">
							<div className="z-10 rounded-lg sm:h-fit sm:w-[446px] sm:bg-white sm:p-5 sm:drop-shadow-center">
								<Controller
									name="photo"
									control={form.control}
									render={({ field }) => (
										<UploadCmp
											label="Upload a Photo"
											onFileSelect={(file) => field.onChange(file)}
											clearImagePreview={!!profileUser?.user_profile.photo}
											type="image"
											previewImage={isMobile || !!profileUser?.user_profile.photo}
											fileUrl={profileUser?.user_profile.photo ?? undefined}
											isEdit={!!profileUser}
										/>
									)}
								/>
							</div>
						</div>
						<div className="z-10 order-2 w-full space-y-4 rounded-lg sm:order-first sm:mr-6 sm:w-[636px] sm:bg-white sm:p-5 sm:drop-shadow-center">
							<div>
								<div className="mb-2 flex items-end justify-between">
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
								<div className="mb-2 flex items-end justify-between">
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
										<p className="mb-2 font-medium">National Provider Identity</p>
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
										<p className="mb-2 font-medium">License</p>
										<Controller
											name="license"
											control={form.control}
											render={({ field }) => {
												return (
													<>
														{field.value?.map((value, index) => {
															return (
																<div key={index} className="mb-1 flex flex-row items-center">
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
																			<SelectCmp
																				className="!w-[250px] !p-[1px]"
																				placeholder="Select State"
																				options={stateOptions}
																				value={stateOptions.find((state) => state.value === value.state) ?? null}
																				onChange={(e) => {
																					handleChangeLicense(field, index, {
																						license: value.license,
																						state: (e as OptionsModel)?.value ?? "",
																					});
																				}}
																			/>
																			<div className="min-w-16 flex items-center">
																				<Button
																					onClick={() => handleAddLicense(field)}
																					className="ml-auto h-8 w-8 !p-0"
																				>
																					<PlusIcon className="h-4 w-4" />
																				</Button>
																				{field.value.length > 1 && (
																					<Button
																						onClick={() => handleRemoveLicense(field, index)}
																						className="ml-auto h-8 w-8 !p-0"
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
										<p className="mb-2 font-medium">Bio</p>
										<Controller
											name="description"
											control={form.control}
											render={({ field }) => (
												<Textarea
													className="!h-auto resize-none"
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
					</div>
				</TabsContent>

				<TabsContent value="address" className="mt-5">
					<ProfileAddressTab
						control={form.control}
						footer={
							<TabActionRow
								dirty={addressDirty}
								state={addressSaveState}
								onReset={handleResetAddresses}
								onSave={handleSaveAddresses}
								isSaving={addressSaveState.status === "saving"}
							/>
						}
					/>
				</TabsContent>

				<TabsContent value="settings" className="mt-5">
					<Controller
						name="in_person_visit"
						control={form.control}
						render={({ field }) => (
							<SettingsTabPanel
								checked={field.value ?? false}
								onCheckedChange={field.onChange}
								footer={
									<TabActionRow
										dirty={settingsDirty}
										state={settingsSaveState}
										onReset={handleResetSettings}
										onSave={handleSaveSettings}
										isSaving={settingsSaveState.status === "saving"}
									/>
								}
							/>
						)}
					/>
				</TabsContent>
			</Tabs>
			{activeTab === "details" && (
				<div className="mt-4 flex w-full flex-col space-y-3 sm:hidden">
					<Button
						type="button"
						label="Save"
						onClick={() => form.handleSubmit(handleDetailsSubmit)()}
						disabled={!detailsDirty || detailsIsSaving}
						isProcessing={detailsIsSaving}
					/>
				</div>
			)}
		</form>
	);
}
