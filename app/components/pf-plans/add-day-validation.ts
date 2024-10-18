import { EducationModel } from "@/app/models/education_model";
import { PfPlanDailies } from "@/app/models/pfplan_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateDayForm = ({
  name,
  education,
  exerciseLength,
  days,
}: {
  name: string;
  education: EducationModel | null;
  exerciseLength: number;
  days: PfPlanDailies[];
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  const isNameExists = (arr: PfPlanDailies[], name: string): boolean => {
    return arr.some((obj) => obj.name.toLowerCase() === name.toLowerCase());
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

  if (isNameExists(days, name)) {
    errors.push({
      fieldName: "duplicate-name",
      message: "Duplicate PF plan daily content name.",
    });
  }

  return errors;
};
