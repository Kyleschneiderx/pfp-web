import type { CalendarConnection } from "./accounts";

export interface CalendarConnectionResponse {
	connected: boolean;
	providers?: CalendarConnection[] | null;
	message?: string;
}

export interface CalendarAuthResponse {
	auth_url: string;
	state: string;
	message?: string;
}

export interface CalendarDisconnectResponse {
	message: string;
}

export interface CalendarSyncDetail {
	meeting_id: number;
	meeting_slug: string;
	starts_at: string;
	ends_at: string;
	status: string | null;
	error: string | null;
	event_id?: string;
}

export interface CalendarSyncResponse {
	synced: number;
	updated: number;
	errors: number;
	total: number;
	details: CalendarSyncDetail[];
}

export interface CalendarUnsyncDetail {
	meeting_id: number;
	meeting_slug: string;
	event_id: string;
	status: string | null;
	error: string | null;
}

export interface CalendarUnsyncResponse {
	unsynced: number;
	errors: number;
	total: number;
	details: CalendarUnsyncDetail[];
}
