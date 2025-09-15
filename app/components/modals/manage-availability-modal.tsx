import Button from "../elements/Button";
import { useModal } from "@/app/contexts/ModalContext";
import Input from "../elements/Input";
import { PlusIcon, XIcon } from "lucide-react";
import SelectCmp from "../elements/SelectCmp";
import Image from "next/image";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import type { Availability, AvailabilityRule } from "@/app/models/availabilities";
import { Controller, type ControllerRenderProps, useController, useForm } from "react-hook-form";
import InputCalendar from "../elements/InputCalendar";
import { DAYS_OF_WEEK } from "@/app/lib/constants";
import { format, set } from "date-fns";
import { timeToDate } from "@/app/lib/utils";
import { useMemo } from "react";
import clsx from "clsx";

export default function ManageAvailabilityModal({
	availability,
	onClose,
	onSubmit,
}: { availability?: Availability; onClose: (callback?: () => void) => void; onSubmit: (data: Availability) => void }) {
	const timezones = Intl.supportedValuesOf("timeZone");

	const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const defaultValues = useMemo(
		() => ({
			id: availability?.id,
			name: availability?.name || "",
			timezone: availability?.timezone || clientTimeZone || "",
			rules:
				availability?.rules ||
				DAYS_OF_WEEK.map((day, index) => ({
					day: index + 1,
					starts_at: [5, 6].includes(index) ? null : "09:00:00",
					ends_at: [5, 6].includes(index) ? null : "17:00:00",
				})),
		}),
		[availability],
	);

	const { handleSubmit, control, getValues } = useForm({
		defaultValues: defaultValues,
	});

	const handleRemoveRule = (field: ControllerRenderProps<typeof defaultValues, "rules">, index: number) => {
		field.onChange(field.value.map((rule, i) => (i === index ? { ...rule, starts_at: null, ends_at: null } : rule)));
	};

	const handleAddRule = (
		field: ControllerRenderProps<typeof defaultValues, "rules">,
		index: number,
		rule: AvailabilityRule,
	) => {
		field.onChange(field.value.map((r, i) => (i === index ? rule : r)));
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="flex-1 overflow-y-auto p-3 w-full sm:max-w-[400px]">
				<div className="flex flex-row items-center text-neutral-900">
					<Image src={ArrowLeft} alt="Arrow left" className="cursor-pointer" onClick={() => onClose()} />
					<p className="text-2xl font-semibold ml-2">{availability ? "Update" : "Create"} Availability</p>
				</div>
				<div className="space-y-5 mt-5 text-neutral-900">
					<p>Set when you are typically available for meetings</p>
					<div className="flex flex-col space-y-3">
						<div className="flex flex-col space-y-1 ">
							<span className="font-semibold">Name</span>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<Input type="text" placeholder="Name" value={field.value} onChange={field.onChange} />
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
										value={{
											label: field.value,
											value: field.value,
										}}
										placeholder="Select timezone"
										options={timezones?.map((timezone) => ({ label: timezone, value: timezone }))}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>
					</div>
					<div className="flex flex-col space-y-1">
						<div className="flex flex-col space-y-3">
							<span className="font-semibold">Time Slot</span>
							<Controller
								name="rules"
								control={control}
								render={({ field }) => {
									return (
										<>
											{DAYS_OF_WEEK.map((day, index) => {
												const dayAvailability = field.value.find((rule) => rule.day === DAYS_OF_WEEK.indexOf(day) + 1);

												return (
													<div key={index} className="flex flex-row items-center gap-4">
														<div
															className={clsx(
																"w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white",
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
																				className="w-full sm:w-[120px] mr-2"
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
																				className="w-full sm:w-[120px]"
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

					<div className="flex flex-col-reverse sm:flex-row gap-y-3">
						<Button label="Cancel" secondary className="ml-auto mr-3 w-full sm:w-auto" onClick={() => onClose()} />
						<Button label="Save" className="w-full sm:w-auto" type="submit" />
					</div>
				</div>
			</div>
		</form>
	);
}
