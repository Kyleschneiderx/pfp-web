import Button from "../elements/Button";
import { useModal } from "@/app/contexts/ModalContext";
import Input from "../elements/Input";
import { PlusIcon, XIcon } from "lucide-react";
import SelectCmp from "../elements/SelectCmp";
import { Controller, type ControllerRenderProps, useController, useForm } from "react-hook-form";
import InputCalendar from "../elements/InputCalendar";
import { DAYS_OF_WEEK } from "@/app/lib/constants";
import { timeToDate } from "@/app/lib/utils";
import { useEffect, useState } from "react";
import clsx from "clsx";
import type { Availability, Schedule } from "@/app/models/schedules";
import type { ErrorModel } from "@/app/models/error_model";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { saveSchedule } from "@/app/services/client_side/schedules";
import { getAccountSchedule } from "@/app/services/client_side/accounts";
import useAuth from "@/app/hooks/useAuth";
import Textarea from "../elements/Textarea";
import Switch from "../elements/Switch";

export default function ManageScheduleModal({ onClose }: { onClose: (callback?: () => void) => void }) {
	const { user } = useAuth();
	const modal = useModal();
	const { showSnackBar } = useSnackBar();
	const [schedule, setSchedule] = useState<Schedule>();
	const timezones = Intl.supportedValuesOf("timeZone");

	const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const defaultValues = {
		id: schedule?.id,
		user_id: schedule?.user_id,
		timezone: schedule?.timezone || clientTimeZone || "",
		description: schedule?.description || "",
		duration: schedule?.duration || 0,
		is_active: schedule?.is_active ?? false,
		availabilities:
			schedule?.availabilities ||
			DAYS_OF_WEEK.map((day, index) => ({
				day: index + 1,
				starts_at: [5, 6].includes(index) ? null : "09:00:00",
				ends_at: [5, 6].includes(index) ? null : "17:00:00",
			})),
	};

	const { handleSubmit, control, reset } = useForm({
		defaultValues: defaultValues,
	});

	useEffect(() => {
		const getSchedule = async () => {
			if (!user) return;

			const schedule = await getAccountSchedule(user.id);

			reset({
				id: schedule?.id,
				user_id: schedule?.user_id,
				timezone: schedule?.timezone || clientTimeZone || "",
				description: schedule?.description || "",
				duration: schedule?.duration || 0,
				is_active: schedule?.is_active ?? false,
				availabilities: schedule?.availabilities,
			});

			setSchedule(schedule);
		};

		getSchedule();
	}, [reset, user]);

	const handleRemoveRule = (field: ControllerRenderProps<typeof defaultValues, "availabilities">, index: number) => {
		field.onChange(field.value.map((rule, i) => (i === index ? { ...rule, starts_at: null, ends_at: null } : rule)));
	};

	const handleAddRule = (
		field: ControllerRenderProps<typeof defaultValues, "availabilities">,
		index: number,
		rule: Availability,
	) => {
		field.onChange(field.value.map((r, i) => (i === index ? rule : r)));
	};

	const handleSaveSchedule = (data: Schedule) => {
		modal.open({
			type: "confirm",
			title: "Save Schedule",
			message: "Are you sure you want to save this schedule?",
			onConfirm: async ({ toggleProcessing }) => {
				try {
					const response = await saveSchedule({
						method: data?.id ? "PUT" : "POST",
						id: data?.id,
						body: data,
					});

					showSnackBar({
						message: "Schedule saved successfully",
						success: true,
					});

					modal.closeAll();
				} catch (error) {
					const err = error as ErrorModel;

					showSnackBar({
						message: err.msg,
						success: false,
					});
				}
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(handleSaveSchedule)} className="">
			<div className="flex-1 py-1 w-full sm:max-w-[500px]">
				<div className="space-y-5 mt-5 max-h-[50%] min-h-[50%]  text-neutral-900">
					<p>
						Easily set and organize availability schedules by creating detailed time slots, ensuring users can
						seamlessly book meetings.
					</p>
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
										value={field.value}
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
								render={({ field }) => (
									<SelectCmp
										defaultValue={{ label: field.value, value: field.value }}
										placeholder="Select timezone"
										options={timezones?.map((timezone) => ({ label: timezone, value: timezone }))}
										onChange={(e) => {
											field.onChange(e?.value);
										}}
									/>
								)}
							/>
						</div>

						<div className="flex flex-col space-y-3">
							<span className="font-semibold">Time Slots</span>
							<div className="flex flex-col gap-y-3">
								<Controller
									name="availabilities"
									control={control}
									render={({ field }) => {
										return (
											<>
												{DAYS_OF_WEEK.map((day, index) => {
													const dayAvailability = field.value.find(
														(rule) => rule.day === DAYS_OF_WEEK.indexOf(day) + 1,
													);

													return (
														<div key={JSON.stringify(dayAvailability)} className="flex flex-row items-center gap-4">
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
																								i === index ? { ...val, starts_at: timeToDate(e, "HH:mm:ss") } : val,
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
																								i === index ? { ...val, ends_at: timeToDate(e, "HH:mm:ss") } : val,
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
										);
									}}
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-row w-full justify-center items-center gap-y-3">
						<Button label="Cancel" secondary className="mr-3 w-full sm:w-auto" onClick={() => onClose()} />
						<Button label="Save" className="w-full sm:w-auto" type="submit" />
					</div>
				</div>
			</div>
		</form>
	);
}
