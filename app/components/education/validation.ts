import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = ({
  title,
  description,
  content,
  photo,
}: {
  title: string;
  description: string;
  content: string;
  photo?: any;
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!title.trim()) {
    errors.push({ fieldName: "title", message: "Please enter a education title." });
  }

  if (!description.trim()) {
    errors.push({
      fieldName: "description",
      message: "Please enter a description.",
    });
  }

  if (!content.trim()) {
    errors.push({ fieldName: "content", message: "Please enter a content." });
  }

  if (!photo) {
    errors.push({ fieldName: "photo", message: "A thumbnail is required." });
  }

  return errors;
};
