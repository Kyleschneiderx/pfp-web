import MeetingRoom from "@/app/components/meeting-room/meeting-room";
import { getMeetingDetails } from "@/app/components/meetings/actions";
import { STATUSES } from "@/app/lib/constants";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const meeting = await getMeetingDetails(id);

	if (!meeting) {
		notFound();
	}

	if (meeting.status_id !== STATUSES.UPCOMING) {
		notFound();
	}

	return <MeetingRoom meeting={meeting} />;
}
