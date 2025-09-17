import Button from "@/app/components/elements/Button";
import Card from "@/app/components/elements/Card";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
import SearchCmp from "@/app/components/elements/SearchCmp";
import Table from "@/app/components/elements/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/elements/Tabs";
import { fetchExercises } from "@/app/components/exercises/actions";
import ExerciseFilterSort from "@/app/components/exercises/exercise-filter-sort";
import ExerciseList from "@/app/components/exercises/exercise-list";
import { getAvailabilityList, getScheduleList } from "@/app/components/schedules/actions";
import AvailabilityList from "@/app/components/schedules/availability-list";
import ScheduleList from "@/app/components/schedules/schedule-list";
import { useModal } from "@/app/contexts/ModalContext";
import { DEFAULT_LIST, PAGE_ITEMS } from "@/app/lib/constants";
import type { Availability } from "@/app/models/availabilities";
import type { List } from "@/app/models/global_model";
import type { Schedule } from "@/app/models/schedules";
import type { AvailabilitySearchQuery } from "@/app/services/server_side/availabilities";
import type { ScheduleSearchQuery } from "@/app/services/server_side/schedules";
import { redirect } from "next/navigation";

export default async function Page({
	searchParams,
}: {
	searchParams?: (AvailabilitySearchQuery | ScheduleSearchQuery) & { tab: string };
}) {
	let availabilities: List<Availability> = DEFAULT_LIST;
	let errorMessage = "";
	let schedules: List<Schedule> = DEFAULT_LIST;

	const displayNoRecord = (msg: string) => {
		return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
	};

	try {
		const settlement = await Promise.allSettled([
			getAvailabilityList({
				page: "1",
				page_items: `${PAGE_ITEMS}`,
				// ...searchParams,
			}),
			getScheduleList({
				page: "1",
				page_items: `${PAGE_ITEMS}`,
				// ...searchParams,
			}),
		]);

		availabilities = settlement[0].status === "fulfilled" ? (settlement[0].value ?? DEFAULT_LIST) : availabilities;
		schedules = settlement[1].status === "fulfilled" ? (settlement[1].value ?? DEFAULT_LIST) : schedules;
	} catch (error) {
		errorMessage = (error as Error).message;
	}

	return (
		<>
			<Tabs defaultValue={"schedule"} orientation="horizontal">
				<TabsList className="flex mb-3">
					<TabsTrigger value={"schedule"}>Schedule</TabsTrigger>
					<TabsTrigger value={"availability"}>Availability</TabsTrigger>
				</TabsList>

				<TabsContent value="schedule">
					<ScheduleList scheduleList={schedules} />
				</TabsContent>
				<TabsContent value="availability">
					<AvailabilityList availabilityList={availabilities} />
				</TabsContent>
			</Tabs>
		</>
	);
}
