"use client";

import type { ErrorModel } from "@/app/models/error_model";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "../elements/Card";
import Loader from "../elements/Loader";
import { useModal } from "@/app/contexts/ModalContext";
import Button from "../elements/Button";
import type { List, PaginationModel } from "@/app/models/global_model";
import { DEFAULT_LIST, PAGE_ITEMS } from "@/app/lib/constants";
import { getMeetingList } from "./actions";
import clsx from "clsx";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";
import Badge from "../elements/Badge";
import { endOfDay, endOfMonth, format, formatDuration, intervalToDuration, startOfDay, startOfMonth } from "date-fns";
import { CalendarIcon, ClockIcon, ListIcon, MailIcon, TextQuoteIcon, UserIcon } from "lucide-react";
import type { Meeting } from "@/app/models/meetings";
import type { MeetingsSearchQuery } from "@/app/services/server_side/meetings";
import BigCalendar from "../elements/BigCalendar";
import type { Event, EventProps, View } from "react-big-calendar";
import CalendarEventModal from "../modals/calendar-event-modal";
import { dateToUtc, formatDatetime } from "@/app/lib/utils";

const FilterList = dynamic(() => import("../elements/FilterList"), {
	ssr: false,
});

const CalendarMonthEvent = ({ event, title }: EventProps) => {
	return (
		<div className="flex-col flex-wrap flex">
			<span className="text-xs">{title}</span>
			<div className="flex flex-row space-x-1 items-center">
				<UserIcon className="w-3 h-3" />
				<span className="text-xs text-ellipsis">{event.resource.user.user_profile.name}</span>
			</div>
		</div>
	);
};

const CalendarDayEvent = ({ event, title }: EventProps) => {
	return (
		<div className="block">
			<div className="flex-col flex-wrap flex space-y-1">
				<span className="text-xs">{title}</span>
				<div className="flex flex-row space-x-1 items-center">
					<UserIcon className="w-3 h-3 flex-shrink-0" />
					<span className="text-xs text-ellipsis">{event.resource.user.email}</span>
				</div>
				<div className="flex flex-row space-x-1 items-center">
					<TextQuoteIcon className="w-3 h-3 flex-shrink-0" />
					<span className="text-xs text-ellipsis">{event.resource.schedule.description}</span>
				</div>
			</div>
		</div>
	);
};

