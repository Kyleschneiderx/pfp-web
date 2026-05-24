import type { List } from "@/app/models/global_model";
import type {
	PatientCustomFormAnswerModel,
	PatientModel,
	PatientSurveyModel,
	PatientsResponse,
} from "@/app/models/patient_model";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import type { InvitedSummaryModel, UserSummaryModel } from "@/app/models/user_summary_model";
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
	const url = `/stats/user-summary?${params}`;
	return apiClient<UserSummaryModel>({ url: url, method: "GET" });
};

export const getInvitedSummary = async (params: string): Promise<InvitedSummaryModel> => {
	const url = `/stats/invite?${params}`;
	return apiClient<InvitedSummaryModel>({ url: url, method: "GET" });
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

export const getUserVisitStats = async (params: string): Promise<UserVisitStatsModel> => {
	const url = `/stats/page-tracking?${params}`;
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

export const getPersonalizedPfPlan = async (id: string): Promise<PfPlanModel> => {
	const url = `/users/${id}/pf-plan`;
	const data = await apiClient({
		url: url,
		method: "GET",
	});
	return data as PfPlanModel;
};

export interface ExportResponse {
	url: string;
	expiresAt: string;
	fileName: string;
}

export const getPatientsList = async (params: string): Promise<PatientsResponse> => {
	const url = `/users?${params}`;
	return apiClient<PatientsResponse>({ url, method: "GET" });
};

export const exportPatients = async (params: string): Promise<ExportResponse> => {
	const cleanParams = params.startsWith("&") ? params.substring(1) : params;
	const url = `/users?${cleanParams}&export=true`;
	return await apiClient<ExportResponse>({ url: url, method: "GET" });
};

export const getPatientSurvey = async (id: string, params?: string): Promise<List<PatientSurveyModel>> => {
	const url = `/users/${id}/survey${params ? `?${params}` : ""}`;
	const data = await apiClient<List<PatientSurveyModel>>({
		url: url,
		method: "GET",
	});
	return data;
};

export const getPatientCustomForms = async (
	id: string,
	params?: string,
): Promise<List<PatientCustomFormAnswerModel>> => {
	const url = `/users/${id}/custom-forms${params ? `?${params}` : ""}`;
	const data = await apiClient<List<PatientCustomFormAnswerModel>>({
		url: url,
		method: "GET",
	});
	return data;
};
