"use client";

import Button from "@/app/components/elements/Button";
import DataTable, { type Column } from "@/app/components/elements/DataTable";
import Loader from "@/app/components/elements/Loader";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
import ResponsiveActionMenu from "@/app/components/elements/ResponsiveActionMenu";
import { useModal } from "@/app/contexts/ModalContext";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { DAYS_OF_WEEK } from "@/app/lib/constants";
import { formatScheduleDateRangeList, hasCustomDateRange } from "@/app/lib/schedule-dates";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal, timeToDate } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { Schedule } from "@/app/models/schedules";
import { deleteSchedule } from "@/app/services/client_side/schedules";
import clsx from "clsx";
import { EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import Tooltip from "../elements/Tooltip";
import { format, parseISO } from "date-fns";

type ScheduleListRow = Schedule & {
	dateStart?: string | null;
	dateEnd?: string | null;
};

function getScheduleTypeLabel(schedule: ScheduleListRow): "Everyday" | "Custom" {
	return hasCustomDateRange(schedule) ? "Custom" : "Everyday";
}

function ScheduleAvailabilityBadges({ schedule }: { schedule: Schedule }) {
	const availabilities = schedule.availabilities ?? [];
	return (
		<div className="flex flex-row items-center gap-2 flex-wrap max-w-[280px]">
			{DAYS_OF_WEEK.map((day, index) => {
				const dayNum = index + 1;
				const dayAvailability = availabilities.find((r) => r.day === dayNum);
				const unavailable = !dayAvailability?.starts_at && !dayAvailability?.ends_at;
				return (
					<Tooltip
						key={day}
						content={
							dayAvailability?.starts_at && dayAvailability?.ends_at
								? `${format(parseISO(timeToDate(dayAvailability.starts_at as string)), "hh:mm aa")} - ${format(parseISO(timeToDate(dayAvailability.ends_at as string)), "hh:mm aa")}`
								: "Unavailable"
						}
					>
						<div
							className={clsx(
								"w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0",
								unavailable ? "bg-neutral-300" : "bg-primary-500",
							)}
						>
							{day}
						</div>
					</Tooltip>
				);
			})}
		</div>
	);
}

export default function ScheduleList({
	initialList,
	initialPage,
	maxPage,
	sort: _sort,
}: {
	initialList: Schedule[];
	initialPage: number;
	maxPage: number;
	sort: string;
}) {
	const modal = useModal();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort")?.split(":") ?? undefined;
	const { showSnackBar } = useSnackBar();

	const [data, setData] = useState(initialList);
	const [page, setPage] = useState(initialPage);
	const [isPending, startTransition] = useTransition();

	const updateParams = useCallback(
		(updates: Record<string, string | undefined>) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (value) params.set(key, value);
				else params.delete(key);
			}
			params.delete("page");
			router.replace(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams],
	);

	const handleSortChange = useCallback(
		(sortValue: string | undefined) => {
			startTransition(() => updateParams({ sort: sortValue }));
		},
		[updateParams],
	);

	const handleDelete = (row: Schedule) => {
		if (row.id == null) return;
		modal.open({
			type: "confirm",
			title: "Delete Schedule",
			message: "Are you sure you want to remove this schedule?",
			onConfirm: async () => {
				try {
					await deleteSchedule(row.id!);
					await revalidatePage("/settings/schedules");
					modal.closeAll();
					setData((prev) => prev.filter((r) => r.id !== row.id));
					showSnackBar({
						message: "Schedule removed.",
						success: true,
					});
				} catch (e) {
					const error = e as ErrorModel;
					showSnackBar({
						message: error?.msg ?? "Failed to delete.",
						success: false,
					});
				}
			},
		});
	};

	const columns: Column<Schedule>[] = [
		{
			header: "Type",
			accessor: (row) => (
				<Link
					href={`/settings/schedules/${row.id}/edit`}
					className="text-sm text-primary-500 font-medium whitespace-nowrap"
				>
					{getScheduleTypeLabel(row)}
				</Link>
			),
		},
		{
			header: "Availabilities",
			accessor: (row) => <ScheduleAvailabilityBadges schedule={row} />,
		},
		{
			header: "Date Range",
			accessor: (row) => <span className="text-sm">{formatScheduleDateRangeList(row)}</span>,
		},
		{
			header: "Timezone",
			accessor: (row) => <span className="text-sm">{row.timezone}</span>,
		},
		{
			header: "Active",
			accessor: (row) => (row.is_active ? "Yes" : "No"),
		},
		{
			header: "Updated",
			onSort: (field, direction) => handleSortChange(direction ? `${field}:${direction}` : undefined),
			currentSortField: currentSort?.[0],
			sortDirection: currentSort?.[0] === "updated_at" ? currentSort?.[1] : undefined,
			sortField: "updated_at",
			accessor: (row) => (row.updated_at ? formatDateToLocal(row.updated_at) : "—"),
		},
		{
			header: "",
			accessor: (row) => (
				<ResponsiveActionMenu
					icon={
						<EllipsisIcon
							size={24}
							className="border border-primary-500 bg-primary-500 rounded-full p-1 text-white font-bold hover:bg-primary-600"
						/>
					}
					title={row.description || "Schedule"}
					className="cursor-pointer"
					onEdit={() => router.push(`/settings/schedules/${row.id}/edit`)}
					onDelete={() => handleDelete(row)}
				/>
			),
			className: "w-12",
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Schedules</h1>
					<p className="text-sm text-neutral-600">Manage visit availability schedules.</p>
				</div>
				<Link href="/settings/schedules/create">
					<Button label="Add Schedule" showIcon className="hidden sm:flex" />
					<IconAddButton className="sm:hidden" />
				</Link>
			</div>

			{isPending && <Loader />}

			<DataTable
				columns={columns}
				getRowKey={(row) => row.id!}
				data={data}
				page={page}
				maxPage={maxPage}
				onPageChange={(p) => {
					const params = new URLSearchParams(searchParams.toString());
					params.set("page", String(p));
					router.replace(`${pathname}?${params.toString()}`);
				}}
			/>
		</div>
	);
}
