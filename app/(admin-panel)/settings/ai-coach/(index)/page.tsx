import { getAiSettings } from "@/app/components/settings/ai-coach/actions";
import SettingsAiCoachForm from "@/app/components/settings/ai-coach/settings-ai-coach-form";
import type { AiCoachSettingsModel } from "@/app/models/settings_models";

export default async function Page() {
	let data: AiCoachSettingsModel = { prompt: "", initiate_prompt: "", max_tokens: "20000" };
	try {
		const response = await getAiSettings();
		if (response) {
			data = response.data;
		}
	} catch (error) {
		console.error(error);
	}

	return <SettingsAiCoachForm settings={data} />;
}
