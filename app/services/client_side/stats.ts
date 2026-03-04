import type { UserCoachPromptStatisticsModel } from "@/app/models/statistics_model";
import type { InviteStatsModel } from "@/app/models/invite_stats_model";
import type { VisitPaymentStatsModel } from "@/app/models/visit_payment_stats_model";
import type { PromoCodeStatsModel } from "@/app/models/promo_code_stats_model";
import { apiClient } from "@/app/services/apiClient";

export const getUserCoachPromptStatistics = async (params: string): Promise<UserCoachPromptStatisticsModel> => {
	const url = `/stats/user-coach-prompt?${params}`;
	return apiClient<UserCoachPromptStatisticsModel>({ url: url, method: "GET" });
};

/**
 * Fetch invite statistics with optional time‑series data.
 * @param params Query string (e.g., "period=weekly&date_from=...&date_to=...")
 * @returns InviteStatsModel
 */
export const getInviteStats = async (params: string): Promise<InviteStatsModel> => {
  const url = `/stats/invite?${params}`;
  return apiClient<InviteStatsModel>({ url: url, method: "GET" });
};

/**
 * Fetch visit payment statistics with optional time‑series data.
 * @param params Query string (e.g., "period=weekly&date_from=...&date_to=...")
 * @returns VisitPaymentStatsModel
 */
export const getVisitPaymentStats = async (params: string): Promise<VisitPaymentStatsModel> => {
  const url = `/stats/visit-payment?${params}`;
  return apiClient<VisitPaymentStatsModel>({ url: url, method: "GET" });
};

export const getPromoCodeStats = async (params?: string): Promise<PromoCodeStatsModel> => {
	const query = params ? `?${params}` : "";
	const url = `/stats/promo-code${query}`;
	return apiClient<PromoCodeStatsModel>({ url, method: "GET" });
};
