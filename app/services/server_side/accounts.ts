import type { DefaultSearchQuery, List } from "@/app/models/global_model";
import { apiServerSide } from "../apiServerSide";
import type { Account } from "@/app/models/accounts";

export type AccountsSearchQuery = {
	search?: string;
	role_id?: string;
} & DefaultSearchQuery;

export const getAccounts = async (params: AccountsSearchQuery): Promise<List<Account>> => {
	const url = "/accounts";
	const data = await apiServerSide({
		url: url,
		method: "GET",
		params,
	});
	return data as List<Account>;
};

export const getAccount = async (id: string): Promise<Account> => {
	const url = `/accounts/${id}`;
	const data = await apiServerSide({
		url: url,
		method: "GET",
	});
	return data as Account;
};
