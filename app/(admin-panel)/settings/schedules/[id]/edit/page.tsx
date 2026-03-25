import ScheduleForm from "@/app/components/schedules/schedule-form";
import { getScheduleDetails } from "@/app/components/schedules/actions";
import { notFound } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const schedule = await getScheduleDetails(id);

	if (!schedule?.id) {
		notFound();
	}

	return <ScheduleForm variant="page" defaultSchedule={schedule} />;
}
