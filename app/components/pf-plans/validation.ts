import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = ({
  name,
  description,
  photo,
  dayLength,
}: {
  name: string;
  description: string;
  type?: string;
  photo?: any;
  dayLength: number;
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Please enter a plan name." });
  }

  if (!description.trim()) {
    errors.push({
      fieldName: "description",
      message: "A description is required.",
    });
  }

  if (!photo) {
    errors.push({ fieldName: "photo", message: "A photo is required." });
  }

  if (dayLength === 0) {
    errors.push({
      fieldName: "exercise",
      message: "Please add at least day 1.",
    });
  }

  return errors;
};
