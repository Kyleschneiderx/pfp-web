import type { Selection } from "@/app/models/selection_model";
import { apiClient } from "../apiClient";

export const getSelections = async (params: Record<string, any>): Promise<Selection> => {
	const url = "/selections";
	const response = apiClient<{ data: Selection }>({ url: url, method: "GET", params });

	return (await response).data;
};