export default function MeetingList({ meetingList }: { meetingList: List<Meeting> }) {
	const modal = useModal();
	const [meetings, setMeetings] = useState<Meeting[]>(meetingList.data);
	const [pagination, setPagination] = useState<PaginationModel>(() => {
		const { data, ...metadata } = meetingList;

		return metadata;
	});
	const [ref, inView] = useInView();
	const [view, setView] = useState<"list" | "calendar">("list");
	const [calendarView, setCalendarView] = useState<View>("month");
	const [calendarDate, setCalendarDate] = useState<Date>(new Date());
	const filterRef = useRef<MeetingsSearchQuery>({});

	const getList = async (filter?: MeetingsSearchQuery) => {
		const { data: list, ...metadata } =
			(await getMeetingList({
				page: "1",
				page_items: `${PAGE_ITEMS}`,
				...filter,
			})) ?? DEFAULT_LIST;

		setMeetings(list);
		setPagination(metadata);
	};

	const loadMore = useCallback(async () => {
		try {
			const response =
				(await getMeetingList({
					page: String(Number(pagination.page) + 1),
					page_items: `${PAGE_ITEMS}`,
				})) ?? DEFAULT_LIST;

			const { data, ...metadata } = response;

			setMeetings((prev) => [...(prev ?? []), ...data]);

			setPagination(metadata);
		} catch (error) {
			const apiError = error as ErrorModel;
		}
	}, [pagination]);

	const handleFilter = useDebouncedCallback(
		<K extends keyof MeetingsSearchQuery>(key: K, value: MeetingsSearchQuery[K]) => {
			console.log(filterRef.current);
			filterRef.current[key] = value;

			getList(filterRef.current);
		},
		500,
	);

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
		const { data, ...metadata } = meetingList;
		setMeetings(data);
		setPagination(metadata);
	}, [meetingList]);

	const handleSelectEvent = (event: Event | Meeting) => {
		modal.close();
		modal.open({
			type: "panel",
			overlay: false,
			className: "sm:!min-w-[200px] !max-w-[360px] !p-0",
			component: ({ close }) => (
				<CalendarEventModal
					onSubmit={() => {}}
					onClose={close}
					meeting={"resource" in event ? event.resource : event}
				/>
			),
		});
	};

	return (
		<>
			<div className="grid gap-y-3">
				<div className="flex items-center mb-5">
					<FilterList
						searchPlaceholder="Search meetings"
						searchValue={filterRef.current?.search}
						onSearch={(string) => handleFilter("search", string)}
						sort={{
							label: "Sort",
							content: () => {
								return (
									<div className="flex flex-col space-y-3 p-3 text-sm font-semibold">
										<label className="flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={filterRef.current.sort?.includes("starts_at:DESC") ?? true}
												onChange={() => handleFilter("sort", ["starts_at:DESC"])}
												className="mr-2 cursor-pointer"
											/>
											Upcoming
										</label>
										<label className="flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={filterRef.current.sort?.includes("starts_at:ASC") ?? false}
												onChange={() => handleFilter("sort", ["starts_at:ASC"])}
												className="mr-2 cursor-pointer"
											/>
											Past
										</label>
									</div>
								);
							},
						}}
						className="mr-4 sm:mr-0"
					/>
				</div>
				<div className="col-span-12">
					<div className="flex justify-end">
						<Button
							className={clsx(
								view === "list" ? "bg-primary-200 " : "bg-white",
								"drop-shadow-md rounded-r-none hover:bg-primary-200 group",
							)}
							onClick={() => {
								filterRef.current = {};
								getList();
								setView("list");
							}}
						>
							<ListIcon
								className={clsx(
									"w-5 h-5 ",
									view === "list" ? "text-primary-600" : "text-neutral-600 group-hover:text-primary-600",
								)}
							/>
						</Button>
						<Button
							className={clsx(
								view === "calendar" ? "bg-primary-200" : "bg-white",
								"drop-shadow-md rounded-l-none hover:bg-primary-200 group",
							)}
							onClick={() => {
								filterRef.current = {
									starts_at: formatDatetime(startOfDay(startOfMonth(dateToUtc(new Date())))),
									ends_at: formatDatetime(endOfDay(endOfMonth(dateToUtc(new Date())))),
								};
								getList(filterRef.current);
								setView("calendar");
							}}
						>
							<CalendarIcon
								className={clsx(
									"w-5 h-5 ",
									view === "calendar" ? "text-primary-600" : "text-neutral-600 group-hover:!text-primary-600",
								)}
							/>
						</Button>
					</div>
				</div>
				{!meetings.length && view === "list" ? (
					<div className="col-span-12 text-center">
						<p className="text-center mx-auto mt-[300px]">No records found.</p>
					</div>
				) : view === "list" ? (
					<div className="grid grid-cols-12 col-span-12 gap-5">
						{meetings?.map((meeting) => {
							return (
								<Card
									key={meeting.id}
									className="p-4 pr-3 text-neutral-900 col-span-12 cursor-pointer transition-transform hover:scale-[1.01]"
								>
									<div
										className="flex flex-row items-center mb-3"
										onClick={() => handleSelectEvent(meeting)}
										onKeyDown={undefined}
									>
										<div className="flex flex-col mr-auto mb-1 text-neutral-900">
											<div className="flex flex-row items-center space-x-3">
												<p className="text-lg font-semibold">{meeting.user?.user_profile?.name ?? "Test"}</p>
												<Badge
													label={`${formatDuration(intervalToDuration({ start: 0, end: meeting.duration * 60 * 1000 }))}`}
													className="text-white !bg-primary-500 !py-1"
												/>
											</div>
											<div className="flex flex-col mt-3 space-y-1 text-sm">
												<div className="flex flex-row items-center space-x-3">
													<ClockIcon className="w-5 h-5 flex-shrink-0" />
													<div className="flex flex-row items-center space-x-1">
														<p>{format(new Date(meeting?.starts_at ?? ""), "EEEE, MMMM d")}</p>
														<p>{"•"}</p>
														<p>{format(new Date(meeting?.starts_at ?? ""), "hh:mm aa")}</p>
														<p>{"-"}</p>
														<p>{format(new Date(meeting?.ends_at ?? ""), "hh:mm aa")}</p>
													</div>
												</div>
												<div className="flex flex-row items-center space-x-3">
													<MailIcon className="w-5 h-5 flex-shrink-0" />
													<p className="text-sm ">{meeting.user?.email}</p>
												</div>
												<div className="flex flex-row space-x-3 items-center">
													<TextQuoteIcon className="w-5 h-5 flex-shrink-0 self-start" />
													<p className="text-sm ">{meeting.schedule?.description}</p>
												</div>
											</div>
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
				) : (
					<Card className="text-neutral-900 col-span-12">
						<BigCalendar
							className={`custom-calendar-${calendarView}`}
							events={meetings.map((meeting) => ({
								start: new Date(meeting.starts_at),
								end: new Date(meeting.ends_at),
								title: meeting.schedule?.user?.user_profile?.name ?? "",
								resource: meeting,
							}))}
							components={{
								month: {
									event: CalendarMonthEvent,
								},
								day: {
									event: CalendarDayEvent,
								},
							}}
							messages={{
								showMore: (total) => (view === "calendar" ? `+${total} more` : `${total} events`),
							}}
							date={calendarDate}
							onSelectEvent={handleSelectEvent}
							onNavigate={(date, view, action) => {
								filterRef.current = {
									...filterRef.current,
									starts_at: formatDatetime(startOfDay(startOfMonth(date))),
									ends_at: formatDatetime(endOfDay(endOfMonth(date))),
								};
								if (view === "day") {
									filterRef.current.starts_at = formatDatetime(startOfDay(date));
									filterRef.current.ends_at = formatDatetime(endOfDay(date));
								}
								getList(filterRef.current);
								setCalendarDate(date);
								setCalendarView(view);
							}}
							onDrillDown={(date, view) => {
								setCalendarDate(date);
								setCalendarView(view);
							}}
							onView={(view) => {
								filterRef.current = {
									...filterRef.current,
									starts_at: formatDatetime(startOfDay(startOfMonth(new Date()))),
									ends_at: formatDatetime(endOfDay(endOfMonth(new Date()))),
								};
								if (view === "day") {
									filterRef.current.starts_at = formatDatetime(startOfDay(new Date()));
									filterRef.current.ends_at = formatDatetime(endOfDay(new Date()));
								}
								getList();
								setCalendarView(view);
							}}
							view={calendarView}
							views={{
								month: true,
								day: true,
							}}
						/>
					</Card>
				)}
			</div>
		</>
	);
}
