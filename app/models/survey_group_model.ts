export interface SurveyQuestionModel {
	id: number;
	question: string;
}
export interface SurveyGroupModel {
	id: number;
	description: string;
	questions: SurveyQuestionModel[];
}

export interface CategoryOptionsModel {
	label: string;
	value: string;
}
