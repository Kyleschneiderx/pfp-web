import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface FormWorkoutParams {
  method: "POST" | "PUT",
  id?: number | null;
  body: FormData,
}

export const saveWorkout = async ({
  method,
  id,
  body,
}: FormWorkoutParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/workouts/${id ?? ""}`;

  return apiClient<{ msg: string }>({
    url: url,
    method: method,
    body: body,
  });
};

export const deleteWorkout = async (id: number): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/workouts/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
