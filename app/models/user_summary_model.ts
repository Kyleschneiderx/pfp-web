export interface UserSummaryModel {
	total_users: number;
	total_users_by_type: {
		free: number;
		premium: number;
	};
	periodic_summary: Record<string, MonthlySummary>;
	unique_signups: {
		free: number;
		premium: number;
		total: number;
	};
}

export interface InvitedSummaryModel {
	total_invites: number;
	onboarded: {
		free: number;
		premium: number;
		total: number;
	};
	not_onboarded: {
		free: number;
		premium: number;
		total: number;
	};
}

interface MonthlySummary {
	free: number;
	premium: number;
}
