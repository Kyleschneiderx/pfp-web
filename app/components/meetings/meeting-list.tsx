"use client";

import type { ErrorModel } from "@/app/models/error_model";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "../elements/Card";
import Loader from "../elements/Loader";
import { useModal } from "@/app/contexts/ModalContext";
import Button from "../elements/Button";
import type { List, PaginationModel } from "@/app/models/global_model";
import { DEFAULT_LIST, PAGE_ITEMS, STATUSES } from "@/app/lib/constants";
import { getMeetingList } from "./actions";
import clsx from "clsx";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";
import Badge from "../elements/Badge";
import { endOfDay, endOfMonth, format, formatDuration, intervalToDuration, startOfDay, startOfMonth } from "date-fns";
import {
	BookXIcon,
	CalendarIcon,
	ClockIcon,
	HeadsetIcon,
	ListIcon,
	MailIcon,
	NotepadTextIcon,
	StethoscopeIcon,
	TextQuoteIcon,
	UserIcon,
} from "lucide-react";
import type { Meeting } from "@/app/models/meeting_model";
import type { MeetingsSearchQuery } from "@/app/services/server_side/meetings";
import BigCalendar from "../elements/BigCalendar";
import type { Event, EventProps, View } from "react-big-calendar";
import CalendarEventModal from "../modals/calendar-event-modal";
import { dateToUtc, formatDatetime } from "@/app/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/Tabs";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { usePathname, useRouter } from "next/navigation";
import MeetingRoomSidePanel from "../modals/meeting-room-side-panel";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { cancelMeeting } from "@/app/services/client_side/meetings";
import { revalidatePage } from "@/app/lib/revalidate";

const FilterList = dynamic(() => import("../elements/FilterList"), {
	ssr: false,
});

