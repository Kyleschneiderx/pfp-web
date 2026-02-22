export interface InvitePeriodic {
  period_label: string;
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

export interface InviteStatsModel {
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
  periodic_summary: InvitePeriodic[];
}

