import type { UserCoachPromptStatisticsModel } from "@/app/models/statistics_model";
import { apiClient } from "@/app/services/apiClient";

export const getUserCoachPromptStatistics = async (params: string): Promise<UserCoachPromptStatisticsModel> => {
	const url = `/stats/user-coach-prompt?${params}`;
	return apiClient<UserCoachPromptStatisticsModel>({ url: url, method: "GET" });
};
