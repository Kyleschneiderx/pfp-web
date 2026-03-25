"use client";

import Button from "@/app/components/elements/Button";
import InputCalendar from "@/app/components/elements/InputCalendar";
import SelectCmp from "@/app/components/elements/SelectCmp";
import Switch from "@/app/components/elements/Switch";
import Textarea from "@/app/components/elements/Textarea";
import { useModal } from "@/app/contexts/ModalContext";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { DAYS_OF_WEEK } from "@/app/lib/constants";
import { normalizeScheduleYmd } from "@/app/lib/schedule-dates";
import { revalidatePage } from "@/app/lib/revalidate";
import { timeToDate } from "@/app/lib/utils";
import type { Availability, Schedule } from "@/app/models/schedules";
import type { ErrorModel } from "@/app/models/error_model";
import { saveSchedule } from "@/app/services/client_side/schedules";
import clsx from "clsx";
import { PlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, type ControllerRenderProps, useForm } from "react-hook-form";
import InfoPopover from "../elements/InfoPopover";

function defaultAvailabilities(existing?: Availability[] | null): Availability[] {
	if (existing?.length) {
		return existing;
	}
	return DAYS_OF_WEEK.map((_, index) => ({
		day: index + 1,
		starts_at: [5, 6].includes(index) ? null : "09:00:00",
		ends_at: [5, 6].includes(index) ? null : "17:00:00",
	}));
}

type ScheduleFormValues = {
	id?: number;
	user_id?: number;
	timezone: string;
	description?: string;
	duration: number;
	is_active: boolean;
	availabilities: Availability[];
	seasonal: boolean;
	date_start: string | null;
	date_end: string | null;
};

function toScheduleBody(data: ScheduleFormValues): Schedule {
	const body: Schedule = {
		id: data.id,
		user_id: data.user_id,
		timezone: data.timezone,
		description: data.description,
		duration: data.duration,
		is_active: data.is_active,
		availabilities: data.availabilities,
	};

	if (!data.seasonal) {
		body.date_start = null;
		body.date_end = null;
	} else {
		body.date_start = normalizeScheduleYmd(data.date_start);
		body.date_end = normalizeScheduleYmd(data.date_end);
	}

	if ((body.date_start == null && body.date_end != null) || (body.date_start != null && body.date_end == null)) {
		body.date_start = null;
		body.date_end = null;
	}

	return body;
}

