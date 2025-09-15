import type { Availability, AvailabilityRule } from "./availabilities";

export interface Schedule {
	id?: number;
	name: string;
	description: string;
	slug?: string;
	invite_url?: string;
	duration: number;
	availability_id: number | null;
	availability?: Availability;
	availability_metadata: AvailabilityRule[];
}
