import type { UserToolsModel, UserToolsResponse } from "@/app/models/user_tools_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getUserTools = async (userId: string): Promise<UserToolsModel | null> => {
	try {
		const url = `/user-tools?user_id=${userId}`;
		const data = await apiServerSide<UserToolsResponse>({ url, method: "GET" });
		return data?.data ?? null;
	} catch {
		return null;
	}
};

export const updateUserTools = async (
	userId: string,
	body: { bladder_diary_enabled: boolean; bowel_diary_enabled: boolean },
): Promise<UserToolsModel> => {
	const url = "/user-tools";
	const data = await apiServerSide<UserToolsResponse>({
		url,
		method: "PUT",
		body: { user_id: Number(userId), ...body },
	});
	return data.data;
};
