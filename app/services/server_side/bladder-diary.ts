import type { BladderDiaryListResponse } from "@/app/models/bladder_diary_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getBladderDiaryList = async (params: string): Promise<BladderDiaryListResponse> => {
	const url = `/bladder-diaries?${params}`;
	const data = await apiServerSide<BladderDiaryListResponse>({ url, method: "GET" });
	return data as BladderDiaryListResponse;
};
