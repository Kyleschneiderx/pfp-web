export interface UserCoachPromptStatisticsModel {
	total: number;
	stats: {
		[key: string]: number;
	};
}
