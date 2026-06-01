"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import Textarea from "@/app/components/elements/Textarea";
import { format } from "date-fns";
import { ArrowLeft, CalendarCheck, Clock, MapPin, Video } from "lucide-react";
import { useState } from "react";
import type { BookingProvider, VisitType } from "../_data/providers";
import type { TimeSlot } from "../_lib/slots";

export interface PatientDetails {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	reason: string;
	isNewPatient: boolean;
}

interface Props {
	provider: BookingProvider;
	visitType: VisitType;
	slot: TimeSlot;
	onBack: () => void;
	onConfirm: (details: PatientDetails) => void;
}

const EMPTY: PatientDetails = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	reason: "",
	isNewPatient: true,
};

export default function DetailsForm({ provider, visitType, slot, onBack, onConfirm }: Props) {
	const [values, setValues] = useState<PatientDetails>(EMPTY);
	const [consent, setConsent] = useState(false);
	const [touched, setTouched] = useState(false);

	const errors = {
		firstName: values.firstName.trim() ? "" : "Required",
		lastName: values.lastName.trim() ? "" : "Required",
		email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "Enter a valid email",
		phone: values.phone.replace(/\D/g, "").length >= 10 ? "" : "Enter a valid phone",
	};
	const isValid = !Object.values(errors).some(Boolean) && consent;

	function set<K extends keyof PatientDetails>(key: K, value: PatientDetails[K]) {
		setValues((v) => ({ ...v, [key]: value }));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setTouched(true);
		if (isValid) onConfirm(values);
	}

	return (
		<form onSubmit={handleSubmit}>
			<button
				type="button"
				onClick={onBack}
				className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-primary-600"
			>
				<ArrowLeft className="h-4 w-4" />
				Change time
			</button>

			<h2 className="text-2xl font-bold text-neutral-900">A few details</h2>
			<p className="mt-1 text-sm text-neutral-500">
				We&rsquo;ll send your confirmation and visit instructions here.
			</p>

			{/* Appointment recap */}
			<div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-primary-50 px-4 py-3 text-sm text-neutral-700">
				<span className="flex items-center gap-1.5 font-medium">
					{visitType.mode === "telehealth" ? (
						<Video className="h-4 w-4 text-primary-500" />
					) : (
						<MapPin className="h-4 w-4 text-primary-500" />
					)}
					{visitType.label}
				</span>
				<span className="flex items-center gap-1.5">
					<CalendarCheck className="h-4 w-4 text-neutral-400" />
					{format(slot.date, "EEE, MMM d")} · {slot.label}
				</span>
				<span className="flex items-center gap-1.5">
					<Clock className="h-4 w-4 text-neutral-400" />
					{visitType.durationMinutes} min
				</span>
			</div>

			<div className="mt-6 grid gap-4 sm:grid-cols-2">
				<Field
					label="First name"
					value={values.firstName}
					onChange={(v) => set("firstName", v)}
					error={touched ? errors.firstName : ""}
					autoComplete="given-name"
				/>
				<Field
					label="Last name"
					value={values.lastName}
					onChange={(v) => set("lastName", v)}
					error={touched ? errors.lastName : ""}
					autoComplete="family-name"
				/>
				<Field
					label="Email"
					type="email"
					value={values.email}
					onChange={(v) => set("email", v)}
					error={touched ? errors.email : ""}
					autoComplete="email"
				/>
				<Field
					label="Phone"
					type="tel"
					value={values.phone}
					onChange={(v) => set("phone", v)}
					error={touched ? errors.phone : ""}
					autoComplete="tel"
				/>
			</div>

			<div className="mt-4">
				<label className="mb-1.5 block text-sm font-medium text-neutral-700">
					What would you like help with?{" "}
					<span className="font-normal text-neutral-400">(optional)</span>
				</label>
				<Textarea
					rows={3}
					value={values.reason}
					onChange={(e) => set("reason", e.target.value)}
					placeholder="Share anything that would help your provider prepare."
					className="!h-[90px]"
				/>
			</div>

			<fieldset className="mt-4">
				<legend className="mb-1.5 text-sm font-medium text-neutral-700">
					Are you a new patient?
				</legend>
				<div className="flex gap-2">
					{[
						{ label: "New patient", value: true },
						{ label: "Returning", value: false },
					].map((opt) => (
						<button
							key={opt.label}
							type="button"
							onClick={() => set("isNewPatient", opt.value)}
							className={[
								"flex-1 rounded-md border py-2.5 text-sm font-semibold transition",
								values.isNewPatient === opt.value
									? "border-primary-500 bg-primary-50 text-primary-700"
									: "border-neutral-200 text-neutral-600 hover:border-neutral-300",
							].join(" ")}
						>
							{opt.label}
						</button>
					))}
				</div>
			</fieldset>

			<label className="mt-5 flex items-start gap-3 text-sm text-neutral-600">
				<input
					type="checkbox"
					checked={consent}
					onChange={(e) => setConsent(e.target.checked)}
					className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-500 focus:ring-primary-400"
				/>
				<span>
					I understand this request will be reviewed by{" "}
					{provider.name.split(" ").slice(-1)}&rsquo;s office and agree to the cancellation
					policy and privacy practices.
				</span>
			</label>
			{touched && !consent && (
				<p className="mt-1.5 text-xs font-medium text-error-500">Please confirm to continue.</p>
			)}

			<div className="mt-7 flex items-center justify-end border-t border-neutral-200 pt-5">
				<Button type="submit" label="Confirm booking" className="w-full sm:w-auto" />
			</div>
		</form>
	);
}

function Field({
	label,
	value,
	onChange,
	error,
	type = "text",
	autoComplete,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	error?: string;
	type?: string;
	autoComplete?: string;
}) {
	return (
		<div>
			<label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
			<Input
				type={type}
				value={value}
				autoComplete={autoComplete}
				invalid={Boolean(error)}
				onChange={(e) => onChange(e.target.value)}
			/>
			{error && <p className="mt-1 text-xs font-medium text-error-500">{error}</p>}
		</div>
	);
}
