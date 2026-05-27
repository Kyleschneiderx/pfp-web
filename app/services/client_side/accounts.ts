import type {
	Account,
	AccountAddressesPayload,
	AccountPermission,
	AccountSettingsPayload,
	Address,
	NearbyProvider,
	NearbyProviderSearchParams,
	UserProfileSettings,
} from "@/app/models/accounts";
import type {
	CalendarAuthResponse,
	CalendarConnectionResponse,
	CalendarDisconnectResponse,
} from "@/app/models/calendar_model";
import type { Schedule } from "@/app/models/schedules";
import { apiClient } from "@/app/services/apiClient";

export const saveAccount = async ({
	method,
	id,
	body,
}: {
	method: "POST" | "PUT";
	id: number | undefined;
	body: FormData;
}): Promise<Account> => {
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
}: {
	id: number | undefined;
	body: { old_password?: string; password?: string };
}): Promise<Account> => {
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

export const getAccountPermissions = async (
	id: number,
	params?: Record<string, unknown>,
): Promise<AccountPermission[]> => {
	const url = `/accounts/${id}/permissions`;
	const response = apiClient<{ data: AccountPermission[] }>({
		url: url,
		method: "GET",
		params,
	});

	return (await response).data;
};

export const updateAccountPermission = async (data: {
	user_id: number;
	permission_id: number;
	is_active: boolean;
}) => {
	const { user_id, permission_id } = data;
	const url = `/accounts/${user_id}/permissions/${permission_id}`;
	const response = apiClient<AccountPermission>({
		url: url,
		method: "PUT",
		body: data,
	});

	return await response;
};

export const getAccountAddresses = async (id: number): Promise<Address[]> => {
	const url = `/accounts/${id}/addresses`;
	const response = await apiClient<{ data: Address[] }>({
		url: url,
		method: "GET",
	});

	return response.data;
};

export const updateAccountAddresses = async (id: number, addresses: Address[]): Promise<Address[]> => {
	const url = `/accounts/${id}/addresses`;
	const response = await apiClient<{ data: Address[] }>({
		url: url,
		method: "PUT",
		body: { addresses } satisfies AccountAddressesPayload,
	});

	return response.data;
};

export const getAccountSettings = async (id: number): Promise<UserProfileSettings> => {
	const url = `/accounts/${id}/settings`;
	const response = await apiClient<{ data: UserProfileSettings }>({
		url: url,
		method: "GET",
	});

	return response.data;
};

export const updateAccountSettings = async (
	id: number,
	settings: UserProfileSettings,
): Promise<UserProfileSettings> => {
	const url = `/accounts/${id}/settings`;
	const response = await apiClient<{ data: UserProfileSettings }>({
		url: url,
		method: "PUT",
		body: { settings } satisfies AccountSettingsPayload,
	});

	return response.data;
};

export const getNearbyProviders = async (params: NearbyProviderSearchParams): Promise<NearbyProvider[]> => {
	const url = "/accounts/providers/nearby";
	const response = await apiClient<{ data: NearbyProvider[] }>({
		url: url,
		method: "GET",
		params,
	});

	return response.data;
};

export const getAccountSchedule = async (id: number): Promise<Schedule> => {
	const url = `/accounts/${id}/schedule`;
	const data = await apiClient({
		url: url,
		method: "GET",
	});
	return data as Schedule;
};

export const getCalendarConnectionStatus = async (): Promise<CalendarConnectionResponse> => {
	const url = "/calendar-connections/status";
	const response = await apiClient<CalendarConnectionResponse>({
		url: url,
		method: "GET",
	});

	return response;
};

export const initiateGoogleCalendarAuth = async (): Promise<CalendarAuthResponse> => {
	const url = "/calendar-connections/google/auth";
	const response = await apiClient<CalendarAuthResponse>({
		url: url,
		method: "POST",
	});

	return response;
};

export const disconnectGoogleCalendar = async (): Promise<CalendarDisconnectResponse> => {
	const url = "/calendar-connections/google";
	const response = await apiClient<CalendarDisconnectResponse>({
		url: url,
		method: "DELETE",
	});

	return response;
};

export const handleGoogleCalendarCallback = async (code: string): Promise<CalendarConnectionResponse> => {
	const url = "/calendar-connections/google/callback";
	const response = await apiClient<CalendarConnectionResponse>({
		url: url,
		method: "GET",
		params: { code },
	});

	return response;
};
