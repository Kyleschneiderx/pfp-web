"use client";

import { format } from "date-fns";
import {
	CalendarPlus,
	Check,
	Clock,
	Mail,
	MapPin,
	Video,
} from "lucide-react";
import type { BookingProvider, VisitType } from "../_data/providers";
import type { TimeSlot } from "../_lib/slots";
import type { PatientDetails } from "./DetailsForm";

interface Props {
	provider: BookingProvider;
	visitType: VisitType;
	slot: TimeSlot;
	details: PatientDetails;
	onReset: () => void;
}

export default function ConfirmationCard({
	provider,
	visitType,
	slot,
	details,
	onReset,
}: Props) {
	// Stable, fake confirmation code derived from the slot id (no API).
	const code = `PFP-${Math.abs(
		slot.id.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7),
	)
		.toString(36)
		.toUpperCase()
		.slice(0, 6)}`;

	return (
		<div className="py-2 text-center">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-success-50 ring-1 ring-success-200">
				<Check className="h-8 w-8 text-success-600" strokeWidth={2.5} />
			</div>

			<h2 className="mt-5 text-2xl font-bold text-neutral-900">
				You&rsquo;re booked, {details.firstName}!
			</h2>
			<p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
				A confirmation is on its way to{" "}
				<span className="font-medium text-neutral-700">{details.email}</span>. We&rsquo;ve
				saved your spot with {provider.name}.
			</p>

			<div className="mx-auto mt-7 max-w-md rounded-lg border border-neutral-200 bg-primary-50 p-5 text-left">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
						Confirmation
					</span>
					<span className="font-mono text-sm font-semibold text-neutral-700">{code}</span>
				</div>

				<div className="mt-4 space-y-3 text-sm">
					<Row
						icon={
							visitType.mode === "telehealth" ? (
								<Video className="h-4 w-4" />
							) : (
								<MapPin className="h-4 w-4" />
							)
						}
						label={visitType.label}
						value={visitType.priceLabel}
					/>
					<Row
						icon={<Clock className="h-4 w-4" />}
						label={`${format(slot.date, "EEEE, MMMM d")} · ${slot.label}`}
						value={`${visitType.durationMinutes} min`}
					/>
					<Row
						icon={
							visitType.mode === "telehealth" ? (
								<Video className="h-4 w-4" />
							) : (
								<MapPin className="h-4 w-4" />
							)
						}
						label={
							visitType.mode === "telehealth"
								? "Secure video link emailed before your visit"
								: `${provider.practice}, ${provider.addressLine}`
						}
					/>
				</div>
			</div>

			<div className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row">
				<button
					type="button"
					className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-primary-600 hover:text-primary-600"
				>
					<CalendarPlus className="h-4 w-4" />
					Add to calendar
				</button>
				<button
					type="button"
					className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-primary-600 hover:text-primary-600"
				>
					<Mail className="h-4 w-4" />
					Email me details
				</button>
			</div>

			<button
				type="button"
				onClick={onReset}
				className="mt-6 text-sm font-medium text-neutral-400 underline-offset-4 transition hover:text-primary-600 hover:underline"
			>
				Book another visit
			</button>
		</div>
	);
}

function Row({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value?: string;
}) {
	return (
		<div className="flex items-start justify-between gap-3">
			<span className="flex items-start gap-2.5 text-neutral-700">
				<span className="mt-0.5 text-primary-500">{icon}</span>
				<span className="font-medium">{label}</span>
			</span>
			{value && <span className="shrink-0 text-neutral-500">{value}</span>}
		</div>
	);
}
