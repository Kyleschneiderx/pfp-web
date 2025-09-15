import { CategoryOptionsModel } from "@/app/models/exercise_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";

export const validateForm = ({
	name,
	category,
	photo,
	video,
	sets,
	reps,
	hold,
	rest,
}: {
	name: string;
	category: CategoryOptionsModel | null | undefined;
	photo?: any;
	video?: any;
	sets: number;
	reps: number;
	hold: number;
	rest: number;
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

	if (!sets || sets <= 0) {
		errors.push({ fieldName: "sets", message: "No. of sets should be greater than zero." });
	}

	if (!reps || reps <= 0) {
		errors.push({ fieldName: "reps", message: "No. of reps should be greater than zero." });
	}

	if (!rest || rest <= 0) {
		errors.push({ fieldName: "hold", message: "No. of rest should be greater than zero." });
	}

	return errors;
};
