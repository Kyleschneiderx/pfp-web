"use server";

import type { ErrorModel } from "@/app/models/error_model";
import { type AvailabilitySearchQuery, getAvailabilities } from "@/app/services/server_side/availabilities";
import { getSchedules, type ScheduleSearchQuery } from "@/app/services/server_side/schedules";

export const getAvailabilityList = async (params: AvailabilitySearchQuery) => {
	try {
		return await getAvailabilities(params);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};

export const getScheduleList = async (params: ScheduleSearchQuery) => {
	try {
		return await getSchedules(params);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};
