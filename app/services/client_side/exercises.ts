import { ExerciseCategoryModel, ExercisesResponse } from "@/app/models/exercise_model";
import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface FormExerciseParams {
  method: "POST" | "PUT",
  id?: number | null;
  body: FormData,
}

interface ExerciseCategoriesResponse {
  data: {
    exercise_category: ExerciseCategoryModel[];
  };
}

export const getExercises = async (
  params: string
): Promise<ExercisesResponse> => {
  const url = `${API_BASE_URL}/exercises?${params}`;
  console.log(url);
  const data = await apiClient({
    url: url,
    method: "GET",
  });
  return data as ExercisesResponse;
};

export const saveExercise = async ({
  method,
  id,
  body,
}: FormExerciseParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/exercises/${id ?? ""}`;

  return apiClient<{ msg: string }>({
    url: url,
    method: method,
    body: body,
    contentType: "multipart/form-data",
  });
};

export const deleteExercise = async (id: number): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/exercises/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};

export const createExerciseCategory = async ({
  name,
}: {
  name: string;
}): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/selections/exercise-categories`;
  return apiClient<{ msg: string }>({
    url: url,
    method: "POST",
    body: { name: name },
  });
};

export const getExerciseCategories = async (): Promise<
  ExerciseCategoryModel[]
> => {
  const url = `${API_BASE_URL}/selections?exercise_category`;
  const data: ExerciseCategoriesResponse = await apiClient({
    url: url,
    method: "GET",
  });
  return data.data.exercise_category;
};

export const updateExerciseCategory = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/selections/exercise-categories/${id}`;
  return apiClient<{ msg: string }>({
    url: url,
    method: "PUT",
    body: { name: name },
  });
};

export const deleteExerciseCategory = async (
  id: string
): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/selections/exercise-categories/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
