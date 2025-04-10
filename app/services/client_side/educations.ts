import type { EducationResponse, EducationCategoryModel } from "@/app/models/education_model";
import { apiClient } from "@/app/services/apiClient";

interface FormEducationParams {
	method: "POST" | "PUT";
	id?: number | null;
	body: FormData;
}

interface EducationCategoriesResponse {
	data: {
		education_category: EducationCategoryModel[];
	};
}

export const saveEducation = async ({ method, id, body }: FormEducationParams): Promise<{ msg: string }> => {
	const url = `/educations/${id ?? ""}`;

	return apiClient<{ msg: string }>({
		url: url,
		method: method,
		body: body,
	});
};

export const deleteEducation = async (id: number): Promise<{ msg: string }> => {
	const url = `/educations/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};

export const getEducations = async (params: string): Promise<EducationResponse> => {
	const url = `/educations?${params}`;
	const data = await apiClient({
		url: url,
		method: "GET",
	});
	return data as EducationResponse;
};
