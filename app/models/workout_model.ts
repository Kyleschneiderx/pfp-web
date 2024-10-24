import { ExerciseCategoryModel } from "./exercise_model";

export interface WorkoutModel {
  id: number;
  name: string;
  description: string;
  photo: string;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
  status_id: number | null;
  status: Status;
  workout_exercises: WorkoutExerciseModel[];
}

interface Status {
  id: number;
  value: string;
}

export interface WorkoutExerciseModel {
  workout_exercise_id?: number;
  id: number;
  sets: number;
  reps: number;
  hold: number;
  exercise: Exercise;
}

interface Exercise {
  id: number;
  name: string;
  description?: string;
  how_to?: string;
  photo?: string;
  video?: string;
  exercise_category?: ExerciseCategoryModel;
}

export interface WorkoutResponse {
  data: WorkoutModel[];
  page: number;
  page_items: number;
  max_page: number;
}