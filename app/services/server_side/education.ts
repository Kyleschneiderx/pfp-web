import { EducationModel, EducationResponse } from "@/app/models/education_model";
import { apiServerSide } from "@/app/services/apiServerSide";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getEducations = async (
  params: string
): Promise<EducationResponse> => {
  const url = `${API_BASE_URL}/educations?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as EducationResponse;
};

export const getEducationDetails = async (
  id: string
): Promise<EducationModel> => {
  const url = `${API_BASE_URL}/educations/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as EducationModel;
};
