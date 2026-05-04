import type { PatientModel } from "./patient_model";
import type { Schedule } from "./schedules";
import type { Status } from "./status_model";

export interface MeetingSoapNotesIcdCodes {
	code: string;
	name: string;
}

export interface MeetingSoapNotesCptCodes {
	code: string;
	name: string;
	duration: number;
}

export interface MeetingSoapNotes {
	subjective?: string;
	objective?: string;
	assessment?: string;
	progress?: string;
	icd_codes?: MeetingSoapNotesIcdCodes[];
	cpt_codes?: MeetingSoapNotesCptCodes[];
}

export interface TranscriptionSegment {
	speaker: "provider" | "patient";
	start: number;
	end: number;
	text: string;
}

export interface MeetingTranscription {
	total_duration: number;
	provider_segments: TranscriptionSegment[];
	patient_segments: TranscriptionSegment[];
	provider_duration: number;
	patient_duration: number;
}

export interface Meeting {
	id?: number;
	user_id: number;
	user_profile?: PatientModel["user_profile"];
	slug: string;
	schedule_id: number;
	schedule?: Schedule;
	duration: number;
	timezone: string;
	has_patient_entered: boolean;
	starts_at: string;
	ends_at: string;
	status_id: number;
	soap_notes: MeetingSoapNotes;
	transcription?: MeetingTranscription;
	status: Status;
	chime_meeting_id?: string | null;
	chime_media_pipeline_id?: string | null;
}

export interface MeetingForm {
	id?: number;
	soap_notes?: MeetingSoapNotes;
}
export interface DraftMeetingForm extends MeetingForm {
	status_id: 7;
}

export interface CompleteMeetingForm extends MeetingForm {
	status_id: 8;
}
