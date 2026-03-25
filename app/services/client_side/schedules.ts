import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiClient } from "@/app/services/apiClient";
import type { Schedule } from "@/app/models/schedules";

export type ScheduleSearchQuery = {
	name?: string;
} & DefaultSearchQuery;

export const getSchedules = async (
	params: ScheduleSearchQuery,
): Promise<List<Schedule>> => {
	const data = await apiClient<List<Schedule>>({
		url: "/schedules/",
		method: "GET",
		params,
	});
	return data;
};

export const getSchedule = async (id: number | string): Promise<Schedule> => {
	return apiClient<Schedule>({
		url: `/schedules/${id}`,
		method: "GET",
	});
};

export const saveSchedule = async ({
	method,
	id,
	body,
}: { method: "POST" | "PUT"; id: number | undefined; body: Schedule }): Promise<Schedule> => {
	const url = `/schedules/${id ?? ""}`;

	return apiClient<Schedule>({
		url: url,
		method: method,
		body: body,
	});
};

export const deleteSchedule = async (id: number): Promise<{ msg: string }> => {
	const url = `/schedules/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
