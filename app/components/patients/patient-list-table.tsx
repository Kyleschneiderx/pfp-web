"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { PERMISSIONS } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal, getLastLoginStatus } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { PatientModel } from "@/app/models/patient_model";
import { deletePatient, sendInvite, exportPatients } from "@/app/services/client_side/patients";
import type { ExportResponse } from "@/app/services/client_side/patients";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import clsx from "clsx";
import { Download, EllipsisIcon, EllipsisVertical, Mail, PhoneCall } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { IconSend } from "@tabler/icons-react";
import { useModal } from "@/app/contexts/ModalContext";
import useAuth from "@/app/hooks/useAuth";
import Button from "../elements/Button";
import DataTable, { type Column } from "../elements/DataTable";
import Input from "../elements/Input";
import Loader from "../elements/Loader";
import Pagination from "../elements/Pagination";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import IconAddButton from "../elements/mobile/IconAddButton";

const STATUS_OPTIONS = [
	{ label: "All", value: "0" },
	{ label: "Active", value: "1" },
	{ label: "Inactive", value: "2" },
];

const SORT_OPTIONS = [
	{ label: "Name A-Z", value: "name:ASC" },
	{ label: "Name Z-A", value: "name:DESC" },
	{ label: "Latest Login", value: "last_login_at:DESC" },
	{ label: "Oldest Login", value: "last_login_at:ASC" },
];

export default function PatientListTable({
	initialList,
	initialPage,
	maxPage,
	search,
	sort,
	status_id,
}: {
	initialList: PatientModel[];
	initialPage: number;
	maxPage: number;
	search: string;
	sort: string;
	status_id: string;
}) {
	const modal = useModal();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { hasPermission } = useAuth();
	const { showSnackBar } = useSnackBar();

	const [patients, setPatients] = useState(initialList);
	const [page, setPage] = useState(initialPage);
	const [isPending, startTransition] = useTransition();
	const [isExporting, setIsExporting] = useState(false);
	const [searchInput, setSearchInput] = useState(search);
	const filterRef = useRef<HTMLDivElement>(null);

	const updateParams = useCallback(
		(updates: Record<string, string>) => {
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

	const handleSortChange = (value: string) => {
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
							: "—"}
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
			header: "Contact",
			accessor: (row) => (
				<div className="flex flex-col gap-0.5 text-sm">
					<span className="flex items-center gap-1">
						<PhoneCall size={12} />
						{row.user_profile.contact_number || "N/A"}
					</span>
					<span className="flex items-center gap-1">
						<Mail size={12} />
						<span className="truncate max-w-[180px]">{row.email}</span>
					</span>
				</div>
			),
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
				<div className="flex items-center gap-4">
					<Link href="/patients" className="text-sm text-primary-600 hover:text-primary-700">
						← Back to card view
					</Link>
					<span className="text-sm text-neutral-500">|</span>
					<span className="text-sm text-neutral-600">Table view (preview)</span>
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
						/>
					</>
				)}
			</div>
		</div>
	);
}
