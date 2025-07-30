import SettingsAiCoachForm from "@/app/components/settings/ai-coach/settings-ai-coach-form";
import type { AiCoachSettingsModel } from "@/app/models/settings_models";
import { getAiCoachSettings } from "@/app/services/server_side/settings";

export default async function Page() {
	let data: AiCoachSettingsModel = { prompt: "", initiate_prompt: "", max_tokens: "20000" };
	try {
		const response = await getAiCoachSettings();
		data = response.data;
	} catch (error) {
		console.error(error);
	}

	return <SettingsAiCoachForm settings={data} />;
}
