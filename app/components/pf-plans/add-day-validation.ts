import { EducationModel } from "@/app/models/education_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateDayForm = ({
  name,
  education,
  exerciseLength,
}: {
  name: string;
  education: EducationModel | null;
  exerciseLength: number;
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Please enter a day name." });
  }

  if (!education) {
    errors.push({ fieldName: "education", message: "Please add an education." });
  }

  if (exerciseLength === 0) {
    errors.push({
      fieldName: "exercise",
      message: "Please add at least 1 exercise.",
    });
  }

  return errors;
};
