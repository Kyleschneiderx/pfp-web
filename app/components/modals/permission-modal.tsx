import { useEffect, useMemo, useState } from "react";
import type { ErrorModel } from "@/app/models/error_model";
import type { Account, AccountPermission } from "@/app/models/accounts";
import { updateAccountPermission } from "@/app/services/client_side/accounts";
import Switch from "../elements/Switch";
import { getSelections, updateRolePermission } from "@/app/services/client_side/selections";
import type { Permission, RolePermission, Selection } from "@/app/models/selection_model";
import { PermissionListSkeleton } from "../skeletons/permission-list-skeleton";

export default function PermissionModal({
	roleId,
	account,
	settings,
}: { roleId?: number; account?: Account; settings?: RolePermission[] | AccountPermission[] }) {
	const [selections, setSelections] = useState<Selection>();
	const [settingPermissions, setSettingPermissions] = useState<{ [key: number]: boolean }>({});

	useEffect(() => {
		if (!settings) return;

		setSettingPermissions(
			Object.fromEntries(settings ? settings.map((setting) => [setting.permission_id, setting.is_active]) : []),
		);
	}, [settings]);

	useEffect(() => {
		const fetchSelections = async () => {
			try {
				const response = await getSelections({
					select: ["permissions"],
				});

				setSelections(response);
			} catch (error) {
				const apiError = error as ErrorModel;
			}
		};

		fetchSelections();
	}, []);

	const handlePermissionChange = async (permission: Permission, state: boolean) => {
		try {
			const response = roleId
				? await updateRolePermission({ role_id: roleId, permission_id: permission.id!, is_active: state })
				: account
					? await updateAccountPermission({ user_id: account.id, permission_id: permission.id!, is_active: state })
					: undefined;
		} catch (error) {
			const apiError = error as ErrorModel;
		}
	};

	return selections?.permissions ? (
		<div className="flex-1 py-1 ">
			<div className="space-y-5 mt-5 text-neutral-900">
				<div className="flex flex-col space-y-3 h-full overflow-y-auto ">
					{selections?.permissions?.map((permission) => (
						<div key={permission.id} className="flex items-center space-x-3 justify-between">
							<span className="text-wrap">{permission.name}</span>
							<Switch
								onCheckedChange={async (checked) => await handlePermissionChange(permission, checked)}
								checked={settingPermissions[permission.id!]}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	) : (
		<PermissionListSkeleton />
	);
}
