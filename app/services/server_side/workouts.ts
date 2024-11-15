import { WorkoutModel, WorkoutResponse } from "@/app/models/workout_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getWorkouts = async (
  params: string
): Promise<WorkoutResponse> => {
  const url = `/workouts?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as WorkoutResponse;
};

export const getWorkoutDetails = async (
  id: string
): Promise<WorkoutModel> => {
  const url = `/workouts/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as WorkoutModel;
};
