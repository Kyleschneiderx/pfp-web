export const dynamic = "force-dynamic";

import { getScheduleList } from "@/app/components/schedules/actions";
import ScheduleList from "@/app/components/schedules/schedule-list";
import { PAGE_ITEMS } from "@/app/lib/constants";
import type { List } from "@/app/models/global_model";
import type { Schedule } from "@/app/models/schedules";
import type { ScheduleSearchQuery } from "@/app/services/server_side/schedules";

export default async function Page({
	searchParams,
}: {
	searchParams?: ScheduleSearchQuery;
}) {
	const page = Math.max(1, Number.parseInt(searchParams?.page || "1", 10) || 1);
	const sort = searchParams?.sort || "updated_at:DESC";

	let list: List<Schedule> | undefined;
	try {
		list = await getScheduleList({
			page: `${page}`,
			page_items: searchParams?.page_items ?? `${PAGE_ITEMS}`,
			sort,
		});
	} catch (error) {
		console.error(error);
	}

	const initialList = list?.data ?? [];
	const maxPage = list?.max_page ?? 0;

	return (
		<div>
			<ScheduleList
				initialList={initialList}
				initialPage={page}
				maxPage={maxPage}
				sort={sort}
			/>
		</div>
	);
}
