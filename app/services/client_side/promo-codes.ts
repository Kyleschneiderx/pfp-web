import { apiClient } from "@/app/services/apiClient";
import type { PromoCode, PromoCodeFormSchema } from "@/app/models/promo-code";

export const savePromoCode = async ({
	method,
	id,
	body,
}: { method: "POST" | "PUT"; id: number | undefined; body: PromoCodeFormSchema }): Promise<PromoCode> => {
	const url = `/promo-codes/${id ?? ""}`;

	return apiClient<PromoCode>({
		url: url,
		method: method,
		body: body,
	});
};

export const deletePromoCode = async (id: number): Promise<{ msg: string }> => {
	const url = `/promo-codes/${id}`;
	return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
