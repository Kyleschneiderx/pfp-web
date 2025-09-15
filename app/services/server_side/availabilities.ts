import type { Availability } from "@/app/models/availabilities";
import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";

export type AvailabilitySearchQuery = {
	name?: string;
} & DefaultSearchQuery;

export const getAvailabilities = async (params: AvailabilitySearchQuery): Promise<List<Availability>> => {
	const url = "/availabilities";
	const data = await apiServerSide({
		url: url,
		method: "GET",
		params,
	});
	return data as List<Availability>;
};
