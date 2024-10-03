import { WorkoutModel, WorkoutResponse } from "@/app/models/workout_model";
import { apiServerSide } from "@/app/services/apiServerSide";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getWorkouts = async (
  params: string
): Promise<WorkoutResponse> => {
  const url = `${API_BASE_URL}/workouts?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as WorkoutResponse;
};

export const getWorkoutDetails = async (
  id: string
): Promise<WorkoutModel> => {
  const url = `${API_BASE_URL}/workouts/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as WorkoutModel;
};
