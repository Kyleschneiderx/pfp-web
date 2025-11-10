import type { RolePermission, Selection } from "@/app/models/selection_model";
import { apiClient } from "../apiClient";

export const getSelections = async (params: Record<string, any>): Promise<Selection> => {
	const url = "/selections";
	const response = apiClient<{ data: Selection }>({ url: url, method: "GET", params });

	return (await response).data;
};

export const getRolePermissions = async (roleId: number, params?: Record<string, any>): Promise<RolePermission[]> => {
	const url = `/selections/roles/${roleId}/permissions`;
	const response = apiClient<{ data: RolePermission[] }>({ url: url, method: "GET", params });

	return (await response).data;
};

export const updateRolePermission = async (data: { role_id: number; permission_id: number; is_active: boolean }) => {
	const { role_id, permission_id } = data;
	const url = `/selections/roles/${role_id}/permissions/${permission_id}`;
	const response = apiClient<{ data: Selection }>({ url: url, method: "PUT", body: data });

	return (await response).data;
};
