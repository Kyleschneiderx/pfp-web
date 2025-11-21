import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";
import type { PromoCode } from "@/app/models/promo-code";

export type PromoCodeSearchQuery = {
	code?: string;
	search?: string;
} & DefaultSearchQuery;

export const getPromoCodes = async (params: PromoCodeSearchQuery): Promise<List<PromoCode>> => {
	const url = "/promo-codes";
	const data = await apiServerSide({
		url: url,
		method: "GET",
		params,
	});
	return data as List<PromoCode>;
};

export const getPromoCode = async (id: number | string): Promise<PromoCode> => {
	const url = `/promo-codes/${id}`;
	const data = await apiServerSide({
		url: url,
		method: "GET",
	});
	return data as PromoCode;
};
