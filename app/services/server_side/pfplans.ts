import { PfPlanModel, PfPlanResponse } from "@/app/models/pfplan_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getPfPlans = async (
  params: string
): Promise<PfPlanResponse> => {
  const url = `/pf-plans?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as PfPlanResponse;
};

export const getPfPlanDetails = async (
  id: string
): Promise<PfPlanModel> => {
  const url = `/pf-plans/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as PfPlanModel;
};
