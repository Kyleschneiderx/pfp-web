"use server";

import type { ErrorModel } from "@/app/models/error_model";
import { getMeetings, type MeetingsSearchQuery } from "@/app/services/server_side/meetings";

export const getMeetingList = async (params: MeetingsSearchQuery) => {
	try {
		return await getMeetings(params);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};
