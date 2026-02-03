import type { UserToolsModel, UserToolsResponse } from "@/app/models/user_tools_model";
import { apiClient } from "@/app/services/apiClient";

export const updateUserTools = async (
	userId: number,
	body: { bladder_diary_enabled: boolean; bowel_diary_enabled: boolean },
): Promise<UserToolsModel> => {
	const url = "/user-tools";
	const data = await apiClient<UserToolsResponse>({
		url,
		method: "PUT",
		body: { user_id: userId, ...body },
	});
	return data.data;
};
