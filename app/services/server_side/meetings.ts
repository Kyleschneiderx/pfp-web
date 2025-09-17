import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";
import type { Meeting } from "@/app/models/meetings";

export type MeetingsSearchQuery = {
	starts_at?: string;
	ends_at?: string;
	search?: string;
} & DefaultSearchQuery;

export const getMeetings = async (params: MeetingsSearchQuery): Promise<List<Meeting>> => {
	const url = "/meetings";
	const data = await apiServerSide({
		url: url,
		method: "GET",
		params,
	});
	return data as List<Meeting>;
};
