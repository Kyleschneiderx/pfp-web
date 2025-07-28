import type { AiCoachSettingsModel } from "@/app/models/settings_models";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getAiCoachSettings = async (): Promise<{ data: AiCoachSettingsModel }> => {
	const url = "/settings/ai-coach";
	const data = await apiServerSide({
		url: url,
		method: "GET",
	});
	return data as { data: AiCoachSettingsModel };
};
