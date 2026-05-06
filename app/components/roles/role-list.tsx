"use client";

import { useModal } from "@/app/contexts/ModalContext";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { ROLES } from "@/app/lib/constants";
import type { ErrorModel } from "@/app/models/error_model";
import { getRolePermissions } from "@/app/services/client_side/selections";
import { IconLicense } from "@tabler/icons-react";
import { EllipsisIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable, { type Column } from "../elements/DataTable";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import PermissionModal from "../modals/permission-modal";

export default function RoleList() {
	const router = useRouter();
	const modal = useModal();

	const { showSnackBar } = useSnackBar();

	const handleEditPermission = async (roleId: number) => {
		try {
			const rolePermissions = await getRolePermissions(roleId);
			modal.open({
				type: "default",
				allowClose: true,
				title: "Role Permission",
				className: "!min-w-[400px]",
				component: () => <PermissionModal roleId={roleId} settings={rolePermissions} />,
			});
		} catch (error) {
			const apiError = error as ErrorModel;
			showSnackBar({
				message: apiError?.msg ?? "Failed to load permissions.",
				success: false,
			});
		}
	};

	const roles = Object.keys(ROLES)
		.filter((role) => ![ROLES.ADMIN, ROLES.USER].includes(ROLES[role as keyof typeof ROLES]))
		.map((role) => ({
			role,
			roleId: ROLES[role as keyof typeof ROLES],
		}));

	const columns: Column<(typeof roles)[number]>[] = [
		{
			header: "Role",
			accessor: (row) => <span className="font-medium text-neutral-900">{row.role}</span>,
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex justify-end">
					<ResponsiveActionMenu
						icon={
							<EllipsisIcon
								size={24}
								className="border border-primary-500 bg-primary-500 rounded-full p-1 text-white font-bold hover:bg-primary-600"
							/>
						}
						title={row.role}
						customActions={[
							{
								label: "Permission",
								icon: <IconLicense width={18} />,
								onClick: async () => handleEditPermission(row.roleId),
							},
						]}
					/>
				</div>
			),
			className: "w-[80px]",
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-lg font-semibold text-neutral-900">Roles</span>
					<p className="text-sm text-neutral-500 max-w-[700px]">View roles and manage role permissions.</p>
				</div>
			</div>
			<DataTable
				columns={columns}
				data={roles}
				getRowKey={(row) => row.roleId}
				emptyMessage="No roles found."
				page={1}
				maxPage={1}
				onPageChange={() => {}}
			/>
		</div>
	);
}
