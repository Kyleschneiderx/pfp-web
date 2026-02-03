import type { BowelDiaryListResponse } from "@/app/models/bowel_diary_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getBowelDiaryList = async (params: string): Promise<BowelDiaryListResponse> => {
	const url = `/bowel-diaries?${params}`;
	const data = await apiServerSide<BowelDiaryListResponse>({ url, method: "GET" });
	return data as BowelDiaryListResponse;
};
