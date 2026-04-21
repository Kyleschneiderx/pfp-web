"use client";

import { useModal } from "@/app/contexts/ModalContext";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import useAuth from "@/app/hooks/useAuth";
import { DEFAULT_LIST, PAGE_ITEMS, PERMISSIONS, STATUSES } from "@/app/lib/constants";
import { formatNumber } from "@/app/lib/number-format";
import { revalidatePage } from "@/app/lib/revalidate";
import { dateToUtc, formatDate, formatDatetime } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { List, PaginationModel } from "@/app/models/global_model";
import type { Meeting } from "@/app/models/meeting_model";
import type { VisitPaymentStatsModel } from "@/app/models/visit_payment_stats_model";
import { cancelMeeting, getVisitPaymentSummary } from "@/app/services/client_side/meetings";
import type { MeetingsSearchQuery } from "@/app/services/server_side/meetings";
import {
	IconCalendar,
	IconCalendarCancel,
	IconCalendarCheck,
	IconCalendarPause,
	IconCalendarWeek,
	IconCurrencyDollar,
	IconUserCheck,
	IconUsersGroup,
} from "@tabler/icons-react";
import clsx from "clsx";
import {
	endOfDay,
	endOfMonth,
	endOfWeek,
	format,
	formatDuration,
	intervalToDuration,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from "date-fns";
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
import dynamic from "next/dynamic";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Event, EventProps, View } from "react-big-calendar";
import { useInView } from "react-intersection-observer";
import { useDebouncedCallback } from "use-debounce";
import AccessControl from "../access-control";
import AccessLocked from "../access-locked";
import DataList from "../data-list";
import Badge from "../elements/Badge";
import BigCalendar from "../elements/BigCalendar";
import Button from "../elements/Button";
import Card from "../elements/Card";
import Loader from "../elements/Loader";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/Tabs";
import CalendarEventModal from "../modals/calendar-event-modal";
import MeetingRoomSidePanel from "../modals/meeting-room-side-panel";
import { getMeetingList } from "./actions";

const FilterList = dynamic(() => import("../elements/FilterList"), {
	ssr: false,
});

