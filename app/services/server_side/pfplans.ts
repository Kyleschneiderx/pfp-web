import { PfPlanModel, PfPlanResponse } from "@/app/models/pfplan_model";
import { apiServerSide } from "@/app/services/apiServerSide";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getPfPlans = async (
  params: string
): Promise<PfPlanResponse> => {
  const url = `${API_BASE_URL}/pf-plans?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as PfPlanResponse;
};

export const getPfPlanDetails = async (
  id: string
): Promise<PfPlanModel> => {
  const url = `${API_BASE_URL}/pf-plans/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as PfPlanModel;
};
