import type { Meeting } from "@/app/models/meeting_model";

export interface ChimeMediaPlacement {
	AudioHostUrl: string;
	AudioFallbackUrl: string;
	SignalingUrl: string;
	TurnControlUrl: string;
	ScreenDataUrl: string;
	ScreenViewingUrl: string;
	ScreenSharingUrl: string;
	EventIngestionUrl: string;
}

export interface ChimeMeeting {
	MeetingId: string;
	ExternalMeetingId: string;
	MediaRegion: string;
	MediaPlacement: ChimeMediaPlacement;
	TenantIds: string[];
	MeetingArn: string;
}

export interface ChimeAttendeeCapabilities {
	Audio: string;
	Video: string;
	Content: string;
}

export interface ChimeAttendee {
	ExternalUserId: string;
	AttendeeId: string;
	JoinToken: string;
	Capabilities: ChimeAttendeeCapabilities;
}

/** Response from GET /meetings/:id/session */
export interface ChimeMeetingSessionResponse {
	chime_meeting: ChimeMeeting;
	meeting: Meeting;
	attendee: ChimeAttendee;
}

/** Client shape after mapping `meeting` → merge patch for local state */
export interface MeetingSessionJoinInfo {
	chime_meeting: ChimeMeeting;
	attendee: ChimeAttendee;
	domainMeetingPatch?: Partial<Meeting>;
}
