"use server";

import type { ErrorModel } from "@/app/models/error_model";
import { getPractice, getPractices, type PracticessSearchQuery } from "@/app/services/server_side/practices";

export const getPracticeList = async (params: PracticessSearchQuery) => {
	try {
		return await getPractices(params);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};

export const getPracticeDetails = async (id: string) => {
	try {
		return await getPractice(id);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};
