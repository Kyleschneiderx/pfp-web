import { PfPlanDailies, PfPlanExerciseModel } from "@/app/models/pfplan_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateDayForm = ({
  name,
  exercises,
  days,
  selectedDay,
}: {
  name: string;
  exercises: PfPlanExerciseModel[];
  days: PfPlanDailies[];
  selectedDay: PfPlanDailies | null;
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  const isNameExists = (
    arr: PfPlanDailies[],
    name: string,
    selectedDay: PfPlanDailies | null
  ): boolean => {
    const foundItem = arr.find(
      (obj) => obj.name.toLowerCase() === name.toLowerCase()
    );
    // Check if found item exists and is on a different day
    if (foundItem && foundItem.day !== selectedDay?.day) {
      return true;
    }
    return false;
  };

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Please enter a day name." });
  }

  if (exercises.length === 0) {
    errors.push({
      fieldName: "exercise",
      message: "Please add at least 1 exercise.",
    });
  } else {
    let setsErrorAdded = false;
    let repsErrorAdded = false;
    let holdErrorAdded = false;

    exercises.forEach((e) => {
      if (!setsErrorAdded && (!e.sets || e.sets <= 0)) {
        errors.push({
          fieldName: "sets",
          message: "No. of sets should be greater than zero.",
        });
        setsErrorAdded = true;
      }
      if (!repsErrorAdded && (!e.reps || e.reps <= 0)) {
        errors.push({
          fieldName: "reps",
          message: "No. of reps should be greater than zero.",
        });
        repsErrorAdded = true;
      }
      if (!holdErrorAdded && (!e.hold || e.hold <= 0)) {
        errors.push({
          fieldName: "hold",
          message: "No. of hold should be greater than zero.",
        });
        holdErrorAdded = true;
      }
    });
  }

  if (isNameExists(days, name, selectedDay)) {
    errors.push({
      fieldName: "duplicate-name",
      message: "Duplicate PF plan daily content name.",
    });
  }

  return errors;
};
