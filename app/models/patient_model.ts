import type { CustomFormField } from "@/app/models/custom_form_model";

export interface PatientModel {
	id: number;
	email: string;
	last_login_at: string | null;
	verified_at: string | null;
	created_at: string;
	updated_at: string;
	user_profile: UserProfile;
	provider?: PatientModel | null;
	account_type: AccountType;
	user_type: UserType;
	status: Status;
	can_invite: boolean;
}

interface UserProfile {
	name: string;
	birthdate: string | null;
	contact_number: string;
	description: string | null;
	photo: string | null;
	is_pregnant: boolean | null;
	trimester: number | null;
	gender: string | null;
	given_birth_last_six_months: boolean | null;
	months_postpartum: number | null;
}

interface AccountType {
	id: number;
	value: string;
}

interface UserType {
	id: number;
	value: string;
}

interface Status {
	id: number;
	value: string;
}

export interface PatientsResponse {
	data: PatientModel[];
	page: number;
	page_items: number;
	max_page: number;
}

export interface PatientSurveyResponseModel {
	id: number;
	pf_plan_id: number | null;
	day: number | null;
	created_at: string;
	updated_at: string;
	pf_plan: PfPlanInfo | null;
	survey_questions: SurveyQuestionModel[];
	answers: AnswerModel[];
	scores: ScoreModel[];
}

export interface SurveyQuestionModel {
	id: number;
	question: string;
	group_id: string;
	user_survey_question_answer: QuestionAnswer;
}

interface QuestionAnswer {
	yes_no: "yes" | "no";
	if_yes_how_much_bother: string;
	score: number;
}

interface AnswerModel {
	score: number;
	yes_no: "yes" | "no";
	question_id: number;
	if_yes_how_much_bother: string;
}

interface ScoreModel {
	score: number;
	avg_score: number;
	max_score: number;
	final_score: number;
	group_weight: number;
	question_group_id: number;
}

interface PfPlanInfo {
	id: number;
	name: string;
}

export type PatientSurveyModel = PatientSurveyResponseModel;

export interface PatientCustomFormInfo {
	id: number;
	name: string;
	identifier: string;
	version: number;
}

export interface PatientCustomFormAnswerItem {
	question_id: string;
	answer: string;
}

export interface PatientCustomFormAnswerModel {
	id: number;
	user_id: number;
	pf_plan_daily_id: number | null;
	custom_form_id: number;
	created_at: string;
	updated_at: string;
	questions: {
		fields?: CustomFormField[];
		schema?: { fields: CustomFormField[] };
	};
	answers: Record<string, string | string[] | boolean> | PatientCustomFormAnswerItem[];
	custom_form?: PatientCustomFormInfo;
	pf_plan?: PfPlanInfo;
}

export interface PfPlanProgressModel {
	id: number;
	name: string;
	description: string;
	photo: string;
	user_pf_plan_progress_percentage: number;
}
