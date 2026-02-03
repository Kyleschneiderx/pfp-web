import type { List } from "./global_model";

export interface BladderDiaryTimeSlot {
	time?: string;
	drinks_kind?: string;
	drinks_amount?: string;
	trips_to_bathroom?: number;
	urine_amount?: string;
	accidental_leaks?: boolean;
	strong_urge?: boolean;
	activity?: string;
}

export interface BladderDiaryEntryModel {
	id: number;
	user_id: number;
	diary_date: string;
	time_slots: BladderDiaryTimeSlot[];
	pads_used: number | null;
	diapers_used: number | null;
	created_at: string;
	updated_at: string;
}

export type BladderDiaryListResponse = List<BladderDiaryEntryModel>;
