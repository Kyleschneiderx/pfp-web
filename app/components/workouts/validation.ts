import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = ({
  name,
  description,
  type,
  photo,
  exerciseLength,
  action,
}: {
  name: string;
  description: string;
  type?: string;
  photo?: any;
  exerciseLength: number;
  action: string,
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

  if (!photo && action === "Create") {
    errors.push({ fieldName: "photo", message: "A photo is required." });
  }

  if (exerciseLength === 0) {
    errors.push({
      fieldName: "exercise",
      message: "Please select at least 1 exercise.",
    });
  }

  return errors;
};
