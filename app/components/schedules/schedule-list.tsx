"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import type { ErrorModel } from "@/app/models/error_model";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "../elements/Card";
import Loader from "../elements/Loader";
import { useModal } from "@/app/contexts/ModalContext";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import type { List, PaginationModel } from "@/app/models/global_model";
import { DAYS_OF_WEEK, PAGE_ITEMS } from "@/app/lib/constants";
import { getScheduleList } from "./actions";
import clsx from "clsx";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";
import FilterList from "../elements/FilterList";
import type { Schedule } from "@/app/models/schedules";
import Badge from "../elements/Badge";
import { formatDuration, intervalToDuration } from "date-fns";
import { LinkIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { timeToDate } from "@/app/lib/utils";
import { deleteSchedule, saveSchedule } from "@/app/services/client_side/schedules";
import ManageScheduleModal from "../modals/manage-schedule-modal";
import type { ScheduleSearchQuery } from "@/app/services/server_side/schedules";

const ResponsiveActionMenu = dynamic(() => import("../elements/ResponsiveActionMenu"), {
	ssr: false,
});

export default function ScheduleList({ scheduleList }: { scheduleList: List<Schedule> }) {
	const modal = useModal();
	const [schedules, setSchedules] = useState<Schedule[]>(scheduleList.data);
	const [pagination, setPagination] = useState<PaginationModel>(() => {
		const { data, ...metadata } = scheduleList;

		return metadata;
	});
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	const getList = async (filter?: ScheduleSearchQuery) => {
		const { data: list, ...metadata } = await getScheduleList({
			...filter,
			page: "1",
			page_items: `${PAGE_ITEMS}`,
		});

		setSchedules(list);
		setPagination(metadata);
	};

	const loadMore = useCallback(async () => {
		try {
			const response = await getScheduleList({
				page: String(Number(pagination.page) + 1),
				page_items: `${PAGE_ITEMS}`,
			});

			const { data, ...metadata } = response;

			setSchedules((prev) => [...(prev ?? []), ...data]);

			setPagination(metadata);
		} catch (error) {
			const apiError = error as ErrorModel;
		}
	}, [pagination]);

	const handleFilter = useDebouncedCallback((key: keyof ScheduleSearchQuery, value: string) => {
		getList({
			[key]: value,
		});
	}, 500);

	useEffect(() => {
		return () => {
			modal.closeAll();
		};
	}, []);

	useEffect(() => {
		if (inView && Number(pagination?.page ?? 0) < (pagination?.max_page ?? 0)) {
			loadMore();
		}
	}, [inView]);

	useEffect(() => {
		const { data, ...metadata } = scheduleList;
		setSchedules(data);
		setPagination(metadata);
	}, [scheduleList]);

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

					if (data?.id) {
						setSchedules((prev) => {
							return prev?.map((p) => (p.id === response.id ? response : p));
						});
					} else {
						getList();
					}

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

	const handleOpenPanel = (schedule?: Schedule) => {
		modal.open({
			type: "panel",
			overlay: false,
			component: ({ close }) => (
				<ManageScheduleModal onSubmit={handleSaveSchedule} onClose={close} schedule={schedule} />
			),
		});
	};

	const handleRemoveSchedule = (schedule?: Schedule) => {
		modal.open({
			type: "confirm",
			title: "Delete Schedule",
			message: "Are you sure you want to delete this schedule?",
			onConfirm: async () => {
				if (!schedule?.id) return;
				try {
					await deleteSchedule(schedule?.id);
					showSnackBar({
						message: "Schedule deleted successfully",
						success: true,
					});
					setSchedules((prev) => {
						return prev?.filter((p) => p.id !== schedule.id);
					});
					modal.close();
				} catch (error) {
					const err = error as ErrorModel;
					modal.open({
						type: "alert",
						title: "Error",
						message: err.msg,
					});
				}
			},
		});
	};

	return (
		<>
			<div className="grid">
				<div className="flex flex-row mb-8 items-center gap-x-3">
					<FilterList
						onSearch={(string) => handleFilter("name", string)}
						searchPlaceholder="Search schedule"
						searchWrapperClassName="w-full sm:w-[540px]"
					/>
					<div onClick={() => handleOpenPanel()} onKeyDown={undefined} className="ml-0 w-auto sm:ml-auto">
						<Button showIcon label="Add Schedule" className="hidden sm:flex" />
						<IconAddButton className="sm:hidden" />
					</div>
				</div>
				{schedules.length <= 0 ? (
					<p className="text-center w-full mx-auto mt-[270px]">No records found.</p>
				) : (
					<div className="grid grid-cols-12 gap-5">
						{schedules?.map((schedule) => {
							return (
								<Card key={schedule.id} className="p-4 pr-3 text-neutral-900 col-span-12">
									<div className="">
										<div className="flex flex-row items-center mb-3">
											<div className="flex flex-col mr-auto mb-1 gap-y-1">
												<div className="flex flex-row items-center gap-x-1">
													<p className="text-lg font-semibold">{schedule.name}</p>
													<Badge
														label={`${formatDuration(intervalToDuration({ start: 0, end: schedule.duration * 60 * 1000 }))}`}
														className="text-white !bg-primary-500 !py-1"
													/>
													{/* <LinkIcon className="w-4 h-4" /> */}
												</div>
												<div
													className="text-neutral-900/80 text-sm !py-1 flex flex-row items-center gap-x-1 self-start cursor-pointer hover:text-neutral-900/50"
													onClick={() => {
														navigator.clipboard
															.writeText(schedule.invite_url ?? "")
															.then(() => showSnackBar({ message: "Copied!", success: true }));
													}}
													onKeyDown={undefined}
												>
													<LinkIcon className="w-3 h-3" />
													{schedule.invite_url}
												</div>
												<div className="flex flex-row text-neutral-500 gap-x-5 items-center">
													<p className="text-sm ">{schedule.description}</p>
												</div>
											</div>
											<div className="flex text-end">
												<ResponsiveActionMenu
													onEdit={() => handleOpenPanel(schedule)}
													onDelete={() => handleRemoveSchedule(schedule)}
													title={schedule.name}
												/>
											</div>
										</div>

										<div className="flex flex-row gap-x-2">
											{schedule.availability_metadata.map((rule, index) => {
												return (
													<div key={index} className="flex flex-row text-xs mb-1 items-center gap-x-5">
														<HoverCard openDelay={50} closeDelay={50}>
															<HoverCardTrigger asChild>
																<div
																	className={clsx(
																		"w-4 h-4 rounded-full p-3 flex items-center justify-center text-xs font-medium  text-white cursor-default",
																		!rule.starts_at && !rule.ends_at ? "bg-neutral-300" : "bg-primary-500",
																	)}
																>
																	{DAYS_OF_WEEK[rule.day - 1].substring(0, 1)}
																</div>
															</HoverCardTrigger>
															<HoverCardPortal>
																<HoverCardContent
																	side="top"
																	className="z-20 mb-1 p-3 outline-none rounded-md drop-shadow-center bg-white text-xs"
																	align="center"
																>
																	<div className="flex flex-row flex-grow text-neutral-700">
																		{!rule.starts_at && !rule.ends_at ? (
																			<div className="flex flex-row w-full">Unavailable</div>
																		) : (
																			<div className="flex flex-row flex-grow w-full gap-x-1">
																				<p>{`${timeToDate((rule.starts_at ?? "").toString(), "hh:mm aa")}`}</p>
																				<p>-</p>
																				<p>{`${timeToDate((rule.ends_at ?? "").toString(), "hh:mm aa")}`}</p>
																			</div>
																		)}
																	</div>
																</HoverCardContent>
															</HoverCardPortal>
														</HoverCard>
													</div>
												);
											})}
										</div>
									</div>
								</Card>
							);
						})}
						{pagination && Number(pagination.page) < pagination.max_page && (
							<div ref={ref} className="flex justify-center mt-5">
								<Loader />
								<span>Loading...</span>
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
