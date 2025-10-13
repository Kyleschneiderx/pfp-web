import { getMeetingDetails } from "@/app/components/meetings/actions";
import { STATUSES } from "@/app/lib/constants";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

const MeetingRoom = dynamic(() => import("@/app/components/meeting-room/meeting-room"), {
	ssr: false,
});

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const meeting = await getMeetingDetails(id);

	if (!meeting) {
		notFound();
	}

	if (meeting.status_id === STATUSES.COMPLETE) {
		notFound();
	}

	return <MeetingRoom meeting={meeting} />;
}
