import { EducationModel, EducationResponse } from "@/app/models/education_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getEducations = async (
  params: string
): Promise<EducationResponse> => {
  const url = `/educations?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as EducationResponse;
};

export const getEducationDetails = async (
  id: string
): Promise<EducationModel> => {
  const url = `/educations/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as EducationModel;
};
