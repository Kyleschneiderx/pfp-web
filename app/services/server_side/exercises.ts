import { ExerciseModel, ExercisesResponse } from "@/app/models/exercise_model";
import { apiServerSide } from "@/app/services/apiServerSide";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getExercises = async (
  params: string
): Promise<ExercisesResponse> => {
  const url = `${API_BASE_URL}/exercises?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as ExercisesResponse;
};

export const getExerciseDetails = async (
  id: string
): Promise<ExerciseModel> => {
  const url = `${API_BASE_URL}/exercises/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as ExerciseModel;
};
