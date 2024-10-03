"use server";

import { EducationModel } from "@/app/models/education_model";
import { ErrorModel } from "@/app/models/error_model";
import { getEducations } from "@/app/services/server_side/education";

interface Props {
  page?: number;
  name: string;
  sort: string;
}

export async function fetchEducations({
  page = 1,
  name, sort,
}: Props): Promise<{educationList: EducationModel[]; max_page: number}> {
  let response;
  const params = `&title=${name}&sort[]=${sort}&page=${page}&page_items=20`;
  try {
    response = await getEducations(params);
    console.log(response.data.length);
    return { educationList: response.data, max_page: response.max_page};
  } catch (error) {
    const apiError = error as ErrorModel;
    const errorMessage = apiError.msg || "Failed to fetch educations";
    throw new Error(errorMessage);
  }
}