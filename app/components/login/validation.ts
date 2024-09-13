import { validateEmail } from "@/app/lib/utils";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = (
  email: string,
  password?: string,
): ValidationErrorModel[] => {
  const errors: ValidationErrorModel[] = [];

  if (!email.trim()) {
    errors.push({ fieldName: "email", message: "Please enter email address." });
  } else if (!validateEmail(email)) {
    errors.push({ fieldName: "email", message: "Email address is invalid." });
  }

  if (password?.trim() === "") {
    errors.push({ fieldName: "password", message: "Please enter password." });
  }

  return errors;
};
