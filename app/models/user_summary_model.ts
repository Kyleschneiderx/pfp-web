export interface UserSummaryModel {
  total_users: number;
  periodic_summary: {
    Jan: MonthlySummary;
    Feb: MonthlySummary;
    Mar: MonthlySummary;
    Apr: MonthlySummary;
    May: MonthlySummary;
    Jun: MonthlySummary;
    Jul: MonthlySummary;
    Aug: MonthlySummary;
    Sep: MonthlySummary;
    Oct: MonthlySummary;
    Nov: MonthlySummary;
    Dec: MonthlySummary;
  };
  unique_signups: {
    free: number;
    premium: number;
  };
}

interface MonthlySummary {
  free: number;
  premium: number;
  total: number;
}
