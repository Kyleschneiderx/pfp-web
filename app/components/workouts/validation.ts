import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { WorkoutExerciseModel } from "@/app/models/workout_model";

export const validateForm = ({
  name,
  description,
  type,
  photo,
  exercises,
}: {
  name: string;
  description: string;
  type?: string;
  photo?: any;
  exercises: WorkoutExerciseModel[];
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Please enter a workout name." });
  }

  if (!description.trim()) {
    errors.push({
      fieldName: "description",
      message: "A description is required.",
    });
  }

  if (!type) {
    errors.push({ fieldName: "type", message: "Please select a user type." });
  }

  if (!photo) {
    errors.push({ fieldName: "photo", message: "A photo is required." });
  }

  if (exercises.length === 0) {
    errors.push({
      fieldName: "exercise",
      message: "Please select at least 1 exercise.",
    });
  } else {
    let setsErrorAdded = false;
    let repsErrorAdded = false;

    exercises.forEach(e => {
      if (!setsErrorAdded && (!e.sets || e.sets <= 0)) {
        errors.push({ fieldName: "sets", message: "No. of sets should be greater than zero." });
        setsErrorAdded = true;
      }
      if (!repsErrorAdded && (!e.reps || e.reps <= 0)) {
        errors.push({ fieldName: "reps", message: "No. of reps should be greater than zero." });
        repsErrorAdded = true;
      }
    });
  }

  return errors;
};
