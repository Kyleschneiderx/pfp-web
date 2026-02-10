import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";
import type { CustomForm } from "@/app/models/custom_form_model";

export type CustomFormSearchQuery = DefaultSearchQuery;

export const getCustomForms = async (params?: CustomFormSearchQuery): Promise<List<CustomForm>> => {
	const url = "/custom-forms";
	const data = await apiServerSide({
		url,
		method: "GET",
		params,
	});
	return data as List<CustomForm>;
};

export const getCustomForm = async (idOrSlug: number | string): Promise<CustomForm> => {
	const url = `/custom-forms/${idOrSlug}`;
	const data = await apiServerSide({
		url,
		method: "GET",
	});
	const result = data as { data?: CustomForm } | CustomForm;
	return "data" in result && result.data ? result.data : (result as CustomForm);
};
