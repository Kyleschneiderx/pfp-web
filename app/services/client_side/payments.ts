import type { VisitPrice } from "@/app/models/payments";
import { apiClient } from "../apiClient";

export const getVisitPrices = async (): Promise<VisitPrice[]> => {
	const url = "/payments/prices/visit";

	return (
		await apiClient<{ data: VisitPrice[] }>({
			url: url,
			method: "GET",
		})
	).data;
};
