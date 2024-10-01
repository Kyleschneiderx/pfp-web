import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = (
  name: string,
  description: string,
  type?: string,
): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Workout name is required." });
  }

  if (!description.trim()) {
    errors.push({ fieldName: "description", message: "Description is required." });
  }

  if (!type) {
    errors.push({ fieldName: "type", message: "User type is required." });
  }
  
  return errors;
};