export interface UserSummaryModel {
  total_users: number;
  periodic_summary: Record<string, MonthlySummary>;
  unique_signups: {
    free: number;
    premium: number;
    total: number;
  };
}

interface MonthlySummary {
  free: number;
  premium: number;
}
