"use server";

import type { ErrorModel } from "@/app/models/error_model";
import { getAiCoachSettings } from "@/app/services/server_side/settings";

export const getAiSettings = async () => {
	try {
		return await getAiCoachSettings();
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};
