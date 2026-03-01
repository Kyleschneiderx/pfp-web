export const dynamic = "force-dynamic";

import { getPromoCodeList } from "@/app/components/promo-codes/actions";
import PromoCodeList from "@/app/components/promo-codes/promo-code-list";
import { PAGE_ITEMS } from "@/app/lib/constants";
import type { List } from "@/app/models/global_model";
import type { PromoCode } from "@/app/models/promo-code";
import type { PromoCodeSearchQuery } from "@/app/services/server_side/promo-codes";

export default async function Page({
	searchParams,
}: {
	searchParams?: PromoCodeSearchQuery;
}) {
	const page = Math.max(1, Number.parseInt(searchParams?.page || "1", 10) || 1);
	const search = searchParams?.search || "";
	const sort = searchParams?.sort || "id:DESC";

	let list: List<PromoCode> | undefined;
	try {
		list = await getPromoCodeList({
			page: `${page}`,
			page_items: searchParams?.page_items ?? `${PAGE_ITEMS}`,
			search,
			sort,
		});
	} catch (error) {
		console.error(error);
	}

	const initialList = list?.data ?? [];
	const maxPage = list?.max_page ?? 0;

	return (
		<div>
			<PromoCodeList
				initialList={initialList}
				initialPage={page}
				maxPage={maxPage}
				search={search}
				sort={sort}
			/>
		</div>
	);
}
