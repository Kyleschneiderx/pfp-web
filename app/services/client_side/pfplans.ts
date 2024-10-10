import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface FormPfPlanParams {
  method: "POST" | "PUT",
  id?: number | null;
  body: FormData,
}

export const savePfPlan = async ({
  method,
  id,
  body,
}: FormPfPlanParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/pf-plans/${id ?? ""}`;

  return apiClient<{ msg: string }>({
    url: url,
    method: method,
    body: body,
  });
};

export const deletePfPlan = async (id: number): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/pf-plans/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
