export interface ExerciseModel {
  id: number;
  name: string;
  sets: number;
  reps: number;
  hold: number;
  description: string;
  how_to: string;
  audio: string;
  photo: string;
  video: string;
  created_at: string;
  updated_at: string;
  exercise_category: ExerciseCategory;
}

interface ExerciseCategory {
  id: number;
  value: string;
}

export interface ExercisesResponse {
  data: ExerciseModel[];
  page: number;
  page_items: number;
  max_page: number;
}
