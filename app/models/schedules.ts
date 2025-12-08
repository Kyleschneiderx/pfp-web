import type { PatientModel } from "./patient_model";

export interface Availability {
	day: number;
	starts_at: string | Date | null;
	ends_at: string | Date | null;
}

export interface Schedule {
	id?: number;
	user_id?: number;
	user?: PatientModel;
	description?: string;
	timezone: string;
	duration: number;
	is_active?: boolean;
	availabilities: Availability[];
}
