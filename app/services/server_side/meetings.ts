import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";
import type { Meeting } from "@/app/models/meeting_model";

export type MeetingsSearchQuery = {
	status_id?: string;
	starts_at?: string;
	ends_at?: string;
	status?: string;
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

export const getMeeting = async (slug: number | string): Promise<Meeting> => {
	const url = `/meetings/${slug}`;
	const data = await apiServerSide({
		url: url,
		method: "GET",
	});
	return data as Meeting;
};
