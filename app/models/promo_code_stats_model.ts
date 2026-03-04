export interface PromoCodeStatsModel {
	total_promo_codes: number;
	unique_users_claimed: number;
	total_claims: number;
	total_vouchers_generated: number;
	promo_codes_at_capacity: number;
	active_promo_codes: number;
	expired_promo_codes?: number;
}