export default function MeetingList({
	meetingList,
	searchParams,
}: { meetingList: List<Meeting>; searchParams?: MeetingsSearchQuery }) {
	const modal = useModal();
	const { showSnackBar } = useSnackBar();
	const [meetings, setMeetings] = useState<Meeting[]>(meetingList.data);
	const [pagination, setPagination] = useState<PaginationModel>(() => {
		const { data, ...metadata } = meetingList;

		return metadata;
	});
	const [ref, inView] = useInView();
	const pathname = usePathname();
	const router = useRouter();

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
			const params = new URLSearchParams(searchParams ?? {});

			params.set(key, value!);

			router.replace(`${pathname}?${params.toString()}`);
		},
		200,
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

	const handleStartNote = (meeting: Meeting) => {
		modal.close();
		modal.open({
			type: "panel",
			overlay: false,
			className: "!p-0",
			component: ({ close }) => <MeetingRoomSidePanel meeting={meeting} onClose={close} />,
		});
	};

	const handleEnterVisit = (meeting: Meeting) => {
		window.open(`/telehealth/${meeting.slug}`, "_blank");
	};

	const handleViewPatient = (meeting: Meeting) => {
		window.open(`/patients/${meeting.user_id}/edit`, "_blank");
	};

	const handleCancelMeeting = (meeting: Meeting) => {
		modal.open({
			type: "confirm",
			title: "Cancel Upcoming Meeting",
			message: "Are you sure you want to cancel this upcoming meeting?",
			onConfirm: async () => {
				try {
					const respone = await cancelMeeting(meeting.id!);

					modal.closeAll();

					revalidatePage("/telehealth");
				} catch (e) {
					const error = e as ErrorModel;

					showSnackBar({
						success: false,
						message: error.msg,
					});
				}
			},
		});
	};

	const handleChangeTab = (value: string) => {
		const params = new URLSearchParams(searchParams ?? {});
		params.set("status_id", value);
		router.replace(`${pathname}?${params.toString()}`);
	};

	return (
		<>
			<div className="grid gap-y-3">
				<div className="flex items-center mb-5">
					<FilterList
						searchPlaceholder="Search meetings"
						searchValue={searchParams?.search}
						onSearch={(string) => handleFilter("search", string)}
						// sort={{
						// 	label: "Sort",
						// 	content: () => {
						// 		return (
						// 			<div className="flex flex-col space-y-3 p-3 text-sm font-semibold">
						// 				<label className="flex items-center cursor-pointer">
						// 					<input
						// 						type="checkbox"
						// 						checked={filterRef.current.sort?.includes("starts_at:DESC") ?? true}
						// 						onChange={() => handleFilter("sort", ["starts_at:DESC"])}
						// 						className="mr-2 cursor-pointer"
						// 					/>
						// 					Upcoming
						// 				</label>
						// 				<label className="flex items-center cursor-pointer">
						// 					<input
						// 						type="checkbox"
						// 						checked={filterRef.current.sort?.includes("starts_at:ASC") ?? false}
						// 						onChange={() => handleFilter("sort", ["starts_at:ASC"])}
						// 						className="mr-2 cursor-pointer"
						// 					/>
						// 					Past
						// 				</label>
						// 			</div>
						// 		);
						// 	},
						// }}
						className="mr-4 sm:mr-0"
					/>
				</div>
				<Tabs defaultValue={searchParams?.status_id ?? "6"} onValueChange={handleChangeTab}>
					<TabsList className="mb-3">
						<TabsTrigger value="6">Upcoming</TabsTrigger>
						<TabsTrigger value="7">Incomplete</TabsTrigger>
						<TabsTrigger value="8">History</TabsTrigger>
					</TabsList>
					<TabsContent value={searchParams?.status_id ?? "6"}>
						{!meetings.length ? (
							<div className="col-span-12 text-center">
								<p className="text-center mx-auto mt-[300px]">No records found.</p>
							</div>
						) : (
							<div className="grid grid-cols-12 col-span-12 gap-5">
								{meetings?.map((meeting) => {
									return (
										<Card key={meeting.id} className="p-4 pr-3 text-neutral-900 col-span-12">
											<div
												className="flex flex-row items-center mb-3"
												// onClick={() => handleSelectEvent(meeting)}
												onKeyDown={undefined}
											>
												<div className="flex flex-col mr-auto mb-1 text-neutral-900">
													<div className="flex flex-row items-center w-full space-x-3">
														<p className="text-lg font-semibold flex-grow">{meeting?.user_profile?.name}</p>
														<div className="flex flex-row items-center">
															<Badge
																label={meeting.status.value}
																className="text-white !bg-primary-500 !py-1 capitalize"
															/>
															<ResponsiveActionMenu
																title={meeting?.user_profile?.name}
																customActions={[
																	{
																		label: "View Patient",
																		icon: <UserIcon className="mr-2 h-4 w-4" />,
																		onClick: () => {
																			handleViewPatient(meeting);
																		},
																	},
																	...(meeting.status_id !== STATUSES.COMPLETE
																		? [
																				{
																					label: "Enter Visit",
																					icon: <StethoscopeIcon className="mr-2 h-4 w-4" />,
																					onClick: () => {
																						handleEnterVisit(meeting);
																					},
																				},
																			]
																		: []),
																	{
																		label: "Start Note",
																		icon: <NotepadTextIcon className="mr-2 h-4 w-4" />,
																		onClick: () => {
																			handleStartNote(meeting);
																		},
																	},
																	...(meeting.status_id === STATUSES.UPCOMING
																		? [
																				{
																					label: "Cancel",
																					className: "!text-error-400",
																					icon: <BookXIcon className="mr-2 h-4 w-4" />,
																					onClick: () => {
																						handleCancelMeeting(meeting);
																					},
																				},
																			]
																		: []),
																]}
															/>
														</div>
													</div>
													<div className="flex flex-col mt-3 space-y-2 text-sm">
														<div className="flex flex-row items-center space-x-3">
															<CalendarIcon className="w-5 h-5 flex-shrink-0" />
															<div className="flex flex-row items-center space-x-1">
																<p>{format(new Date(meeting?.starts_at ?? ""), "EEEE, MMMM d")}</p>
															</div>
														</div>
														<div className="flex flex-row items-center space-x-3">
															<ClockIcon className="w-5 h-5 flex-shrink-0" />
															<div className="flex flex-row items-center space-x-1">
																<p>{format(new Date(meeting?.starts_at ?? ""), "hh:mm aa")}</p>
																<p>{"-"}</p>
																<p>{format(new Date(meeting?.ends_at ?? ""), "hh:mm aa")}</p>
															</div>
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
						)}
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}