export default function MeetingList({
	meetingList,
	searchParams,
}: { meetingList: List<Meeting>; searchParams?: MeetingsSearchQuery }) {
	const modal = useModal();
	const { hasPermission, isLoaded } = useAuth();

	if (isLoaded && !hasPermission(PERMISSIONS.VISIT_VIEW)) return notFound();

	const { showSnackBar } = useSnackBar();
	const [meetings, setMeetings] = useState<Meeting[]>(meetingList.data);
	const [pagination, setPagination] = useState<PaginationModel>(() => {
		const { data, ...metadata } = meetingList;

		return metadata;
	});
	const [ref, inView] = useInView();
	const pathname = usePathname();
	const router = useRouter();
	const [visitPaymentSummary, setVisitPaymentSummary] = useState<VisitPaymentStatsModel | null>(null);
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
			className: "!p-0 !max-w-[500px]",
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

	const [statsLoading, setStatsLoading] = useState(true);

	const fetchVisitPaymentSummary = async () => {
		const params = `period=weekly&date_from=${formatDate(startOfWeek(new Date()))}&date_to=${formatDate(endOfWeek(new Date()))}`;
		const response = await getVisitPaymentSummary(params);
		setVisitPaymentSummary(response);
		setStatsLoading(false);
	};

	useEffect(() => {
		fetchVisitPaymentSummary();
	}, []);

	const statCards = [
		{ label: "Total", value: formatNumber(visitPaymentSummary?.stats?.total_count ?? 0), Icon: IconCalendarWeek },
		{ label: "Upcoming", value: formatNumber(visitPaymentSummary?.stats?.upcoming ?? 0), Icon: IconCalendar },
		{ label: "Draft", value: formatNumber(visitPaymentSummary?.stats?.draft ?? 0), Icon: IconCalendarPause },
		{ label: "Canceled", value: formatNumber(visitPaymentSummary?.stats?.canceled ?? 0), Icon: IconCalendarCancel },
		{ label: "Complete", value: formatNumber(visitPaymentSummary?.stats?.complete ?? 0), Icon: IconCalendarCheck },
		{
			label: "Amount Paid",
			value: `$${formatNumber(visitPaymentSummary?.stats?.total_amount_paid ?? 0)}`,
			Icon: IconCurrencyDollar,
		},
	];

	return (
		<div className="grid gap-y-3">
			{statsLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
					{statCards.map((_, i) => (
						<AccessControl
							key={i}
							required={[PERMISSIONS.STATS_VISIT_PAYMENT]}
							fallback={<AccessLocked className="h-[88px]" />}
						>
							<Card className="animate-pulse">
								<div className="h-8 bg-neutral-200 rounded w-12" />
								<div className="h-4 bg-neutral-100 rounded w-24 mt-2" />
							</Card>
						</AccessControl>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
					{statCards.map((card) => {
						const Icon = card.Icon;
						return (
							<AccessControl
								key={card.label}
								required={[PERMISSIONS.STATS_VISIT_PAYMENT]}
								fallback={<AccessLocked className="min-h-[88px]" />}
							>
								<Card>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<p className="text-2xl font-bold text-neutral-900">{card.value}</p>
											<p className="text-sm text-neutral-600 mt-0.5">{card.label}</p>
										</div>
										<Icon className="size-8 shrink-0 text-primary-500" aria-hidden />
									</div>
								</Card>
							</AccessControl>
						);
					})}
				</div>
			)}
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
					<DataList data={meetings}>
						<div className="grid grid-cols-12 col-span-12 gap-5">
							{meetings?.map((meeting) => {
								return (
									<Card key={meeting.id} className="p-4 pr-3 text-neutral-900 col-span-12">
										<div className="flex flex-row items-center mb-3">
											<div className="flex flex-1 flex-col mr-auto mb-1 text-neutral-900">
												<div className="flex flex-row items-center w-full space-x-3">
													<div className="flex flex-row items-center space-x-3 flex-grow">
														<p className="text-lg font-semibold">{meeting?.user_profile?.name}</p>
														<div className="flex items-center space-x-1">
															<Badge
																label={meeting.status.value}
																className="text-white !bg-primary-500 !py-1 capitalize mr-auto"
															/>
															{meeting.has_patient_entered && (
																<Badge className="text-white !p-1 bg-white border border-primary-500 rounded-full capitalize mr-auto">
																	<IconUserCheck size={14} stroke={2} className="text-primary-500" />
																</Badge>
															)}
														</div>
													</div>
													<ResponsiveActionMenu
														title={meeting?.user_profile?.name}
														customActions={[
															...(hasPermission(PERMISSIONS.PATIENT_VIEW)
																? [
																		{
																			label: "View Patient",
																			icon: <UserIcon className="mr-2 h-4 w-4" />,
																			onClick: () => {
																				handleViewPatient(meeting);
																			},
																		},
																	]
																: []),
															...(hasPermission(PERMISSIONS.VISIT_CANCEL) && meeting.status_id === STATUSES.UPCOMING
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
														<p>{meeting.schedule?.description}</p>
													</div>
													<div className="flex flex-row space-x-3 items-center">
														<StethoscopeIcon className="w-5 h-5 flex-shrink-0 self-start" />
														<div className="flex items-center flex-wrap space-y-1  space-x-1">
															{meeting.soap_notes?.icd_codes ? (
																meeting.soap_notes?.icd_codes?.map((code, index) => (
																	<Badge key={`${code.code}-${index}`} className="!mr-0">
																		{code.code} - {code.name}
																	</Badge>
																))
															) : (
																<p>N/A</p>
															)}
														</div>
													</div>
													<div className="flex items-center w-full justify-end px-3">
														<div className="flex items-cemter space-x-3">
															{meeting.status_id !== STATUSES.COMPLETE && (
																<Button
																	label="Enter Visit"
																	onClick={() => {
																		handleEnterVisit(meeting);
																	}}
																/>
															)}
															{hasPermission([PERMISSIONS.VISIT_NOTE_VIEW, PERMISSIONS.VISIT_TRANSCRIPTION_VIEW]) && (
																<Button
																	label="Start Note"
																	outlined
																	onClick={() => {
																		handleStartNote(meeting);
																	}}
																/>
															)}
														</div>
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
					</DataList>
				</TabsContent>
			</Tabs>
		</div>
	);
}
