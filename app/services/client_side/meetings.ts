import { apiClient } from "@/app/services/apiClient";
import type { CompleteMeetingForm, DraftMeetingForm, Meeting, MeetingForm } from "@/app/models/meeting_model";

export const cancelMeeting = async (id: number): Promise<Meeting> => {
	const url = `/meetings/${id}/cancel`;

	return apiClient<Meeting>({
		url: url,
		method: "PUT",
	});
};

export const draftMeeting = async ({
	id,
	body,
}: { id: number; body: Omit<DraftMeetingForm, "status_id"> }): Promise<Meeting> => {
	const url = `/meetings/${id}/draft`;

	return apiClient<Meeting>({
		url: url,
		method: "PUT",
		body: body,
	});
};

export const completeMeeting = async ({
	id,
	body,
}: { id: number; body: Omit<CompleteMeetingForm, "status_id"> }): Promise<Meeting> => {
	const url = `/meetings/${id}/complete`;

	return apiClient<Meeting>({
		url: url,
		method: "PUT",
		body: body,
	});
};
