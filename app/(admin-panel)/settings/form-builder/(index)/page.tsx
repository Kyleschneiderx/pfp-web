export const dynamic = "force-dynamic";

import { getCustomFormList } from "@/app/components/form-builder/actions";
import FormBuilderList from "@/app/components/form-builder/form-builder-list";
import { PAGE_ITEMS } from "@/app/lib/constants";
import type { List } from "@/app/models/global_model";
import type { CustomForm } from "@/app/models/custom_form_model";
import type { CustomFormSearchQuery } from "@/app/services/server_side/custom-forms";

export default async function Page({
	searchParams,
}: {
	searchParams?: CustomFormSearchQuery & { search?: string; filter_column?: string };
}) {
	const page = Math.max(1, Number.parseInt(searchParams?.page ?? "1", 10) || 1);
	const sort = searchParams?.sort ?? "created_at:desc";
	const page_items = searchParams?.page_items ?? `${PAGE_ITEMS}`;
	const search = searchParams?.search ?? "";
	const filter_column = searchParams?.filter_column ?? "all";

	let list: List<CustomForm> | undefined;
	try {
		list = await getCustomFormList({
			page: String(page),
			page_items,
			sort,
		});
	} catch (error) {
		console.error(error);
	}

	const forms = list?.data ?? [];
	const maxPage = list?.max_page ?? 1;

	return (
		<FormBuilderList
			initialList={forms}
			initialPage={page}
			maxPage={maxPage}
			sort={sort}
			search={search}
			filterColumn={filter_column}
		/>
	);
}
