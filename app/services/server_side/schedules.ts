import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";
import type { Schedule } from "@/app/models/schedules";

export type ScheduleSearchQuery = {
	name?: string;
} & DefaultSearchQuery;

export const getSchedules = async (params: ScheduleSearchQuery): Promise<List<Schedule>> => {
	const url = "/schedules";
	const data = await apiServerSide({
		url: url,
		method: "GET",
		params,
	});
	return data as List<Schedule>;
};

export const getSchedule = async (id: number | string): Promise<Schedule> => {
	const data = await apiServerSide({
		url: `/schedules/${id}`,
		method: "GET",
	});
	return data as Schedule;
};
