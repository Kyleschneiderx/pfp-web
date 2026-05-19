"use server";

import { isOwnQueryParam } from "@/app/lib/ownership-filter";
import type { ErrorModel } from "@/app/models/error_model";
import type { ExerciseModel } from "@/app/models/exercise_model";
import { getExercises } from "@/app/services/server_side/exercises";

export async function fetchExercises({
	page = 1,
	name,
	sort,
	category_id,
	sets_from,
	sets_to,
	reps_from,
	reps_to,
	ownership,
}: {
	page?: number;
	name: string;
	sort: string;
	category_id: string;
	sets_from: string;
	sets_to: string;
	reps_from: string;
	reps_to: string;
	ownership?: string;
}): Promise<{ exerciseList: ExerciseModel[]; max_page: number }> {
	let response;
	const categoryIds = category_id ? category_id.split(",") : [];
	const category_ids = categoryIds.length ? categoryIds.map((id) => `&category_id[]=${id}`).join("") : "";

	const params = `&name=${name}${category_ids}&sets_from=${sets_from}&sets_to=${sets_to}&reps_from=${reps_from}&reps_to=${reps_to}&sort[]=${sort}&page=${page}&page_items=15${isOwnQueryParam(ownership)}`;

	try {
		response = await getExercises(params);
		return { exerciseList: response.data, max_page: response.max_page };
	} catch (error) {
		const apiError = error as ErrorModel;
		const errorMessage = apiError.msg || "Failed to fetch exercises";
		throw new Error(errorMessage);
	}
}
