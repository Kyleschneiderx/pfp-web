import { UserSummaryModel } from "@/app/models/user_summary_model";
import { apiClient } from "@/app/services/apiClient";

interface FormPatientParams {
  method: "POST" | "PUT";
  id?: number | null;
  body: FormData;
}

export const savePatient = async ({
  method,
  id,
  body,
}: FormPatientParams): Promise<{ msg: string }> => {
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

export const getUserSummary = async (
  params: string
): Promise<UserSummaryModel> => {
  const url = `/users/summary?${params}`;
  return apiClient<UserSummaryModel>({ url: url, method: "GET" });
};

export const sendInvite = async (id: number): Promise<{ msg: string }> => {
  const url = `/users/${id}/invite`;
  return apiClient<{ msg: string }>({
    url: url,
    method: "POST",
  });
};
