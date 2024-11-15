import { ExerciseModel, ExercisesResponse } from "@/app/models/exercise_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getExercises = async (
  params: string
): Promise<ExercisesResponse> => {
  const url = `/exercises?${params}`;
  const data = await apiServerSide({
    url: url,
    method: "GET",
  });
  return data as ExercisesResponse;
};

export const getExerciseDetails = async (
  id: string
): Promise<ExerciseModel> => {
  const url = `/exercises/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as ExerciseModel;
};
