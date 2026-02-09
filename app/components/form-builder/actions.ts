"use server";

import type { ErrorModel } from "@/app/models/error_model";
import {
	getCustomForm,
	getCustomForms,
	type CustomFormSearchQuery,
} from "@/app/services/server_side/custom-forms";

export const getCustomFormList = async (params?: CustomFormSearchQuery) => {
	try {
		return await getCustomForms(params);
	} catch (error) {
		const apiError = error as ErrorModel;
		console.error(apiError.msg);
	}
};

export const getCustomFormDetails = async (idOrIdentifier: number | string) => {
	try {
		return await getCustomForm(idOrIdentifier);
	} catch (error) {
		const apiError = error as ErrorModel;
		console.error(apiError.msg);
	}
};
