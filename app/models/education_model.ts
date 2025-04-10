export interface EducationModel {
	id: number;
	title: string;
	description: string;
	content: string;
	photo: string;
	media_url: string | null;
	media_upload: string | null;
	created_at: string;
	updated_at: string;
	status_id: number;
	status: Status;
	pfPlanDayContentId?: number;
	reference_pf_plan_id: number | null;
	categories: EducationCategoryModel[];
}

export interface EducationCategoryModel {
	id: number;
	value: string;
}

interface Status {
	id: number;
	value: string;
}

export interface EducationResponse {
	data: EducationModel[];
	page: number;
	page_items: number;
	max_page: number;
}

export interface CategoryOptionsModel {
	label: string;
	value: string;
}
