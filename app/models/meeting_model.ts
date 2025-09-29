import type { PatientModel } from "./patient_model";
import type { Schedule } from "./schedules";
import type { Status } from "./status_model";

export interface MeetingSoapNotes {
	subjective?: string;
	objective?: string;
	assestment?: string;
	progress?: string;
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
	starts_at: string;
	ends_at: string;
	status_id: number;
	soap_notes: MeetingSoapNotes;
	status: Status;
}

export interface MeetingForm {
	id?: number;
	status_id?: number;
	soap_notes?: MeetingSoapNotes;
}
