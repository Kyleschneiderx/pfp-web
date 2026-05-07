import type { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = ({
	name,
	description,
	content,
	photo: _photo,
}: {
	name: string;
	description: string;
	content: string;
	photo?: any;
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

	if (!content) {
		errors.push({ fieldName: "content", message: "Please enter a content." });
	}

	return errors;
};
