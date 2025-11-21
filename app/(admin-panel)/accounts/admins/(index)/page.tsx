export const dynamic = "force-dynamic";

import { getAdminList } from "@/app/components/admins/actions";
import AdminList from "@/app/components/admins/admin-list";
import { PAGE_ITEMS, ROLES } from "@/app/lib/constants";
import type { Account } from "@/app/models/accounts";
import type { List } from "@/app/models/global_model";
import type { AccountsSearchQuery } from "@/app/services/server_side/accounts";

export default async function Page({
	searchParams,
}: {
	searchParams?: AccountsSearchQuery;
}) {
	let admins: List<Account> | undefined;
	try {
		admins = await getAdminList({
			page: "1",
			page_items: searchParams?.page_items ?? `${PAGE_ITEMS}`,
			role_id: `${ROLES.ADMIN}`,
			search: searchParams?.search || "",
			sort: "id:DESC",
		});
	} catch (error) {
		console.error(error);
	}

	return (
		<>
			<div>
				<AdminList data={admins} search={searchParams} />
			</div>
		</>
	);
}
