"use server";

import { ErrorModel } from "@/app/models/error_model";
import { WorkoutModel } from "@/app/models/workout_model";
import { getWorkouts } from "@/app/services/server_side/workouts";

interface Props {
  page?: number;
  name: string;
  sort: string;
}

export async function fetchWorkouts({
  page = 1,
  name, sort,
}: Props): Promise<{workoutList: WorkoutModel[]; max_page: number}> {
  let response;
  const params = `&name=${name}&sort[]=${sort}&page=${page}&page_items=20`;
  try {
    response = await getWorkouts(params);
    console.log(response.data.length);
    return { workoutList: response.data, max_page: response.max_page};
  } catch (error) {
    const apiError = error as ErrorModel;
    const errorMessage = apiError.msg || "Failed to fetch exercises";
    throw new Error(errorMessage);
  }
}