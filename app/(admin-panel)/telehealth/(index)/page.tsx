import { getMeetingList } from "@/app/components/meetings/actions";
import MeetingList from "@/app/components/meetings/meeting-list";
import { DEFAULT_LIST, PAGE_ITEMS } from "@/app/lib/constants";
import type { List } from "@/app/models/global_model";
import type { Meeting } from "@/app/models/meeting_model";
import type { MeetingsSearchQuery } from "@/app/services/server_side/meetings";

export default async function Page({
	searchParams,
}: {
	searchParams?: MeetingsSearchQuery;
}) {
	let meetings: List<Meeting> | undefined = DEFAULT_LIST;
	let errorMessage = "";

	const displayNoRecord = (msg: string) => {
		return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
	};

	try {
		meetings =
			(await getMeetingList({
				page: searchParams?.page ?? "1",
				page_items: searchParams?.page_items ?? `${PAGE_ITEMS}`,
				search: searchParams?.search || "",
				status_id: searchParams?.status_id || "6",
				sort: "starts_at:ASC",
			})) ?? DEFAULT_LIST;
	} catch (error) {
		errorMessage = (error as Error).message;
	}

	return <MeetingList meetingList={meetings} searchParams={searchParams} />;
}
