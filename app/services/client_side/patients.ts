import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface FormPatientParams {
  method: "POST" | "PUT",
  id?: number | null;
  body: FormData,
}

export const savePatient = async ({
  method,
  id,
  body,
}: FormPatientParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/users/${id ?? ""}`;

  return apiClient<{ msg: string }>({
    url: url,
    method: method,
    body: body,
  });
};

export const deletePatient = async (id: number): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/users/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
