"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import type { PaginationModel, List } from "@/app/models/global_model";
import Image from "next/image";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/contexts/ModalContext";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import { IconKey, IconLicense, IconLogin2, IconMail, IconSquarePlus, IconUserScan } from "@tabler/icons-react";
import type { Account } from "@/app/models/accounts";
import { formatDateToLocal } from "@/app/lib/utils";
import { deleteAccount } from "@/app/services/client_side/accounts";
import ChangePasswordModal from "../modals/change-password-modal";
import { ROLES } from "@/app/lib/constants";
import PermissionModal from "../modals/permission-modal";
import { getRolePermissions } from "@/app/services/client_side/selections";

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
		}
	};

	return (
		<>
			<div className="flex flex-wrap">
				{Object.keys(ROLES)
					.filter((role) => ![ROLES.ADMIN, ROLES.USER].includes(ROLES[role as keyof typeof ROLES]))
					.map((role) => {
						const roleId = ROLES[role as keyof typeof ROLES];
						return (
							<Card key={roleId} className="p-2 w-[351px] flex mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
								<div className="!p-0 w-full flex">
									<div className="flex flex-col space-y-2 flex-grow">
										<div className="flex flex-col flex-grow">
											<div className="flex items-center">
												<p className="text-lg font-semibold mr-auto">{role}</p>
												<ResponsiveActionMenu
													title={role}
													className="-mr-2"
													customActions={[
														{
															label: "Permission",
															icon: <IconLicense width={18} />,
															onClick: async () => handleEditPermission(roleId),
														},
													]}
												/>
											</div>
										</div>
									</div>
								</div>
							</Card>
						);
					})}
			</div>
		</>
	);
}
