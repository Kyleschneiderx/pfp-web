import { ownershipToIsOwn } from "@/app/lib/ownership-filter";
import type { CustomForm } from "@/app/models/custom_form_model";
import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";

export type CustomFormSearchQuery = DefaultSearchQuery & {
	ownership?: string;
	is_own?: boolean;
	search?: string;
	filter_column?: string;
};

export const getCustomForms = async (params?: CustomFormSearchQuery): Promise<List<CustomForm>> => {
	const url = "/custom-forms";
	const isOwn = ownershipToIsOwn(params?.ownership);
	const requestParams = { ...params };

	delete requestParams.ownership;

	if (isOwn !== undefined) {
		requestParams.is_own = isOwn;
	}

	const data = await apiServerSide({
		url,
		method: "GET",
		params: requestParams,
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
