import type { ErrorModel } from "@/app/models/error_model";
import type { PfPlanDailies } from "@/app/models/pfplan_model";
import { apiClient } from "@/app/services/apiClient";

export interface PfPlanDailiesListResponse {
	data: PfPlanDailies[];
	page: number;
	page_items: number;
	max_page: number;
}

export interface PfPlanDailyContentInput {
	content_id?: number;
	exercise_id?: number;
	sets?: number;
	reps?: number;
	hold?: number;
	rest?: number;
	education_id?: number;
}

export interface PfPlanDailyInput {
	day: number;
	name: string;
	requires_pfdi_update?: boolean;
	custom_form_ids?: number[];
	contents: PfPlanDailyContentInput[];
}

interface ListParams {
	page?: number;
	pageItems?: number;
	sort?: string;
}

export const listPfPlanDailies = async (
	pfPlanId: number,
	{ page = 1, pageItems = 10, sort = "day:asc" }: ListParams = {},
): Promise<PfPlanDailiesListResponse> => {
	const search = new URLSearchParams({
		page: page.toString(),
		page_items: pageItems.toString(),
		sort,
	});
	try {
		return await apiClient<PfPlanDailiesListResponse>({
			url: `/pf-plans/${pfPlanId}/dailies?${search.toString()}`,
			method: "GET",
		});
	} catch (error) {
		const apiError = error as ErrorModel;
		// API returns 404 when no records match the filter — treat as empty page.
		if (apiError?.code === 404) {
			return { data: [], page, page_items: pageItems, max_page: 0 };
		}
		throw error;
	}
};

export const createPfPlanDaily = async (pfPlanId: number, body: PfPlanDailyInput): Promise<PfPlanDailies> => {
	return apiClient<PfPlanDailies>({
		url: `/pf-plans/${pfPlanId}/dailies`,
		method: "POST",
		body,
	});
};

export const updatePfPlanDaily = async (
	pfPlanId: number,
	dailyId: number,
	body: PfPlanDailyInput,
): Promise<PfPlanDailies> => {
	return apiClient<PfPlanDailies>({
		url: `/pf-plans/${pfPlanId}/dailies/${dailyId}`,
		method: "PUT",
		body,
	});
};

export const reorderPfPlanDaily = async (pfPlanId: number, dailyId: number, day: number): Promise<PfPlanDailies> => {
	return apiClient<PfPlanDailies>({
		url: `/pf-plans/${pfPlanId}/dailies/${dailyId}/order`,
		method: "PUT",
		body: { day },
	});
};

export const deletePfPlanDaily = async (pfPlanId: number, dailyId: number): Promise<{ msg: string }> => {
	return apiClient<{ msg: string }>({
		url: `/pf-plans/${pfPlanId}/dailies/${dailyId}`,
		method: "DELETE",
	});
};
