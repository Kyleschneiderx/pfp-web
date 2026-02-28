"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ReqIndicator from "@/app/components/elements/ReqIndicator";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import { revalidatePage } from "@/app/lib/revalidate";
import { hasFieldError } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useModal } from "@/app/contexts/ModalContext";
import { Controller, useForm } from "react-hook-form";
import type { PromoCode, PromoCodeFormSchema } from "@/app/models/promo-code";
import InfoPopover from "../elements/InfoPopover";
import InputCalendar from "../elements/InputCalendar";
import Switch from "../elements/Switch";
import { deletePromoCode, savePromoCode } from "@/app/services/client_side/promo-codes";

export default function PromoCodeForm({ promoCode }: { promoCode?: PromoCode }) {
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
	const modal = useModal();
	const modalData = modal.getData();
	const [formError, setFormError] = useState<ErrorModel>();

	const form = useForm<PromoCodeFormSchema>({
		defaultValues: modalData?.data ?? {
			id: promoCode?.id,
			code: promoCode?.code,
			voucher_to_generate: promoCode?.voucher_to_generate,
			times_to_claim: promoCode?.times_to_claim,
			percent_off: promoCode?.percent_off,
			expires_at: promoCode?.expires_at,
			is_user_upgradable: promoCode?.is_user_upgradable ?? false,
		},
	});

	const handleSubmit = (data: PromoCodeFormSchema) => {
		modal.setData({
			data: data,
		});

		modal.open({
			type: "confirm",
			title: `${promoCode ? "Update" : "Create"} Promo Code`,
			message: `Are you sure you want to ${promoCode ? "update" : "create"} this promo code?`,
			onConfirm: async () => {
				try {
					const response = await savePromoCode({
						id: promoCode?.id,
						body: data,
						method: promoCode ? "PUT" : "POST",
					});

					await revalidatePage("/settings/promo-codes");

					modal.closeAll();

					router.push(`/settings/promo-codes/${response.id}/edit`);
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

	const handleDelete = async (data: PromoCode) => {
		modal.open({
			type: "confirm",
			title: "Delete Promo Code",
			message: "Are you sure you want to remove this promo code?",
			onConfirm: async () => {
				try {
					await deletePromoCode(data.id!);

					await revalidatePage("/settings/promo-codes");

					modal.closeAll();

					router.push("/settings/promo-codes");
				} catch (e) {
					const error = e as ErrorModel;

					showSnackBar({ message: error.msg, success: false });
				}
			},
		});
	};

	return (
		<form>
			<div className="flex items-center mb-5 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">{promoCode ? "Update" : "Create"} Promo Code</h1>
					<p className="text-sm text-neutral-600">
						{promoCode
							? "Update the details of the existing information below. Make sure to review all changes before saving."
							: "Fill out the form below to create a new promo code with the required details."}
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
					<Link href="/settings/promo-codes">
						<Button label="Cancel" secondary />
					</Link>
					{promoCode && (
						<Button
							label="Delete"
							outlined
							className="ml-auto hidden sm:block"
							onClick={() => handleDelete(promoCode)}
						/>
					)}
					<Button label="Save" type="button" onClick={() => form.handleSubmit(handleSubmit)()} />
				</div>
			</div>
			<hr />
			<div className="flex flex-col sm:flex-row mt-3 sm:mt-8">
				<div className="w-full self-start order-2 sm:order-first sm:w-[636px] sm:p-5 space-y-4 sm:mr-6 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
					<div>
						<div className="flex space-x-1 items-end mb-2 justify-between">
							<div className="flex items-center space-x-1">
								<p className="font-medium">Code</p>
								<InfoPopover side="right">
									<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1">
										<span className="font-semibold">Code</span>
										<p className="text-xs">
											The unique code that customers will use to redeem the promo code. Code should be alphanumeric and
											hypen only.
										</p>
										<span className="text-error-500 italic text-xs">
											Note: System will automatically generate a code when left blank. e.g XXXX-XXXX-XXXX
										</span>
									</div>
								</InfoPopover>
							</div>
							<div className="flex items-center space-x-1">
								<Controller
									name="is_user_upgradable"
									control={form.control}
									render={({ field }) => (
										<Switch
											checked={field.value ?? false}
											onCheckedChange={field.onChange}
											checkedLabel="With Upgrade"
											unCheckedLabel="Without Upgrade"
										/>
									)}
								/>
								<InfoPopover side="right">
									<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1">
										<span className="font-semibold">Upgrade User</span>
										<p className="text-xs">Upgrades user account to Premium when claiming this promo code.</p>
									</div>
								</InfoPopover>
							</div>
						</div>
						<Controller
							name="code"
							control={form.control}
							render={({ field }) => (
								<Input
									type="text"
									placeholder="Enter Code"
									value={field.value}
									invalid={hasFieldError("code", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium">
								Percent Off <ReqIndicator />
							</p>
						</div>
						<Controller
							name="percent_off"
							control={form.control}
							render={({ field }) => (
								<Input
									type="number"
									placeholder="Enter Percent Off"
									value={field.value}
									invalid={hasFieldError("percent_off", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					<div>
						<div className="flex space-x-1 items-end mb-2">
							<p className="font-medium">Times to Claim</p>
							<InfoPopover side="right">
								<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1">
									<span className="font-semibold">Times to Claim</span>
									<p className="text-xs">Number of times promo code can be claim.</p>
								</div>
							</InfoPopover>
						</div>
						<Controller
							name="times_to_claim"
							control={form.control}
							render={({ field }) => (
								<Input
									type="number"
									placeholder="Enter Times to Claim"
									value={field.value}
									invalid={hasFieldError("times_to_claim", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					<div>
						<div className="flex space-x-1 items-end mb-2">
							<p className="font-medium">Voucher to Generate</p>
							<InfoPopover side="right">
								<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1">
									<span className="font-semibold">Voucher to Generate</span>
									<p className="text-xs">
										Promo code can generate more than 1 voucher for the customer upon redemption of the code.
									</p>
								</div>
							</InfoPopover>
						</div>
						<Controller
							name="voucher_to_generate"
							control={form.control}
							render={({ field }) => (
								<Input
									type="number"
									placeholder="Enter Voucher to Generate"
									value={field.value}
									invalid={hasFieldError("voucher_to_generate", formError)}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					<div>
						<div className="flex space-x-1 items-end mb-2">
							<p className="font-medium">Expiration Date</p>
						</div>
						<Controller
							name="expires_at"
							control={form.control}
							render={({ field }) => (
								<InputCalendar
									className="!pl-4 !text-base !py-[12px] rounded-md w-full"
									placeholder="Select Expiration Date"
									dateOnly
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
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
