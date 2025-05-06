import type { PfPlanModel, PfPlanResponse } from "@/app/models/pfplan_model";
import { apiClient } from "@/app/services/apiClient";

interface FormPfPlanParams {
	method: "POST" | "PUT";
	id?: number | null;
	body: FormData;
}

export const savePfPlan = async ({ method, id, body }: FormPfPlanParams): Promise<{ msg: string }> => {
	const url = `/pf-plans/${id ?? ""}`;

	return apiClient<{ msg: string }>({
		url: url,
		method: method,
		body: body,
	});
};

export const deletePfPlan = async (id: number): Promise<{ msg: string }> => {
	const url = `/pf-plans/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};

export const getPfPlans = async (params: string): Promise<PfPlanResponse> => {
	const url = `/pf-plans?${params}`;
	const data = await apiClient({
		url: url,
		method: "GET",
	});
	return data as PfPlanResponse;
};

export const duplicatePfPlan = async (
	id: number,
): Promise<Omit<PfPlanModel, "status" | "categories" | "pf_plan_dailies"> & { status_id: number }> => {
	const url = `/pf-plans/${id}/duplicate`;
	return await apiClient<Omit<PfPlanModel, "status" | "categories" | "pf_plan_dailies"> & { status_id: number }>({
		url: url,
		method: "POST",
	});
};

