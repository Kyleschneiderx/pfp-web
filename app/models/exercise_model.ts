export interface ExerciseModel {
  id: number;
  name: string;
  sets: number;
  reps: number;
  hold: number;
  description: string | null;
  how_to: string | null;
  audio: string;
  photo: string;
  video: string | null;
  created_at: string;
  updated_at: string;
  exercise_category: ExerciseCategoryModel;
}

export interface ExerciseCategoryModel {
  id: number;
  value: string;
}

export interface ExercisesResponse {
  data: ExerciseModel[];
  page: number;
  page_items: number;
  max_page: number;
}

export interface CategoryOptionsModel {
  label: string;
  value: string;
}
