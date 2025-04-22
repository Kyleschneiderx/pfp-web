import type { SurveyGroupModel, SurveyQuestionModel } from "@/app/models/survey_group_model";

import { apiClient } from "@/app/services/apiClient";

interface SurveyGroupResponse {
	data: {
		survey_group: SurveyGroupModel[];
	};
}

export const getSurveyGroups = async (): Promise<SurveyGroupModel[]> => {
	const url = "/selections?survey_groups";
	const data: SurveyGroupResponse = await apiClient({
		url: url,
		method: "GET",
	});
	return data.data.survey_group;
};

export const getSurveyQuestions = async (): Promise<SurveyQuestionModel[]> => {
	const url = "/misc/survey";
	const data: SurveyQuestionModel[] = await apiClient({
		url: url,
		method: "GET",
	});
	return data;
};

export const saveSurveyGroup = async (
	method: "POST" | "PUT",
	id: number | undefined,
	body: { description: string; question_id: number[] },
): Promise<SurveyGroupModel> => {
	const url = `/selections/content-categories/${id ?? ""}`;
	return await apiClient<SurveyGroupModel>({ url: url, method: method, body: body });
};

export const deleteSurveyGroup = async (id: number): Promise<{ msg: string }> => {
	const url = `/selections/content-categories/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
