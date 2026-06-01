"use client";

import Card from "@/app/components/elements/Card";
import { format, startOfMonth } from "date-fns";
import Image from "next/image";
import {
	ArrowLeft,
	Check,
	ChevronRight,
	Clock,
	MapPin,
	Star,
	Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { BookingProvider, VisitType } from "../_data/providers";
import {
	dayHasAvailability,
	firstAvailableDay,
	getSlotsForDay,
	type TimeSlot,
} from "../_lib/slots";
import Calendar from "./Calendar";
import ConfirmationCard from "./ConfirmationCard";
import DetailsForm, { type PatientDetails } from "./DetailsForm";

type Step = "service" | "time" | "details" | "confirmed";

const STEPS: { id: Step; label: string }[] = [
	{ id: "service", label: "Visit" },
	{ id: "time", label: "Time" },
	{ id: "details", label: "Details" },
	{ id: "confirmed", label: "Done" },
];

export default function BookingExperience({ provider }: { provider: BookingProvider }) {
	const [step, setStep] = useState<Step>("service");
	const [visitTypeId, setVisitTypeId] = useState<string | null>(null);
	const [month, setMonth] = useState(() => startOfMonth(new Date()));
	const [selectedDay, setSelectedDay] = useState<Date | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
	const [details, setDetails] = useState<PatientDetails | null>(null);

	const visitType = useMemo<VisitType | null>(
		() => provider.visitTypes.find((v) => v.id === visitTypeId) ?? null,
		[provider.visitTypes, visitTypeId],
	);

	const duration = visitType?.durationMinutes ?? 30;

	const isDayAvailable = useMemo(
		() => (day: Date) =>
			dayHasAvailability(day, provider.availability, duration, provider.slug),
		[provider.availability, provider.slug, duration],
	);

	const slots = useMemo(() => {
		if (!selectedDay) return [];
		return getSlotsForDay(selectedDay, provider.availability, duration, provider.slug);
	}, [selectedDay, provider.availability, provider.slug, duration]);

	const activeStepIndex = STEPS.findIndex((s) => s.id === step);

	function handleSelectVisit(id: string) {
		setVisitTypeId(id);
		const vt = provider.visitTypes.find((v) => v.id === id);
		const first = firstAvailableDay(
			provider.availability,
			vt?.durationMinutes ?? 30,
			provider.slug,
		);
		setSelectedDay(first);
		setMonth(startOfMonth(first));
		setSelectedSlot(null);
		setStep("time");
	}

	function handleConfirm(d: PatientDetails) {
		setDetails(d);
		setStep("confirmed");
	}

	function resetToStart() {
		setStep("service");
		setVisitTypeId(null);
		setSelectedDay(null);
		setSelectedSlot(null);
		setDetails(null);
	}

	return (
		<main className="min-h-screen bg-primary-50">
			<div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
				{/* Brand bar */}
				<header className="mb-6 flex flex-col items-center">
					<Image
						src="/images/logo.png"
						alt="Pelvic Floor Pro"
						width={648}
						height={300}
						quality={100}
						priority
						className="h-12 w-auto sm:h-14"
					/>
				</header>

				<div className="grid flex-1 content-start gap-5 grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
					<ProviderPanel
						provider={provider}
						visitType={visitType}
						selectedSlot={selectedSlot}
						step={step}
					/>

					<Card className="min-w-0 p-5 sm:p-7">
						{step !== "confirmed" && <Stepper activeIndex={activeStepIndex} />}

						{step === "service" && (
							<ServiceStep provider={provider} onSelect={handleSelectVisit} />
						)}

						{step === "time" && visitType && (
							<TimeStep
								provider={provider}
								visitType={visitType}
								month={month}
								onMonthChange={setMonth}
								selectedDay={selectedDay}
								onSelectDay={(d) => {
									setSelectedDay(d);
									setSelectedSlot(null);
								}}
								isDayAvailable={isDayAvailable}
								slots={slots}
								selectedSlot={selectedSlot}
								onSelectSlot={setSelectedSlot}
								onBack={() => setStep("service")}
								onContinue={() => setStep("details")}
							/>
						)}

						{step === "details" && visitType && selectedSlot && (
							<DetailsForm
								provider={provider}
								visitType={visitType}
								slot={selectedSlot}
								onBack={() => setStep("time")}
								onConfirm={handleConfirm}
							/>
						)}

						{step === "confirmed" && visitType && selectedSlot && details && (
							<ConfirmationCard
								provider={provider}
								visitType={visitType}
								slot={selectedSlot}
								details={details}
								onReset={resetToStart}
							/>
						)}
					</Card>
				</div>

				<footer className="mt-8 text-center text-xs text-neutral-400">
					This is a preview of the patient scheduling experience · No payment is taken at
					this step.
				</footer>
			</div>
		</main>
	);
}

/* -------------------------------------------------------------------------- */
/* Provider panel                                                              */
/* -------------------------------------------------------------------------- */

function ProviderPanel({
	provider,
	visitType,
	selectedSlot,
	step,
}: {
	provider: BookingProvider;
	visitType: VisitType | null;
	selectedSlot: TimeSlot | null;
	step: Step;
}) {
	return (
		<aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
			<Card className="p-5 sm:p-6">
				<div className="flex items-start gap-4">
					<div
						className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${provider.accent.from} ${provider.accent.to} text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl`}
					>
						{provider.monogram}
					</div>
					<div className="min-w-0 flex-1">
						<h1 className="text-lg font-bold leading-tight text-neutral-900 sm:text-xl">
							{provider.name}
						</h1>
						<p className="text-sm font-medium text-primary-600">{provider.credentials}</p>
						<p className="mt-0.5 text-sm text-neutral-500">{provider.title}</p>
						<div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
							<span className="flex items-center gap-1 font-semibold text-neutral-800">
								<Star className="h-4 w-4 fill-amber-400 text-amber-400" />
								{provider.rating.toFixed(1)}
							</span>
							<span className="text-neutral-300">·</span>
							<span className="text-neutral-500">{provider.reviewCount} reviews</span>
							<span className="text-neutral-300">·</span>
							<span className="text-neutral-500">{provider.yearsExperience} yrs</span>
						</div>
					</div>
				</div>

				<p className="mt-4 hidden text-sm leading-relaxed text-neutral-600 lg:block">
					{provider.bio}
				</p>

				<div className="mt-4 space-y-2.5 border-t border-neutral-200 pt-4 text-sm sm:mt-5 sm:pt-5">
					<div className="flex items-start gap-2.5 text-neutral-600">
						<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
						<span>
							{provider.practice}
							<br />
							<span className="text-neutral-500">
								{provider.addressLine}, {provider.city}, {provider.state}
							</span>
						</span>
					</div>
					<div className="flex items-center gap-2.5 text-neutral-600">
						<Clock className="h-4 w-4 shrink-0 text-neutral-400" />
						<span>All times in {provider.timezoneLabel}</span>
					</div>
				</div>

				{/* Live selection summary */}
				{visitType && step !== "confirmed" && (
					<div className="mt-5 rounded-lg border border-primary-100 bg-primary-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
							Your selection
						</p>
						<div className="mt-2 flex items-center gap-2 text-sm font-medium text-neutral-800">
							{visitType.mode === "telehealth" ? (
								<Video className="h-4 w-4 text-primary-500" />
							) : (
								<MapPin className="h-4 w-4 text-primary-500" />
							)}
							{visitType.label}
						</div>
						<div className="mt-1 flex items-center gap-3 text-sm text-neutral-600">
							<span className="flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								{visitType.durationMinutes} min
							</span>
							<span className="font-semibold text-neutral-800">{visitType.priceLabel}</span>
						</div>
						{selectedSlot && (
							<p className="mt-2 border-t border-primary-100 pt-2 text-sm font-medium text-primary-700">
								{format(selectedSlot.date, "EEE, MMM d")} at {selectedSlot.label}
							</p>
						)}
					</div>
				)}
			</Card>
		</aside>
	);
}

/* -------------------------------------------------------------------------- */
/* Stepper                                                                     */
/* -------------------------------------------------------------------------- */

function Stepper({ activeIndex }: { activeIndex: number }) {
	return (
		<ol className="mb-6 flex items-center gap-2">
			{STEPS.map((s, i) => {
				const done = i < activeIndex;
				const active = i === activeIndex;
				return (
					<li key={s.id} className="flex flex-1 items-center gap-2">
						<div className="flex items-center gap-2">
							<span
								className={[
									"flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition",
									done
										? "bg-success-500 text-white"
										: active
											? "bg-primary-500 text-white"
											: "bg-neutral-100 text-neutral-400",
								].join(" ")}
							>
								{done ? <Check className="h-4 w-4" /> : i + 1}
							</span>
							<span
								className={[
									"hidden text-sm font-medium sm:inline",
									active ? "text-neutral-900" : done ? "text-neutral-600" : "text-neutral-400",
								].join(" ")}
							>
								{s.label}
							</span>
						</div>
						{i < STEPS.length - 1 && (
							<span
								className={[
									"h-px flex-1",
									i < activeIndex ? "bg-success-300" : "bg-neutral-200",
								].join(" ")}
							/>
						)}
					</li>
				);
			})}
		</ol>
	);
}

/* -------------------------------------------------------------------------- */
/* Step 1 — choose visit type                                                  */
/* -------------------------------------------------------------------------- */

function ServiceStep({
	provider,
	onSelect,
}: {
	provider: BookingProvider;
	onSelect: (id: string) => void;
}) {
	return (
		<div>
			<h2 className="text-2xl font-bold text-neutral-900">What kind of visit?</h2>
			<p className="mt-1 text-sm text-neutral-500">
				Choose the appointment type that fits you. You can change this later.
			</p>

			<div className="mt-6 space-y-3">
				{provider.visitTypes.map((vt) => (
					<button
						key={vt.id}
						type="button"
						onClick={() => onSelect(vt.id)}
						className="group flex w-full items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 text-left transition hover:border-primary-600 hover:bg-primary-50 focus:outline-none focus-visible:border-primary-600"
					>
						<div
							className={[
								"flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition",
								vt.mode === "telehealth"
									? "bg-primary-100 text-primary-600 group-hover:bg-primary-500 group-hover:text-white"
									: "bg-success-50 text-success-600 group-hover:bg-success-500 group-hover:text-white",
							].join(" ")}
						>
							{vt.mode === "telehealth" ? (
								<Video className="h-5 w-5" />
							) : (
								<MapPin className="h-5 w-5" />
							)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center justify-between gap-3">
								<span className="font-semibold text-neutral-900">{vt.label}</span>
								<span className="shrink-0 text-sm font-semibold text-neutral-800">
									{vt.priceLabel}
								</span>
							</div>
							<p className="mt-0.5 truncate text-sm text-neutral-500">{vt.blurb}</p>
							<span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-400">
								<Clock className="h-3.5 w-3.5" />
								{vt.durationMinutes} min ·{" "}
								{vt.mode === "telehealth" ? "Video visit" : "In person"}
							</span>
						</div>
						<ChevronRight className="h-5 w-5 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
					</button>
				))}
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Step 2 — date + time                                                        */
/* -------------------------------------------------------------------------- */

function TimeStep({
	provider,
	visitType,
	month,
	onMonthChange,
	selectedDay,
	onSelectDay,
	isDayAvailable,
	slots,
	selectedSlot,
	onSelectSlot,
	onBack,
	onContinue,
}: {
	provider: BookingProvider;
	visitType: VisitType;
	month: Date;
	onMonthChange: (d: Date) => void;
	selectedDay: Date | null;
	onSelectDay: (d: Date) => void;
	isDayAvailable: (d: Date) => boolean;
	slots: TimeSlot[];
	selectedSlot: TimeSlot | null;
	onSelectSlot: (s: TimeSlot) => void;
	onBack: () => void;
	onContinue: () => void;
}) {
	const availableSlots = slots.filter((s) => s.available);

	return (
		<div>
			<button
				type="button"
				onClick={onBack}
				className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-primary-600"
			>
				<ArrowLeft className="h-4 w-4" />
				{visitType.label}
			</button>

			<h2 className="text-2xl font-bold text-neutral-900">Pick a time</h2>
			<p className="mt-1 text-sm text-neutral-500">
				Green dots mark days with openings · {provider.timezoneLabel}
			</p>

			<div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
				<Calendar
					month={month}
					onMonthChange={onMonthChange}
					selected={selectedDay}
					onSelect={onSelectDay}
					isDayAvailable={isDayAvailable}
				/>

				<div className="md:border-l md:border-neutral-200 md:pl-6">
					<p className="mb-3 text-sm font-semibold text-neutral-800">
						{selectedDay ? format(selectedDay, "EEEE, MMM d") : "Select a day"}
					</p>

					{selectedDay && availableSlots.length === 0 && (
						<div className="rounded-lg bg-primary-50 p-4 text-sm text-neutral-500">
							No openings this day. Try another date with a green dot.
						</div>
					)}

					<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:max-h-[19rem] md:grid-cols-1 md:overflow-y-auto md:pr-1">
						{availableSlots.map((slot) => {
							const isSel = selectedSlot?.id === slot.id;
							return (
								<button
									key={slot.id}
									type="button"
									onClick={() => onSelectSlot(slot)}
									className={[
										"rounded-md border py-2.5 text-center text-sm font-semibold transition",
										isSel
											? "border-primary-500 bg-primary-500 text-white"
											: "border-neutral-200 text-neutral-700 hover:border-primary-600 hover:bg-primary-50",
									].join(" ")}
								>
									{slot.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className="mt-7 flex items-center justify-end border-t border-neutral-200 pt-5">
				<button
					type="button"
					disabled={!selectedSlot}
					onClick={onContinue}
					className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-600 disabled:cursor-default disabled:bg-neutral-300 sm:w-auto"
				>
					Continue
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
