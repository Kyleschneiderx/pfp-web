"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION, CONFIRM_INVITE_DESCRIPTION, PERMISSIONS } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal, getLastLoginStatus } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { PatientModel } from "@/app/models/patient_model";
import { deletePatient, sendInvite, exportPatients } from "@/app/services/client_side/patients";
import type { ExportResponse } from "@/app/services/client_side/patients";
import { useActionMenuStore } from "@/app/store/store";
import clsx from "clsx";
import { EllipsisVertical, Mail, PhoneCall, Download } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "../elements/Card";
import ConfirmModal from "../elements/ConfirmModal";
import Loader from "../elements/Loader";
import ActionMenuMobile from "../elements/mobile/ActionMenuMobile";
import { fetchPatients } from "./actions";
import PatientAction from "./patient-action";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { IconSend } from "@tabler/icons-react";
import { useModal } from "@/app/contexts/ModalContext";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import SearchCmp from "../elements/SearchCmp";
import PatientFilterSort from "./patient-filter-sort";
import Link from "next/link";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import DataList from "../data-list";

export default function PatientList({
	search,
	sort,
	status_id,
	initialList,
	maxPage,
}: {
	search: string;
	sort: string;
	status_id: string;
	initialList: PatientModel[] | [];
	maxPage: number;
}) {
	const modal = useModal();
	const router = useRouter();
	const { hasPermission } = useAuth();

	const [patients, setPatients] = useState(initialList);
	const [page, setPage] = useState(1);
	const [ref, inView] = useInView();
	const [isExporting, setIsExporting] = useState(false);

	const { showSnackBar } = useSnackBar();

	const loadMorePatients = async () => {
		const next = page + 1;
		const { patientList } = await fetchPatients({
			page: next,
			search,
			sort,
			status_id,
		});
		if (patientList.length) {
			setPage(next);
			setPatients((prev: PatientModel[]) => [...(prev?.length ? prev : []), ...patientList]);
		}
	};

	useEffect(() => {
		if (inView && page < maxPage) {
			loadMorePatients();
		}
	}, [inView]);

	useEffect(() => {
		setPatients(initialList);
		setPage(1);
	}, [sort, search, status_id, initialList]);

	const handleSendInvite = (patient: PatientModel) => {
		modal.open({
			type: "confirm",
			title: "Send Invitation",
			message: "Are you you want to send invitation to this patient?",
			onConfirm: async () => {
				try {
					await sendInvite(patient!.id);

					await revalidatePage("/patients");

					showSnackBar({
						message: "Invitation successfully sent.",
						success: true,
					});

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
			message: "Are you you want to delete this patient?",
			onConfirm: async () => {
				try {
					await deletePatient(patient.id);
					await revalidatePage("/patients");

					showSnackBar({
						message: "Patient successfully deleted.",
						success: true,
					});

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

			showSnackBar({
				message: "Patients exported successfully.",
				success: true,
			});
		} catch (error) {
			const apiError = error as ErrorModel;
			if (apiError?.msg) {
				showSnackBar({ message: apiError.msg, success: false });
			} else {
				showSnackBar({ message: "Failed to export patients.", success: false });
			}
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<DataList
			data={patients}
			header={
				<div className="flex items-center mb-8">
					<SearchCmp placeholder="Search patients" className="mr-4 sm:mr-0" param="search" />
					<PatientFilterSort />
					<div className="ml-auto flex items-center gap-3">
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
							{isExporting ? (
								<Loader className="text-primary-500" />
							) : (
								<Download size={20} className="text-primary-500" />
							)}
						</button>
						{hasPermission(PERMISSIONS.PATIENT_CREATE) && (
							<Link href="/patients/create">
								<Button label="Add Patients" showIcon className="hidden sm:flex" />
								<IconAddButton className="sm:hidden" />
							</Link>
						)}
					</div>
				</div>
			}
		>
			<div className="flex flex-wrap">
				{patients.map((patient) => (
					<Card key={patient.id} className="p-4 pr-3 w-[351px] flex mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<div className="w-16 h-16">
							<Image
								src={patient.user_profile.photo || "/images/avatar.png"}
								width={50}
								height={50}
								alt="Profile pic"
								quality={100}
								className="self-start w-[50px] h-[50px] rounded-full object-cover"
							/>
						</div>
						<div className="pl-4 pr-2 w-[300px]">
							<p className="text-lg font-semibold mb-1">{patient.user_profile.name}</p>
							<p
								className={clsx(
									"text-xs mb-1",
									getLastLoginStatus(patient.last_login_at ?? "") === "Active" ? "text-green-500" : "text-neutral-500",
								)}
							>
								{patient.status.value === "Inactive"
									? "Inactive"
									: patient.last_login_at
										? getLastLoginStatus(patient.last_login_at)
										: ""}
							</p>
							<div className="flex text-sm mb-1">
								<p className="mr-2 text-neutral-800 w-[90px] font-medium">Date of Birth</p>
								<p className="text-neutral-700">
									{patient.user_profile.birthdate ? formatDateToLocal(patient.user_profile.birthdate) : "N/A"}
								</p>
							</div>
							<div className="flex text-sm mb-1">
								<p className="mr-2 text-neutral-800 w-[90px] font-medium">Other info</p>
								<p
									className={clsx("font-medium", {
										"text-primary-500": patient.user_type.value === "Premium",
									})}
								>
									{patient.user_type.value} User
								</p>
							</div>
							<hr className="my-3" />
							<div className="text-neutral-700 text-sm">
								<div className="flex space-x-2 items-center mb-1">
									<PhoneCall size={14} />
									<p>{patient.user_profile.contact_number === "" ? "N/A" : patient.user_profile.contact_number}</p>
								</div>
								<div className="flex space-x-2 items-center">
									<Mail size={14} />
									<p className="break-all">{patient.email}</p>
								</div>
							</div>
						</div>
						{hasPermission([PERMISSIONS.PATIENT_EDIT, PERMISSIONS.PATIENT_DELETE, PERMISSIONS.PATIENT_INVITE]) && (
							<ResponsiveActionMenu
								title={patient.user_profile.name}
								className="cursor-pointer"
								onEdit={
									hasPermission(PERMISSIONS.PATIENT_EDIT)
										? () => router.push(`/patients/${patient.id}/edit`)
										: undefined
								}
								onDelete={hasPermission(PERMISSIONS.PATIENT_DELETE) ? () => handleDeletePatient(patient) : undefined}
								customActions={[
									...(hasPermission(PERMISSIONS.PATIENT_INVITE) && patient.can_invite
										? [
												{
													label: "Send Invite",
													icon: <IconSend size={16} />,
													onClick: () => handleSendInvite(patient),
												},
											]
										: []),
								]}
							/>
						)}
					</Card>
				))}
			</div>
			{page < maxPage && (
				<div ref={ref} className="flex justify-center mt-5">
					<Loader />
					<span>Loading...</span>
				</div>
			)}
		</DataList>
	);
}
