import { EducationModel } from "./education_model";
import { ExerciseModel } from "./exercise_model";

export interface PfPlanModel {
  id: number;
  name: string;
  description: string;
  content: string;
  photo: string;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
  status: Status;
  pf_plan_dailies: PfPlanDailies[];
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
  exercise: ExerciseModel;
}

export interface PfPlanResponse {
  data: PfPlanModel[];
  page: number;
  page_items: number;
  max_page: number;
}
