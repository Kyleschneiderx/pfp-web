import type { EducationModel } from "./education_model";
import type { ExerciseModel } from "./exercise_model";

export interface PfPlanModel {
	id: number;
	name: string;
	description: string;
	content: string;
	photo: string;
	user_id: number | null;
	is_premium: boolean | null;
	is_custom: boolean | null;
	created_at: string;
	updated_at: string;
	status: Status;
	pf_plan_dailies: PfPlanDailies[];
	categories: PfPlanCategoryModel[];
}

export interface PfPlanCategoryModel {
	id: number;
	value: string;
}

interface Status {
	id: number;
	value: string;
}

export interface PfPlanDailies {
	id?: number; // Used for daily_id
	name: string;
	day: number;
	contents: (EducationModel | PfPlanExerciseModel)[];
}

export interface PfPlanExerciseModel {
	id?: number; // Used for content_id
	exercise_id: number;
	sets: number;
	reps: number;
	hold: number;
	rest: number;
	exercise: ExerciseModel;
}

export interface PfPlanResponse {
	data: PfPlanModel[];
	page: number;
	page_items: number;
	max_page: number;
}

export interface CategoryOptionsModel {
	label: string;
	value: string;
}
