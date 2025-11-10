"use server";

import type { ErrorModel } from "@/app/models/error_model";
import { type AccountsSearchQuery, getAccount, getAccounts } from "@/app/services/server_side/accounts";

export const getProviderList = async (params: AccountsSearchQuery) => {
	try {
		return await getAccounts(params);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};

export const getProviderDetails = async (id: string) => {
	try {
		return await getAccount(id);
	} catch (error) {
		const apiError = error as ErrorModel;

		console.error(apiError.msg);
	}
};
