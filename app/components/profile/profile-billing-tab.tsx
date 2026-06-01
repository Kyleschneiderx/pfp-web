"use client";

import Button from "@/app/components/elements/Button";
import type { ProviderConnectStatus } from "@/app/models/provider_connect_model";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, XCircle } from "lucide-react";

type EnrollmentState = "not_enrolled" | "incomplete" | "enrolled";

interface ProfileBillingTabProps {
	isProvider: boolean;
	isLoading: boolean;
	isActionLoading: boolean;
	status: ProviderConnectStatus | null;
	onEnroll: () => void;
	onContinueOnboarding: () => void;
	onOpenDashboard: () => void;
}

function getEnrollmentState(status: ProviderConnectStatus | null): EnrollmentState {
	if (!status?.account_id) return "not_enrolled";
	if (!status.onboarding_completed) return "incomplete";
	return "enrolled";
}

function StatusBadge({ state }: { state: EnrollmentState }) {
	const config = {
		enrolled: {
			className: "bg-success-50 text-success-600",
			icon: <CheckCircle2 className="h-3.5 w-3.5" />,
			label: "Enrolled",
		},
		incomplete: {
			className: "bg-amber-50 text-amber-600",
			icon: <AlertCircle className="h-3.5 w-3.5" />,
			label: "Onboarding incomplete",
		},
		not_enrolled: {
			className: "bg-neutral-100 text-neutral-600",
			icon: <XCircle className="h-3.5 w-3.5" />,
			label: "Not enrolled",
		},
	}[state];

	return (
		<div
			className={clsx(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
				config.className,
			)}
		>
			{config.icon}
			<span>{config.label}</span>
		</div>
	);
}

function CapabilityRow({ label, enabled }: { label: string; enabled: boolean }) {
	return (
		<div className="flex items-center gap-2 text-sm">
			{enabled ? (
				<CheckCircle2 className="h-4 w-4 text-success-600" />
			) : (
				<XCircle className="h-4 w-4 text-neutral-400" />
			)}
			<span className={enabled ? "text-neutral-700" : "text-neutral-500"}>{label}</span>
		</div>
	);
}

export function ProfileBillingTab({
	isProvider,
	isLoading,
	isActionLoading,
	status,
	onEnroll,
	onContinueOnboarding,
	onOpenDashboard,
}: ProfileBillingTabProps) {
	const state = getEnrollmentState(status);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold text-neutral-900">Billing & Payouts</h2>
				<p className="mt-1 text-sm text-neutral-600">
					Connect a Stripe Express account to receive payouts for your sessions and visits.
				</p>
			</div>

			{!isProvider ? (
				<div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4">
					<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400" />
					<div className="text-sm text-neutral-600">
						<p className="font-medium text-neutral-900">Stripe Express applies to providers.</p>
						<p className="mt-1">
							Payout enrollment is managed by each provider from their own profile. This account type does not enroll in
							Stripe Express.
						</p>
					</div>
				</div>
			) : (
				<div className="rounded-lg border border-neutral-200 bg-white">
					<div className="flex items-start gap-4 p-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50">
							<CreditCard className="h-6 w-6 text-primary-500" />
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-3">
								<h3 className="font-medium text-neutral-900">Stripe Express</h3>
								{!isLoading && <StatusBadge state={state} />}
							</div>
							<p className="mt-1 text-sm text-neutral-600">
								Stripe handles secure onboarding, identity verification, and bank payouts on your behalf.
							</p>

							{isLoading ? (
								<p className="mt-4 text-sm text-neutral-500">Checking enrollment status…</p>
							) : (
								<>
									{state === "enrolled" && (
										<div className="mt-4 space-y-2">
											<CapabilityRow label="Charges enabled" enabled={status?.charges_enabled ?? false} />
											<CapabilityRow label="Payouts enabled" enabled={status?.payouts_enabled ?? false} />
										</div>
									)}

									{state === "incomplete" && (
										<div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
											Your Stripe onboarding isn’t finished yet. Continue where you left off to start receiving payouts.
											{status?.requirements_due && status.requirements_due.length > 0 && (
												<span className="mt-1 block text-xs text-amber-600">
													Still needed: {status.requirements_due.join(", ")}
												</span>
											)}
										</div>
									)}

									<div className="mt-4 flex flex-wrap items-center gap-3">
										{state === "not_enrolled" && (
											<Button
												type="button"
												onClick={onEnroll}
												disabled={isActionLoading}
												isProcessing={isActionLoading}
												label="Enroll with Stripe"
												className="min-w-[180px]"
											/>
										)}

										{state === "incomplete" && (
											<Button
												type="button"
												onClick={onContinueOnboarding}
												disabled={isActionLoading}
												isProcessing={isActionLoading}
												label="Continue onboarding"
												className="min-w-[180px]"
											/>
										)}

										{state === "enrolled" && (
											<Button
												type="button"
												secondary
												onClick={onOpenDashboard}
												disabled={isActionLoading}
												isProcessing={isActionLoading}
											>
												<span className="inline-flex items-center gap-2">
													<ExternalLink className="h-4 w-4" />
													Open Stripe dashboard
												</span>
											</Button>
										)}
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
