import { ExerciseCategoryModel } from "@/app/models/exercise_model";
import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface FormExerciseParams {
  method: "POST" | "PUT",
  id?: number | null;
  name: string;
  category_id: string;
  sets: number;
  reps: number;
  hold: number;
  description: string | null;
  how_to: string | null;
  photo: File | null;
  video: File | null;
}

interface ExerciseCategoriesResponse {
  data: {
    exercise_category: ExerciseCategoryModel[];
  };
}

export const saveExercise = async ({
  method,
  id,
  name,
  category_id,
  sets,
  reps,
  hold,
  description,
  how_to,
  photo,
  video,
}: FormExerciseParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/exercises/${id ?? ""}`;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("category_id", category_id);
  formData.append("sets", sets.toString());
  formData.append("reps", reps.toString());
  formData.append("hold", hold.toString());
  if (description) formData.append("description", description);
  if (how_to) formData.append("how_to", how_to);
  if (photo) formData.append("photo", photo);
  if (video) formData.append("video", video);

  return apiClient<{ msg: string }>({
    url: url,
    method: method,
    body: formData,
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
