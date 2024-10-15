import { EducationModel } from "./education_model";
import { ExerciseModel } from "./exercise_model";

export interface PfPlanModel {
  id: number;
  name: string;
  description: string;
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
  id: number;
  name: string;
  day: number;
  contents: PfPlanDailyContents[];
}

interface PfPlanDailyContents {
  id: number;
  exercise: ExerciseModel;
  education: EducationModel;
}

export interface PfPlanResponse {
  data: PfPlanModel[];
  page: number;
  page_items: number;
  max_page: number;
}
