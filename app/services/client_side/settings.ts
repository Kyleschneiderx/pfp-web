import type { AiCoachSettingsModel } from "@/app/models/settings_models";
import { apiClient } from "@/app/services/apiClient";

export const updateAiCoachSettings = async (
	payload: AiCoachSettingsModel,
): Promise<{ id: number; key: string; value: string }[]> => {
	const url = "/settings/ai-coach";
	const data = await apiClient({
		url: url,
		method: "PUT",
		body: payload,
	});
	return data as { id: number; key: string; value: string }[];
};
