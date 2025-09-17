import type { PatientModel } from "./patient_model";
import type { Schedule } from "./schedules";

export interface Meeting {
	id?: number;
	user_id: number;
	user?: PatientModel;
	schedule_id: number;
	schedule?: Schedule;
	duration: number;
	timezone: string;
	starts_at: string;
	ends_at: string;
}
