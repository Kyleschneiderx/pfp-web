export interface AvailabilityRule {
	id?: number;
	day: number;
	starts_at: string | Date | null;
	ends_at: string | Date | null;
}

export interface Availability {
	id?: number;
	name: string;
	timezone: string;
	rules: AvailabilityRule[];
}
