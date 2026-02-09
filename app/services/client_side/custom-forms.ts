import { apiClient } from "@/app/services/apiClient";
import type { CustomForm, CustomFormCreateBody, CustomFormUpdateBody } from "@/app/models/custom_form_model";

function unwrap<T>(data: T | { data: T }): T {
	return data && typeof data === "object" && "data" in data ? (data as { data: T }).data : (data as T);
}

export const createCustomForm = async (body: CustomFormCreateBody): Promise<CustomForm> => {
	const result = await apiClient<CustomForm | { data: CustomForm }>({
		url: "/custom-forms",
		method: "POST",
		body,
	});
	return unwrap(result);
};

export const updateCustomForm = async (idOrSlug: number | string, body: CustomFormUpdateBody): Promise<CustomForm> => {
	const result = await apiClient<CustomForm | { data: CustomForm }>({
		url: `/custom-forms/${idOrSlug}`,
		method: "PUT",
		body,
	});
	return unwrap(result);
};

export const deleteCustomForm = async (idOrSlug: number | string): Promise<{ msg: string }> => {
	return apiClient<{ msg: string }>({
		url: `/custom-forms/${idOrSlug}`,
		method: "DELETE",
	});
};
