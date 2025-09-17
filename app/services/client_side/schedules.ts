import { apiClient } from "@/app/services/apiClient";
import type { Schedule } from "@/app/models/schedules";

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
