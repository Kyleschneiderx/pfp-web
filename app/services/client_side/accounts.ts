import { apiClient } from "@/app/services/apiClient";
import type { Account, AccountPermission } from "@/app/models/accounts";

export const saveAccount = async ({
	method,
	id,
	body,
}: { method: "POST" | "PUT"; id: number | undefined; body: FormData }): Promise<Account> => {
	const url = `/accounts/${id ?? ""}`;

	return apiClient<Account>({
		url: url,
		method: method,
		body: body,
	});
};

export const deleteAccount = async (id: number): Promise<{ msg: string }> => {
	const url = `/accounts/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};

export const changePassword = async ({
	id,
	body,
}: { id: number | undefined; body: { old_password?: string; password?: string } }): Promise<Account> => {
	const url = `/accounts/${id}/change-password`;

	return apiClient<Account>({
		url: url,
		method: "PUT",
		body: body,
	});
};

export const reset2FA = async (id: number | undefined): Promise<{ msg: string }> => {
	const url = `/accounts/${id}/reset-2fa`;

	return apiClient<{ msg: string }>({
		url: url,
		method: "DELETE",
	});
};

export const getAccountPermissions = async (id: number, params?: Record<string, any>): Promise<AccountPermission[]> => {
	const url = `/accounts/${id}/permissions`;
	const response = apiClient<{ data: AccountPermission[] }>({ url: url, method: "GET", params });

	return (await response).data;
};

export const updateAccountPermission = async (data: { user_id: number; permission_id: number; is_active: boolean }) => {
	const { user_id, permission_id } = data;
	const url = `/accounts/${user_id}/permissions/${permission_id}`;
	const response = apiClient<AccountPermission>({ url: url, method: "PUT", body: data });

	return await response;
};
