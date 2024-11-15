import { WorkoutResponse } from "@/app/models/workout_model";
import { apiClient } from "@/app/services/apiClient";

interface FormWorkoutParams {
  method: "POST" | "PUT";
  id?: number | null;
  body: FormData;
}

export const saveWorkout = async ({
  method,
  id,
  body,
}: FormWorkoutParams): Promise<{ msg: string }> => {
  const url = `/workouts/${id ?? ""}`;

  return apiClient<{ msg: string }>({
    url: url,
    method: method,
    body: body,
  });
};

export const deleteWorkout = async (id: number): Promise<{ msg: string }> => {
  const url = `/workouts/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};

export const getWorkouts = async (params: string): Promise<WorkoutResponse> => {
  const url = `/workouts?${params}`;
  const data = await apiClient({
    url: url,
    method: "GET",
  });
  return data as WorkoutResponse;
};
