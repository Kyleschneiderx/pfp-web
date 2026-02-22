export interface VisitPaymentPeriodic {
	period_label: string;
	complete: number;
	upcoming: number;
	draft: number;
	canceled: number;
	total_count: number;
	total_amount_paid: number;
}

export interface VisitPaymentStatsModel {
	total: number;
	stats: {
		complete: number;
		upcoming: number;
		draft: number;
		canceled: number;
		total_count: number;
		total_amount_paid: number;
	};
	periodic_summary: VisitPaymentPeriodic[];
}
