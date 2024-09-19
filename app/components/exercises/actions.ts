"use server";

import { ErrorModel } from "@/app/models/error_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import { getExercises } from "@/app/services/server_side/exercises";

export async function fetchExercises({
  page = 1,
  name,
  sort,
  category_id,
}: {
  page?: number;
  name: string;
  sort: string;
  category_id: string;
}): Promise<{exerciseList: ExerciseModel[]; max_page: number}> {

  let response;
  const params = `&name=${name}${
    !["0", ""].includes(category_id ?? "") ? `&category_id[]=${category_id}` : ""
  }&sort[]=${sort}&page=${page}&page_items=20`;

  try {
    response = await getExercises(params);
    console.log(response.data.length);
    return {exerciseList: response.data, max_page: response.max_page };
  } catch (error) {
    const apiError = error as ErrorModel;
    const errorMessage = apiError.msg || "Failed to fetch patients";
    throw new Error(errorMessage);
  }
}
