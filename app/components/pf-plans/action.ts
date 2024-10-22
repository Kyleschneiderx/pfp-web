"use server";

import { ErrorModel } from "@/app/models/error_model";
import { PfPlanModel } from "@/app/models/pfplan_model";
import { getPfPlans } from "@/app/services/server_side/pfplans";

interface Props {
  page?: number;
  name: string;
  sort: string;
}

export async function fetchPfPlans({
  page = 1,
  name, sort,
}: Props): Promise<{pfPlanList: PfPlanModel[]; max_page: number}> {
  let response;
  const params = `&name=${name}&sort[]=${sort}&page=${page}&page_items=15`;
  try {
    response = await getPfPlans(params);
    console.log(response.data.length);
    return { pfPlanList: response.data, max_page: response.max_page};
  } catch (error) {
    const apiError = error as ErrorModel;
    const errorMessage = apiError.msg || "Failed to fetch pf plans";
    throw new Error(errorMessage);
  }
}