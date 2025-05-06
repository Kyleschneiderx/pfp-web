import type { PfPlanModel } from "@/app/models/pfplan_model";
import type { UserSummaryModel } from "@/app/models/user_summary_model";
import type { UserVisitStatsModel } from "@/app/models/user_visit_stats";
import { apiClient } from "@/app/services/apiClient";

interface FormPatientParams {
	method: "POST" | "PUT";
	id?: number | null;
	body: FormData;
}

export const savePatient = async ({ method, id, body }: FormPatientParams): Promise<{ msg: string }> => {
	const url = `/users/${id ?? ""}`;

	return apiClient<{ msg: string }>({
		url: url,
		method: method,
		body: body,
	});
};

export const deletePatient = async (id: number): Promise<{ msg: string }> => {
	const url = `/users/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};

export const getUserSummary = async (params: string): Promise<UserSummaryModel> => {
	const url = `/users/summary?${params}`;
	return apiClient<UserSummaryModel>({ url: url, method: "GET" });
};

export const sendInvite = async (id: number): Promise<{ msg: string }> => {
	const url = `/users/${id}/invite`;
	return apiClient<{ msg: string }>({
		url: url,
		method: "POST",
	});
};

export const deletePatientAccount = async (mobileToken: string): Promise<{ msg: string }> => {
	const url = "/users/delete-account";
	return await apiClient<{ msg: string }>({
		url: url,
		method: "DELETE",
		mobileToken: mobileToken,
	});
};

export const getUserVisitStats = async (): Promise<UserVisitStatsModel> => {
	const url = "/misc/page-tracking/stats";
	return apiClient<UserVisitStatsModel>({ url: url, method: "GET" });
};

export const savePersonalizedPfPlan = async ({
	method,
	userId,
	id,
	body,
}: {
	method: "POST" | "PUT";
	userId: number;
	id?: number | null;
	body: FormData;
}): Promise<PfPlanModel> => {
	const url = `/users/${userId}/pf-plan/${id ?? ""}`;

	body.append("user_id", userId.toString());

	return apiClient<PfPlanModel>({
		url: url,
		method: method,
		body: body,
	});
};
