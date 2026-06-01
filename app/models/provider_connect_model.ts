/**
 * Stripe Express (Connect) onboarding types for providers.
 * Mirrors the API responses from `/api/v1/provider/connect/*`.
 */

/** Current Connect account status as returned by the backend. */
export interface ProviderConnectStatus {
	account_id: string;
	charges_enabled: boolean;
	payouts_enabled: boolean;
	onboarding_completed: boolean;
	requirements_due: string[];
}

/** Hosted onboarding Account Link response. */
export interface ProviderConnectOnboardingLink {
	url: string;
	expires_at: number;
}

/** Single-use Express dashboard login link response. */
export interface ProviderConnectDashboardLink {
	url: string;
}

/** Optional override URLs sent when requesting an onboarding link. */
export interface ProviderConnectOnboardingLinkPayload {
	return_url?: string;
	refresh_url?: string;
}
