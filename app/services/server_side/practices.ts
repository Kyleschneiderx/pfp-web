import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";
import type { Practice } from "@/app/models/practice";

export type PracticessSearchQuery = {
	search?: string;
} & DefaultSearchQuery;

export const getPractices = async (params: PracticessSearchQuery): Promise<List<Practice>> => {
	const url = "/practices";
	const data = await apiServerSide({
		url: url,
		method: "GET",
		params,
	});
	return data as List<Practice>;
};

export const getPractice = async (id: string): Promise<Practice> => {
	const url = `/practices/${id}`;
	const data = await apiServerSide({
		url: url,
		method: "GET",
	});
	return data as Practice;
};
