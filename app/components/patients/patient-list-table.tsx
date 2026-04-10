"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { PERMISSIONS } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDate, formatDateToLocal, getLastLoginStatus } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { PatientModel } from "@/app/models/patient_model";
import {
	deletePatient,
	sendInvite,
	exportPatients,
	getUserSummary,
	getInvitedSummary,
} from "@/app/services/client_side/patients";
import type { ExportResponse } from "@/app/services/client_side/patients";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import clsx from "clsx";
import { CalendarDays, Download, EllipsisIcon, MessageCircle, Send, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { IconClipboardCheck, IconMailFast, IconSend, IconUserPlus, IconUsersGroup } from "@tabler/icons-react";
import { useModal } from "@/app/contexts/ModalContext";
import useAuth from "@/app/hooks/useAuth";
import Button from "../elements/Button";
import DataTable, { type Column } from "../elements/DataTable";
import Loader from "../elements/Loader";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import IconAddButton from "../elements/mobile/IconAddButton";
import { endOfWeek, startOfWeek } from "date-fns";
import type { InvitedSummaryModel, UserSummaryModel } from "@/app/models/user_summary_model";
import AccessControl from "../access-control";
import AccessLocked from "../access-locked";
import UserDoughnutChart from "../dashboard/user-doughnut-chart";
import Card from "../elements/Card";
import UserLineChart from "../dashboard/user-line-chart";
import { formatNumber } from "@/app/lib/number-format";

const STATUS_OPTIONS = [
	{ label: "All", value: "0" },
	{ label: "Active", value: "1" },
	{ label: "Inactive", value: "2" },
];

const TYPE_OPTIONS = [
	{ label: "All", value: "0" },
	{ label: "Premium", value: "2" },
	{ label: "Free", value: "1" },
];

export default function PatientListTable({
	initialList,
	initialPage,
	maxPage,
	search,
	sort,
	status_id,
	type_id,
}: {
	initialList: PatientModel[];
	initialPage: number;
	maxPage: number;
	search: string;
	sort: string;
	status_id: string;
	type_id: string;
}) {
	const modal = useModal();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort")?.split(":") ?? undefined;
	const { hasPermission } = useAuth();
	const { showSnackBar } = useSnackBar();

	const [patients, setPatients] = useState(initialList);
	const [page, setPage] = useState(initialPage);
	const [isPending, startTransition] = useTransition();
	const [isExporting, setIsExporting] = useState(false);
	const [searchInput, setSearchInput] = useState(search);
	const [userSummary, setUserSummary] = useState<UserSummaryModel | null>(null);
	const [invitedSummary, setInvitedSummary] = useState<InvitedSummaryModel | null>(null);

	const updateParams = useCallback(
		(updates: Record<string, string | undefined>) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (value && value !== "0") {
					params.set(key, value);
				} else {
					params.delete(key);
				}
			}
			params.delete("page");
			router.replace(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams],
	);

	const handleSearch = useDebouncedCallback((term: string) => {
		updateParams({ search: term });
	}, 300);

	const handleStatusChange = (value: string) => {
		updateParams({ status_id: value });
	};

	const handleTypeChange = (value: string) => {
		updateParams({ type_id: value });
	};

	const handleSortChange = (value: string | undefined) => {
		updateParams({ sort: value });
	};

	const handlePageChange = (newPage: number) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("page", String(newPage));
			router.replace(`${pathname}?${params.toString()}`);
		});
	};

	useEffect(() => {
		setPatients(initialList);
		setPage(initialPage);
	}, [initialList, initialPage]);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	const fetchUserSummary = async () => {
		const params = `period=weekly&date_from=${formatDate(startOfWeek(new Date()))}&date_to=${formatDate(endOfWeek(new Date()))}`;
		const response = await getUserSummary(params);
		setUserSummary(response);
	};

	const fetchInvitedSummary = async () => {
		const params = `period=weekly&date_from=${formatDate(startOfWeek(new Date()))}&date_to=${formatDate(endOfWeek(new Date()))}`;
		const response = await getInvitedSummary(params);
		setInvitedSummary(response);
	};

	useEffect(() => {
		fetchUserSummary();
		fetchInvitedSummary();
	}, []);

	const handleSendInvite = (patient: PatientModel) => {
		modal.open({
			type: "confirm",
			title: "Send Invitation",
			message: "Are you sure you want to send invitation to this patient?",
			onConfirm: async () => {
				try {
					await sendInvite(patient.id);
					await revalidatePage("/patients");
					showSnackBar({ message: "Invitation successfully sent.", success: true });
					modal.closeAll();
				} catch (error) {
					const apiError = error as ErrorModel;
					if (apiError?.msg) {
						showSnackBar({ message: apiError.msg, success: false });
					}
				}
			},
		});
	};

	const handleDeletePatient = (patient: PatientModel) => {
		modal.open({
			type: "confirm",
			title: "Delete Patient",
			message: "Are you sure you want to delete this patient?",
			onConfirm: async () => {
				try {
					await deletePatient(patient.id);
					await revalidatePage("/patients");
					showSnackBar({ message: "Patient successfully deleted.", success: true });
					modal.closeAll();
				} catch (error) {
					const apiError = error as ErrorModel;
					if (apiError?.msg) {
						showSnackBar({ message: apiError.msg, success: false });
					}
				}
			},
		});
	};

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const params = `&search=${search}${
				!["0", ""].includes(status_id ?? "") ? `&status_id[]=${status_id}` : ""
			}&sort[]=${sort}`;
			const exportResponse: ExportResponse = await exportPatients(params);
			const response = await fetch(exportResponse.url);
			const blob = await response.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = exportResponse.fileName;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(blobUrl);
			showSnackBar({ message: "Patients exported successfully.", success: true });
		} catch (error) {
			const apiError = error as ErrorModel;
			showSnackBar({ message: apiError?.msg || "Failed to export patients.", success: false });
		} finally {
			setIsExporting(false);
		}
	};

	const columns: Column<PatientModel>[] = [
		{
			header: "Patient",
			onSort: (field, direction) => handleSortChange(direction ? `${field}:${direction}` : undefined),
			currentSortField: currentSort?.[0],
			sortDirection: currentSort?.[0] === "name" ? currentSort?.[1] : undefined,
			sortField: "name",
			accessor: (row) => (
				<Link href={`/patients/${row.id}/edit`} className="flex items-center gap-3">
					<div className="flex items-center gap-3">
						<Image
							src={row.user_profile.photo || "/images/avatar.png"}
							width={40}
							height={40}
							alt=""
							className="w-10 h-10 rounded-full object-cover shrink-0"
						/>
						<div>
							<p className="font-medium text-primary-500">{row.user_profile.name}</p>
							<p className="text-xs text-neutral-500">{row.email}</p>
						</div>
					</div>
				</Link>
			),
		},
		{
			header: "Status",
			accessor: (row) => (
				<span
					className={clsx(
						"text-sm",
						getLastLoginStatus(row.last_login_at ?? "") === "Active" ? "text-green-600" : "text-neutral-500",
					)}
				>
					{row.status.value === "Inactive"
						? "Inactive"
						: row.last_login_at
							? getLastLoginStatus(row.last_login_at)
							: "Active"}
				</span>
			),
		},
		{
			header: "Date of Birth",
			accessor: (row) => (row.user_profile.birthdate ? formatDateToLocal(row.user_profile.birthdate) : "N/A"),
		},
		{
			header: "User Type",
			accessor: (row) => (
				<span className={clsx(row.user_type.value === "Premium" && "text-primary-500 font-medium")}>
					{row.user_type.value}
				</span>
			),
		},
		{
			header: "Provider",
			accessor: (row) =>
				row.provider ? (
					<div className="flex flex-col">
						<p className="font-medium text-primary-500">{row.provider.user_profile.name}</p>
						<p className="text-xs text-neutral-500">{row.provider.email}</p>
					</div>
				) : (
					"N/A"
				),
		},
		{
			header: "Last Login",
			onSort: (field, direction) => handleSortChange(direction ? `${field}:${direction}` : undefined),
			currentSortField: currentSort?.[0],
			sortDirection: currentSort?.[0] === "last_login_at" ? currentSort?.[1] : undefined,
			sortField: "last_login_at",
			accessor: (row) => formatDateToLocal(row.last_login_at ?? ""),
		},
		{
			header: "Registered Date",
			onSort: (field, direction) => handleSortChange(direction ? `${field}:${direction}` : undefined),
			currentSortField: currentSort?.[0],
			sortDirection: currentSort?.[0] === "id" ? currentSort?.[1] : undefined,
			sortField: "id",
			accessor: (row) => formatDateToLocal(row.created_at ?? ""),
		},
		{
			header: "",
			accessor: (row) =>
				hasPermission([PERMISSIONS.PATIENT_EDIT, PERMISSIONS.PATIENT_DELETE, PERMISSIONS.PATIENT_INVITE]) ? (
					<ResponsiveActionMenu
						icon={
							<EllipsisIcon
								size={24}
								className="border border-primary-500 bg-primary-500 rounded-full p-1 text-white font-bold hover:bg-primary-600"
							/>
						}
						title={row.user_profile.name}
						className="cursor-pointer"
						onEdit={hasPermission(PERMISSIONS.PATIENT_EDIT) ? () => router.push(`/patients/${row.id}/edit`) : undefined}
						onDelete={hasPermission(PERMISSIONS.PATIENT_DELETE) ? () => handleDeletePatient(row) : undefined}
						customActions={
							hasPermission(PERMISSIONS.PATIENT_INVITE) && row.can_invite
								? [
										{
											label: "Send Invite",
											icon: <IconSend size={16} />,
											onClick: () => handleSendInvite(row),
										},
									]
								: []
						}
					/>
				) : null,
			className: "w-12",
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-lg font-semibold text-neutral-900">Patients</span>
					<p className="text-sm text-neutral-500 max-w-[700px]">
						Manage and track patient information, including contact details, status, and PF plans.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						label="Export"
						icon={<Download size={18} className="mr-2" />}
						onClick={handleExport}
						isProcessing={isExporting}
						className="hidden sm:flex"
						secondary
					/>
					<button
						type="button"
						onClick={handleExport}
						disabled={isExporting}
						className="sm:hidden bg-white active:bg-neutral-100 p-2 rounded-full drop-shadow"
						aria-label="Export patients"
					>
						{isExporting ? <Loader className="text-primary-500" /> : <Download size={20} />}
					</button>
					{hasPermission(PERMISSIONS.PATIENT_CREATE) && (
						<Link href="/patients/create">
							<Button label="Add Patients" showIcon className="hidden sm:flex" />
							<IconAddButton className="sm:hidden" />
						</Link>
					)}
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
				<div className="flex flex-col w-full">
					<AccessControl
						required={[PERMISSIONS.STATS_USERS]}
						fallback={<AccessLocked title="Total" className="h-[110px]" />}
					>
						<Card className="">
							<div className="flex flex-row items-start justify-between gap-2">
								<div className="flex flex-col items-start">
									<p className="text-xl font-bold text-neutral-900">Total</p>
									<p className="text-lg font-semibold">{formatNumber(userSummary?.total_users ?? 0)}</p>
								</div>
								<div className="flex self-center items-center rounded-full bg-primary-500 p-2">
									<IconUsersGroup size={32} className="text-white my-auto" />
								</div>
							</div>
							<div className="flex flex-col items-start text-xs text-neutral-500">
								<p>{formatNumber(userSummary?.total_users_by_type.premium ?? 0)} Premium</p>
								<p>{formatNumber(userSummary?.total_users_by_type.free ?? 0)} Free</p>
							</div>
						</Card>
					</AccessControl>
				</div>
				<div className="flex flex-col w-full">
					<AccessControl
						required={[PERMISSIONS.STATS_DAILY_SIGNUPS]}
						fallback={<AccessLocked title="Daily Sign-ups" className="h-[110px]" />}
					>
						<Card className="">
							<div className="flex flex-row items-start justify-between gap-2">
								<div className="flex flex-col items-start">
									<p className="text-xl font-bold text-neutral-900">Daily Signups</p>
									<p className="text-lg font-semibold">{formatNumber(userSummary?.unique_signups.total ?? 0)}</p>
								</div>
								<div className="flex self-center items-center rounded-full bg-primary-500 p-2">
									<IconUserPlus size={32} className="text-white my-auto" />
								</div>
							</div>
							<div className="flex flex-col items-start text-xs text-neutral-500">
								<p>{formatNumber(userSummary?.unique_signups.premium ?? 0)} Premium</p>
								<p>{formatNumber(userSummary?.unique_signups.free ?? 0)} Free</p>
							</div>
						</Card>
					</AccessControl>
				</div>
				<div className="flex flex-col w-full">
					<AccessControl
						required={[PERMISSIONS.STATS_INVITED]}
						fallback={<AccessLocked title="Invited" className="h-[110px]" />}
					>
						<Card className="">
							<div className="flex flex-row items-start justify-between gap-2">
								<div className="flex flex-col items-start">
									<p className="text-xl font-bold text-neutral-900">Invited</p>
									<p className="text-lg font-semibold">{formatNumber(invitedSummary?.total_invites ?? 0)}</p>
								</div>
								<div className="flex self-center items-center rounded-full bg-primary-500 p-2">
									<IconMailFast size={32} className="text-white my-auto" />
								</div>
							</div>
							<div className="flex flex-col items-start text-xs text-neutral-500">
								<p>{formatNumber(invitedSummary?.onboarded.total ?? 0)} Onboarded</p>
								<p>{formatNumber(invitedSummary?.not_onboarded.total ?? 0)} Not Onboarded</p>
							</div>
						</Card>
					</AccessControl>
				</div>
			</div>

			<div className="">
				{isPending ? (
					<div className="flex justify-center py-16">
						<Loader />
					</div>
				) : (
					<>
						<DataTable
							columns={columns}
							data={patients}
							emptyMessage={
								!patients.length ? "No patients found" : !patients.length ? "No patients match your search" : undefined
							}
							getRowKey={(row) => row.id}
							size="md"
							searchPlaceholder="Search patients..."
							searchValue={searchInput}
							onSearch={(v) => {
								setSearchInput(v);
								handleSearch(v);
							}}
							maxPage={maxPage}
							page={page}
							onPageChange={handlePageChange}
							filters={{
								status_id: {
									options: STATUS_OPTIONS,
									selectedValue: status_id,
									placeholder: "Status",
									onChange: handleStatusChange,
								},
								type_id: {
									options: TYPE_OPTIONS,
									selectedValue: type_id,
									placeholder: "Type",
									onChange: handleTypeChange,
								},
							}}
						/>
					</>
				)}
			</div>
		</div>
	);
}
