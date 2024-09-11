import { validateEmail, validateName } from "@/app/lib/utils";

export interface ValidationError {
  fieldName: string;
  message: string;
}

export const validateForm = (
  name: string,
  email: string,
  contact: string,
  birthdate: Date | null
): ValidationError[] => {
  const errors: ValidationError[] = [];

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

  if (!contact.trim()) {
    errors.push({ fieldName: "contact", message: "Contact number is required." });
  }

  if (!birthdate) {
    errors.push({ fieldName: "birthdate", message: "Date of birth is required." });
  }

  return errors;
};