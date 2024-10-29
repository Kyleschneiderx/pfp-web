import { EducationModel } from "@/app/models/education_model";
import { PfPlanDailies } from "@/app/models/pfplan_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateDayForm = ({
  name,
  education,
  exerciseLength,
  days,
  selectedDay,
}: {
  name: string;
  education: EducationModel | null;
  exerciseLength: number;
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

  if (!education) {
    errors.push({
      fieldName: "education",
      message: "Please add an education.",
    });
  }

  if (exerciseLength === 0) {
    errors.push({
      fieldName: "exercise",
      message: "Please add at least 1 exercise.",
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
