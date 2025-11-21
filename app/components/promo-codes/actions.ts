"use server";

import type { ErrorModel } from "@/app/models/error_model";
import { getPromoCode, getPromoCodes, type PromoCodeSearchQuery } from "@/app/services/server_side/promo-codes";

export const getPromoCodeList = async (params: PromoCodeSearchQuery) => {
	try {
		return await getPromoCodes(params);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};

export const getPromoCodeDetails = async (id: number | string) => {
	try {
		return await getPromoCode(id);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};
