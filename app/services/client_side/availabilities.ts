import type { Availability } from "@/app/models/availabilities";
import { apiClient } from "@/app/services/apiClient";

export const saveAvailability = async ({
	method,
	id,
	body,
}: { method: "POST" | "PUT"; id: number | undefined; body: Availability }): Promise<Availability> => {
	const url = `/availabilities/${id ?? ""}`;

	return apiClient<Availability>({
		url: url,
		method: method,
		body: body,
	});
};

export const deleteAvailability = async (id: number): Promise<{ msg: string }> => {
	const url = `/availabilities/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
