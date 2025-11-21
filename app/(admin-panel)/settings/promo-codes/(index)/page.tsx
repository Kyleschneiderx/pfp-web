export const dynamic = "force-dynamic";

import { getPromoCodeList } from "@/app/components/promo-codes/actions";
import PromoCodeList from "@/app/components/promo-codes/promo-code-list";
import { PAGE_ITEMS, ROLES } from "@/app/lib/constants";
import type { List } from "@/app/models/global_model";
import type { PromoCode } from "@/app/models/promo-code";
import type { PromoCodeSearchQuery } from "@/app/services/server_side/promo-codes";

export default async function Page({
	searchParams,
}: {
	searchParams?: PromoCodeSearchQuery;
}) {
	let list: List<PromoCode> | undefined;
	try {
		list = await getPromoCodeList({
			page: "1",
			page_items: searchParams?.page_items ?? `${PAGE_ITEMS}`,
			search: searchParams?.search || "",
			sort: "id:DESC",
		});
	} catch (error) {
		console.error(error);
	}

	return (
		<>
			<div>
				<PromoCodeList list={list} search={searchParams} />
			</div>
		</>
	);
}
