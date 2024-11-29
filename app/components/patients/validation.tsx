import { validateEmail, validateName } from "@/app/lib/utils";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = ({
  name,
  email,
}: {
  name: string;
  email: string;
}): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!name.trim()) {
    errors.push({ fieldName: "name", message: "Patient name is required." });
  } else if (!validateName(name)) {
    errors.push({ fieldName: "name", message: "Name is invalid." });
  }

  if (!email.trim()) {
    errors.push({ fieldName: "email", message: "Email address is required." });
  } else if (!validateEmail(email)) {
    errors.push({ fieldName: "email", message: "Email address is invalid." });
  }

  return errors;
};
