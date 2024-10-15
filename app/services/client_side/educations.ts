import { EducationResponse } from "@/app/models/education_model";
import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface FormEducationParams {
  method: "POST" | "PUT";
  id?: number | null;
  body: FormData;
}

export const saveEducation = async ({
  method,
  id,
  body,
}: FormEducationParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/educations/${id ?? ""}`;

  return apiClient<{ msg: string }>({
    url: url,
    method: method,
    body: body,
  });
};

export const deleteEducation = async (id: number): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/educations/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};

export const getEducations = async (
  params: string
): Promise<EducationResponse> => {
  const url = `${API_BASE_URL}/educations?${params}`;
  const data = await apiClient({
    url: url,
    method: "GET",
  });
  return data as EducationResponse;
};
