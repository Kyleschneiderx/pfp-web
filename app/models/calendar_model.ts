import type { CalendarConnection } from "./accounts";

export interface CalendarConnectionResponse {
	connected: boolean;
	calendar?: CalendarConnection | null;
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
