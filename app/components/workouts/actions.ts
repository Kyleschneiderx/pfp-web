"use server";

import { isOwnQueryParam } from "@/app/lib/ownership-filter";
import type { ErrorModel } from "@/app/models/error_model";
import type { WorkoutModel } from "@/app/models/workout_model";
import { getWorkouts } from "@/app/services/server_side/workouts";

interface Props {
	page?: number;
	name: string;
	sort: string;
	ownership?: string;
}

export async function fetchWorkouts({
	page = 1,
	name,
	sort,
	ownership,
}: Props): Promise<{ workoutList: WorkoutModel[]; max_page: number }> {
	let response;
	const params = `&name=${name}&sort[]=${sort}&page=${page}&page_items=15${isOwnQueryParam(ownership)}`;
	try {
		response = await getWorkouts(params);
		return { workoutList: response.data, max_page: response.max_page };
	} catch (error) {
		const apiError = error as ErrorModel;
		const errorMessage = apiError.msg || "Failed to fetch workouts";
		throw new Error(errorMessage);
	}
}
