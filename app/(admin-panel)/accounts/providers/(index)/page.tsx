export const dynamic = "force-dynamic";

import { getProviderList } from "@/app/components/providers/actions";
import ProviderList from "@/app/components/providers/provider-list";
import { PAGE_ITEMS, ROLES } from "@/app/lib/constants";
import type { Account } from "@/app/models/accounts";
import type { List } from "@/app/models/global_model";
import type { AccountsSearchQuery } from "@/app/services/server_side/accounts";

export default async function Page({
	searchParams,
}: {
	searchParams?: AccountsSearchQuery;
}) {
	let data: List<Account> | undefined;

	try {
		data = await getProviderList({
			page: searchParams?.page ?? "1",
			page_items: searchParams?.page_items ?? `${PAGE_ITEMS}`,
			role_id: `${ROLES.PROVIDER}`,
			search: searchParams?.search || "",
			sort: "id:DESC",
		});
	} catch (error) {
		console.error(error);
	}

	return (
		<>
			<div>
				<ProviderList data={data} search={searchParams} />{" "}
			</div>
		</>
	);
}
