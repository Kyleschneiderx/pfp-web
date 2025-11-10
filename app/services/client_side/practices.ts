import { apiClient } from "@/app/services/apiClient";
import type { Practice } from "@/app/models/practice";
import type { List } from "@/app/models/global_model";
import type { PracticessSearchQuery } from "../server_side/practices";

export const getPractices = async (params: PracticessSearchQuery): Promise<List<Practice>> => {
	const url = "/practices";
	const data = await apiClient({
		url: url,
		method: "GET",
		params,
	});
	return data as List<Practice>;
};

export const savePractice = async ({
	method,
	id,
	body,
}: { method: "POST" | "PUT"; id: number | undefined; body: FormData }): Promise<Practice> => {
	const url = `/practices/${id ?? ""}`;

	return apiClient<Practice>({
		url: url,
		method: method,
		body: body,
	});
};

export const deletePractice = async (id: number): Promise<{ msg: string }> => {
	const url = `/practices/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
