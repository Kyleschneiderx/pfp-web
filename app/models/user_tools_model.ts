export interface UserToolsModel {
	user_id: number;
	bladder_diary_enabled: boolean;
	bowel_diary_enabled: boolean;
	created_at: string;
	updated_at: string;
}

export interface UserToolsResponse {
	data: UserToolsModel;
}
