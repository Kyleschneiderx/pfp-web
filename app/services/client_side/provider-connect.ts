import type {
	ProviderConnectDashboardLink,
	ProviderConnectOnboardingLink,
	ProviderConnectOnboardingLinkPayload,
	ProviderConnectStatus,
} from "@/app/models/provider_connect_model";
import { apiClient } from "@/app/services/apiClient";

/**
 * Provider-connect routes live under `/api/v1/provider/connect`, while the rest of the
 * admin panel targets `/api/admin`. Derive the `/api/v1` root from the configured base URL.
 */
const ADMIN_SUFFIX = "/api/admin";
const API_SUFFIX = "/api";

function getV1BaseUrl(): string {
	const trimmed = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
	let root = trimmed;
	if (trimmed.endsWith(ADMIN_SUFFIX)) {
		root = trimmed.slice(0, -ADMIN_SUFFIX.length);
	} else if (trimmed.endsWith(API_SUFFIX)) {
		root = trimmed.slice(0, -API_SUFFIX.length);
	}
	return `${root}/api/v1`;
}

const PROVIDER_CONNECT_PATH = "/provider/connect";

/** Create (or return the existing) Stripe Express connected account for the current provider. */
export const createConnectAccount = async (): Promise<ProviderConnectStatus> => {
	return apiClient<ProviderConnectStatus>({
		url: `${PROVIDER_CONNECT_PATH}/account`,
		method: "POST",
		baseUrl: getV1BaseUrl(),
	});
};

/** Fetch the current provider's Connect status. Throws a 404 error when no account exists yet. */
export const getConnectAccountStatus = async (): Promise<ProviderConnectStatus> => {
	return apiClient<ProviderConnectStatus>({
		url: `${PROVIDER_CONNECT_PATH}/account`,
		method: "GET",
		baseUrl: getV1BaseUrl(),
	});
};

/** Create a hosted onboarding Account Link to complete (or resume) enrollment. */
export const createOnboardingLink = async (
	payload?: ProviderConnectOnboardingLinkPayload,
): Promise<ProviderConnectOnboardingLink> => {
	return apiClient<ProviderConnectOnboardingLink>({
		url: `${PROVIDER_CONNECT_PATH}/onboarding-link`,
		method: "POST",
		body: payload,
		baseUrl: getV1BaseUrl(),
	});
};

/** Create a single-use login link to the provider's Stripe Express dashboard. */
export const createDashboardLink = async (): Promise<ProviderConnectDashboardLink> => {
	return apiClient<ProviderConnectDashboardLink>({
		url: `${PROVIDER_CONNECT_PATH}/dashboard-link`,
		method: "POST",
		baseUrl: getV1BaseUrl(),
	});
};