export type ScheduleFormProps = {
	variant?: "modal" | "page";
	defaultSchedule?: Partial<Schedule>;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export default function ScheduleForm({ variant = "page", defaultSchedule, onSuccess, onCancel }: ScheduleFormProps) {
	const modal = useModal();
	const { showSnackBar } = useSnackBar();
	const router = useRouter();
	const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const initialSeasonal = useMemo(() => {
		const ds = normalizeScheduleYmd(defaultSchedule?.date_start);
		const de = normalizeScheduleYmd(defaultSchedule?.date_end);
		return ds != null && de != null;
	}, [defaultSchedule?.date_end, defaultSchedule?.date_start]);

	const defaultValues: ScheduleFormValues = useMemo(
		() => ({
			id: defaultSchedule?.id,
			user_id: defaultSchedule?.user_id,
			timezone: defaultSchedule?.timezone || clientTimeZone || "",
			description: defaultSchedule?.description || "",
			duration: defaultSchedule?.duration ?? 0,
			is_active: defaultSchedule?.is_active ?? false,
			availabilities: defaultAvailabilities(defaultSchedule?.availabilities),
			seasonal: initialSeasonal,
			date_start: normalizeScheduleYmd(defaultSchedule?.date_start),
			date_end: normalizeScheduleYmd(defaultSchedule?.date_end),
		}),
		[clientTimeZone, defaultSchedule, initialSeasonal],
	);

	const { handleSubmit, control, reset, watch, setValue } = useForm<ScheduleFormValues>({
		defaultValues,
	});

	useEffect(() => {
		reset(defaultValues);
	}, [defaultValues, reset]);

	const seasonal = watch("seasonal");

	const handleRemoveRule = (field: ControllerRenderProps<ScheduleFormValues, "availabilities">, index: number) => {
		field.onChange(field.value.map((rule, i) => (i === index ? { ...rule, starts_at: null, ends_at: null } : rule)));
	};

	const handleAddRule = (
		field: ControllerRenderProps<ScheduleFormValues, "availabilities">,
		index: number,
		rule: Availability,
	) => {
		field.onChange(field.value.map((r, i) => (i === index ? rule : r)));
	};

	const runSave = (data: ScheduleFormValues) => {
		if (data.seasonal) {
			const ds = normalizeScheduleYmd(data.date_start);
			const de = normalizeScheduleYmd(data.date_end);
			if (ds == null || de == null) {
				showSnackBar({
					message: "Select both start and end dates for a limited date range.",
					success: false,
				});
				return;
			}
		}

		const body = toScheduleBody(data);

		modal.open({
			type: "confirm",
			title: "Save Schedule",
			message: "Are you sure you want to save this schedule?",
			onConfirm: async () => {
				try {
					const response = await saveSchedule({
						method: data?.id ? "PUT" : "POST",
						id: data?.id,
						body,
					});

					showSnackBar({
						message: "Schedule saved successfully",
						success: true,
					});

					modal.closeAll();

					if (variant === "page") {
						await revalidatePage("/settings/schedules");
						if (!data.id && response.id != null) {
							router.push(`/settings/schedules/${response.id}/edit`);
						} else {
							onSuccess?.();
						}
					} else {
						onSuccess?.();
					}
				} catch (error) {
					const err = error as ErrorModel;
					// 409 overlap and other schedule API errors surface via err.msg
					showSnackBar({
						message: err.msg,
						success: false,
					});
				}
			},
		});
	};

	const formInner = (
		<>
			<div className="flex flex-col space-y-3">
				<div className="flex flex-row items-center justify-between">
					<span className="font-semibold">Schedule Status</span>
					<Controller
						name="is_active"
						control={control}
						render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
					/>
				</div>
				<div className="flex flex-col space-y-1">
					<span className="font-semibold">Description</span>
					<Controller
						name="description"
						control={control}
						render={({ field }) => (
							<Textarea
								className="resize-none !h-auto"
								onChange={field.onChange}
								value={field.value ?? ""}
								rows={5}
								placeholder="Description"
							/>
						)}
					/>
				</div>

				<div className="flex flex-col space-y-1">
					<span className="font-semibold">Timezone</span>
					<Controller
						name="timezone"
						control={control}
						render={({ field }) => {
							const timezones = Intl.supportedValuesOf("timeZone");
							return (
								<SelectCmp
									defaultValue={{ label: field.value, value: field.value }}
									placeholder="Select timezone"
									options={timezones?.map((timezone) => ({
										label: timezone,
										value: timezone,
									}))}
									onChange={(e) => {
										field.onChange(e?.value);
									}}
								/>
							);
						}}
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<div className="flex flex-row items-center justify-items-center gap-2">
						<span className="font-semibold">Availability Window</span>

						<InfoPopover
							side="right"
							align="center"
							content={
								<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1">
									<span className="font-semibold">Availability Window</span>
									<p className="text-xs">
										The availability window is the period of time during which the schedule is available.
									</p>
									<p className="text-xs">
										The year in the custom date range will be ignored. Only the month and day will be used and the
										schedule will also be available in the subsequent years.
									</p>
								</div>
							}
						/>
					</div>
					<Controller
						name="seasonal"
						control={control}
						render={({ field }) => (
							<div className="flex flex-row items-center justify-between gap-4">
								<span className="text-sm font-medium">Custom Date Range</span>
								<Switch
									checked={field.value}
									onCheckedChange={(v) => {
										field.onChange(v);
										if (!v) {
											setValue("seasonal", false);
											setValue("date_start", null);
											setValue("date_end", null);
										} else {
											setValue("seasonal", true);
										}
									}}
								/>
							</div>
						)}
					/>
					{seasonal && (
						<div className="flex flex-col sm:flex-row gap-3">
							<div className="flex-1 min-w-0">
								<span className="text-sm font-medium block mb-1">Start Date</span>
								<Controller
									name="date_start"
									control={control}
									render={({ field }) => (
										<InputCalendar
											dateOnly
											showIcon
											placeholder="YYYY-MM-DD"
											className="w-full"
											value={field.value ?? undefined}
											onChange={(v) => field.onChange(v ? normalizeScheduleYmd(v) : null)}
										/>
									)}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<span className="text-sm font-medium block mb-1">End Date</span>
								<Controller
									name="date_end"
									control={control}
									render={({ field }) => (
										<InputCalendar
											dateOnly
											showIcon
											placeholder="YYYY-MM-DD"
											className="w-full"
											value={field.value ?? undefined}
											onChange={(v) => field.onChange(v ? normalizeScheduleYmd(v) : null)}
										/>
									)}
								/>
							</div>
						</div>
					)}
				</div>

				<div className="flex flex-col space-y-3">
					<span className="text-sm font-medium">Time Slots</span>
					<div className="flex flex-col gap-y-3">
						<Controller
							name="availabilities"
							control={control}
							render={({ field }) => (
								<>
									{DAYS_OF_WEEK.map((day, index) => {
										const dayAvailability = field.value.find((rule) => rule.day === DAYS_OF_WEEK.indexOf(day) + 1);

										return (
											<div key={`${day}-${index}`} className="flex flex-row items-center gap-4">
												<div
													className={clsx(
														"w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white",
														!dayAvailability?.starts_at && !dayAvailability?.ends_at
															? "bg-neutral-300"
															: "bg-primary-500",
													)}
												>
													{day}
												</div>

												<div className="flex-1">
													{!dayAvailability || (!dayAvailability.starts_at && !dayAvailability.ends_at) ? (
														<div className="flex flex-row items-center">
															<span className="text-neutral-900">Unavailable</span>
															<Button
																type="button"
																onClick={() =>
																	handleAddRule(field, index, {
																		day: DAYS_OF_WEEK.indexOf(day) + 1,
																		starts_at: "09:00:00",
																		ends_at: "17:00:00",
																	})
																}
																className="h-8 w-8 !p-0 ml-auto"
															>
																<PlusIcon className="h-4 w-4" />
															</Button>
														</div>
													) : (
														<div className="space-y-2 flex">
															<div className="flex flex-row flex-1 items-center">
																<div className="flex flex-row flex-wrap sm:flex-nowrap gap-y-3">
																	<InputCalendar
																		value={timeToDate(`${dayAvailability.starts_at ?? ""}`)}
																		className="w-full sm:w-[170px] mr-2"
																		onChange={(e) => {
																			field.onChange(
																				field.value.map((val, i) =>
																					i === index
																						? {
																								...val,
																								starts_at: timeToDate(e, "HH:mm:ss"),
																							}
																						: val,
																				),
																			);
																		}}
																		timeFormat="hh:mm aa"
																		timeOnly
																		showIcon
																	/>

																	<span className="text-neutral-900/50 mr-3 hidden sm:block">-</span>

																	<InputCalendar
																		value={timeToDate(`${dayAvailability.ends_at ?? ""}`)}
																		className="w-full sm:w-[170px]"
																		onChange={(e) => {
																			field.onChange(
																				field.value.map((val, i) =>
																					i === index
																						? {
																								...val,
																								ends_at: timeToDate(e, "HH:mm:ss"),
																							}
																						: val,
																				),
																			);
																		}}
																		timeFormat="hh:mm aa"
																		timeOnly
																		showIcon
																	/>
																</div>

																<div className="flex items-center text-neutral-900 ml-auto">
																	<Button
																		type="button"
																		onClick={() => handleRemoveRule(field, index)}
																		className="h-8 w-8 !p-0 text-neutral-900 "
																	>
																		<XIcon className="h-4 w-4" />
																	</Button>
																</div>
															</div>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</>
							)}
						/>
					</div>
				</div>
			</div>

			{variant === "modal" ? (
				<div className="flex flex-row w-full justify-center items-center gap-y-3 mt-6">
					<Button
						label="Cancel"
						secondary
						className="mr-3 w-full sm:w-auto"
						type="button"
						onClick={() => onCancel?.()}
					/>
					<Button label="Save" className="w-full sm:w-auto" type="submit" />
				</div>
			) : null}
		</>
	);

	if (variant === "page") {
		const isEdit = Boolean(defaultSchedule?.id);
		return (
			<form onSubmit={handleSubmit(runSave)}>
				<div className="flex items-center mb-5 sm:mb-7 flex-wrap gap-3">
					<div>
						<h1 className="text-2xl font-semibold">{isEdit ? "Edit" : "Create"} Schedule</h1>
						<p className="text-sm text-neutral-600">Set timezone, weekly slots, and optional date range.</p>
					</div>
					<div className="hidden sm:flex ml-auto space-x-3">
						<Link href="/settings/schedules">
							<Button label="Cancel" secondary type="button" />
						</Link>
						<Button label={isEdit ? "Save" : "Create"} type="submit" />
					</div>
				</div>
				<hr />
				<div className="flex flex-col sm:flex-row mt-3 sm:mt-8">
					<div className="w-full self-start order-2 sm:order-first sm:w-[636px] sm:p-5 space-y-4 sm:mr-6 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
						{formInner}
					</div>
					<div className="sm:hidden order-last flex flex-col w-full mt-4 space-y-3">
						<Link href="/settings/schedules">
							<Button label="Cancel" secondary className="w-full" type="button" />
						</Link>
						<Button label={isEdit ? "Save" : "Create"} className="w-full" type="submit" />
					</div>
				</div>
			</form>
		);
	}

	return (
		<form onSubmit={handleSubmit(runSave)} className="">
			<div className="flex-1 py-1 w-full sm:max-w-[500px]">
				<div className="space-y-5 mt-5 max-h-[50%] min-h-[50%]  text-neutral-900">
					<p>
						Easily set and organize availability schedules by creating detailed time slots, ensuring users can
						seamlessly book meetings.
					</p>
					{formInner}
				</div>
			</div>
		</form>
	);
}
