import { CategoryOptionsModel } from "@/app/models/exercise_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = ({
  name,
  category,
  photo,
  video,
}: {
  name: string;
  category: CategoryOptionsModel | null | undefined;
  photo?: any;
  video?: any;
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Exercise name is required." });
  }

  if (!category) {
    errors.push({ fieldName: "category", message: "Category is required." });
  }

  if (!photo) {
    errors.push({ fieldName: "photo", message: "A photo is required." });
  }
  if (!video) {
    errors.push({ fieldName: "video", message: "A video is required." });
  }

  return errors;
};
