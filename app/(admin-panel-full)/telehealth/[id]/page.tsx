import MeetingRoom from "@/app/components/meeting-room/meeting-room";
import { getMeetingDetails } from "@/app/components/meetings/actions";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const meeting = await getMeetingDetails(id);

	if (!meeting) {
		notFound();
	}

	return <MeetingRoom meeting={meeting} />;
}
