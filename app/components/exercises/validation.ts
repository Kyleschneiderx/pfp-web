import { CategoryOptionsModel } from "@/app/models/exercise_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = (
  name: string,
  category: CategoryOptionsModel | null | undefined,
): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Exercise name is required." });
  }

  if (!category) {
    errors.push({ fieldName: "category", message: "Category is required." });
  }

  return errors;
};