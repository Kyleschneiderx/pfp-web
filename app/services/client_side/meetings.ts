import { apiClient } from "@/app/services/apiClient";
import type { Meeting, MeetingForm } from "@/app/models/meeting_model";

export const updateMeeting = async ({ id, body }: { id: number | undefined; body: MeetingForm }): Promise<Meeting> => {
	const url = `/meetings/${id}`;

	return apiClient<Meeting>({
		url: url,
		method: "PUT",
		body: body,
	});
};
