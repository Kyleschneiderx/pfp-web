"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ReqIndicator from "@/app/components/elements/ReqIndicator";
import UploadCmp from "@/app/components/elements/UploadCmp";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import { ROLES } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { hasFieldError, toFormData } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useModal } from "@/app/contexts/ModalContext";
import { Controller, useForm } from "react-hook-form";
import type { Account, AdminFormSchema } from "@/app/models/accounts";
import { saveAccount } from "@/app/services/client_side/accounts";

export default function AdminForm({ account }: { account?: Account }) {
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
	const modal = useModal();
	const modalData = modal.getData();
	const { isMobile } = useWindowSizeCheck();
	const [formError, setFormError] = useState<ErrorModel>();

	const form = useForm<AdminFormSchema>({
		defaultValues: modalData?.data ?? {
			id: account?.id,
			name: account?.user_profile.name,
			role_id: ROLES.ADMIN,
			password: undefined,
			email: account?.email,
			photo: undefined,
		},
	});

	const handleSubmit = (data: AdminFormSchema) => {
		modal.setData({
			data: data,
		});

		modal.open({
			type: "confirm",
			title: `${account ? "Update" : "Create"} Admin`,
			message: `Are you sure you want to ${account ? "update" : "create"} this admin?`,
			onConfirm: async () => {
				try {
					const formData = toFormData(data);

					const response = await saveAccount({
						id: account?.id,
						body: formData,
						method: account ? "PUT" : "POST",
					});

					await revalidatePage("/accounts/admins");

					modal.closeAll();

					router.push(`/accounts/admins/${response.id}/edit`);
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

	return (
		<form>
			<div className="flex items-center mb-5 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">{account ? "Update" : "Create"} Admin</h1>
					<p className="text-sm text-neutral-600">
						{account
							? "Update the details of the existing information below. Make sure to review all changes before saving."
							: "Fill out the form below to create a new admin profile with the required details."}
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
					<Link href="/accounts/admins">
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
									clearImagePreview={!!account?.user_profile.photo}
									type="image"
									previewImage={isMobile || !!account?.user_profile.photo}
									fileUrl={account?.user_profile.photo ?? undefined}
									isEdit={!!account}
								/>
							)}
						/>
					</div>
					{account && <Button label="Delete" outlined className="mt-5 ml-auto hidden sm:block" onClick={undefined} />}
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
									placeholder="Enter name"
									value={field.value}
									invalid={hasFieldError("name", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					{!account && (
						<div>
							<p className="font-medium mb-2">
								Password <ReqIndicator />
							</p>
							<Controller
								name="password"
								control={form.control}
								render={({ field }) => (
									<Input
										type="password"
										placeholder="Password"
										value={field.value}
										invalid={hasFieldError("password", formError)}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>
					)}
				</div>
				<div className="sm:hidden order-last flex flex-col w-full mt-4 space-y-3">
					<Link href="/accounts/admins">
						<Button type="button" label="Cancel" secondary className="w-full" />
					</Link>
					<Button type="button" label="Save" onClick={() => form.handleSubmit(handleSubmit)()} />
				</div>
			</div>
		</form>
	);
}
