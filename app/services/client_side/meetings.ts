import type { List } from "@/app/models/global_model";
import type {
	CompleteMeetingForm,
	DraftMeetingForm,
	Meeting,
	MeetingForm,
	MeetingSoapNotes,
} from "@/app/models/meeting_model";
import type { VisitPaymentStatsModel } from "@/app/models/visit_payment_stats_model";
import { apiClient } from "@/app/services/apiClient";

export const getMeetingsList = async (params: string): Promise<List<Meeting>> => {
	const url = `/meetings?${params}`;
	return apiClient<List<Meeting>>({ url, method: "GET" });
};

export const getVisitPaymentSummary = async (params: string): Promise<VisitPaymentStatsModel> => {
	const url = `/stats/visit-payment?${params}`;
	return apiClient<VisitPaymentStatsModel>({ url: url, method: "GET" });
};

export const getMeeting = async (slug: number | string): Promise<Meeting> => {
	const url = `/meetings/${slug}`;
	const data = await apiClient({
		url: url,
		method: "GET",
	});
	return data as Meeting;
};

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

export const transcribeMeeting = async (id: number): Promise<{ msg: string }> => {
	const url = `/meetings/${id}/transcribe`;

	return apiClient<{ msg: string }>({
		url: url,
		method: "POST",
	});
};

export const generateSoapNotes = async (id: number): Promise<MeetingSoapNotes> => {
	const url = `/meetings/${id}/generate-soap-notes`;

	return apiClient<MeetingSoapNotes>({
		url: url,
		method: "POST",
	});
};
