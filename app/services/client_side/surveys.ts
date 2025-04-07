import type { SurveyGroupModel } from "@/app/models/survey_group_model";

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
