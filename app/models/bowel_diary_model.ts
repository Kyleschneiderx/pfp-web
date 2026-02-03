import type { List } from "./global_model";

export interface BowelDiaryTimeSlot {
	time?: string;
	food_drink_medication?: string;
	bowel_movement?: boolean;
	bowel_urgency?: number;
	pains_discomfort?: number;
	stool_type?: number;
	accidents_leakage?: boolean;
}

export interface BowelDiaryEntryModel {
	id: number;
	user_id: number;
	diary_date: string;
	woke_up_at: string | null;
	went_to_sleep_at: string | null;
	time_slots: BowelDiaryTimeSlot[];
	created_at: string;
	updated_at: string;
}

export type BowelDiaryListResponse = List<BowelDiaryEntryModel>;
