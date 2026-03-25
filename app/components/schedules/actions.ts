"use server";

import type { ErrorModel } from "@/app/models/error_model";
import {
	getSchedule,
	getSchedules,
	type ScheduleSearchQuery,
} from "@/app/services/server_side/schedules";

export type { ScheduleSearchQuery };

export const getScheduleList = async (params: ScheduleSearchQuery) => {
	try {
		return await getSchedules(params);
	} catch (error) {
		const apiError = error as ErrorModel;
		console.error(apiError.msg);
	}
};

export const getScheduleDetails = async (id: number | string) => {
	try {
		return await getSchedule(id);
	} catch (error) {
		const apiError = error as ErrorModel;
		console.error(apiError.msg);
	}
};
