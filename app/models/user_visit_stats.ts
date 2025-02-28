type PagesDetails = {
    page: string,
    label: string,
    total: number,
    percentage: number
}

export interface UserVisitStatsModel {
    total: number;
    pages: PagesDetails[];
  }
  