export interface PatientModel {
  id: number;
  email: string;
  last_login_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  user_profile: UserProfile;
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

export interface PatientSurveyModel {
  id: number;
  question: string;
  user_survey_question_answer: QuestionAnswer | null;
}

interface QuestionAnswer {
  yes_no: "yes" | "no";
  if_yes_how_much_bother: string;
}

export interface PfPlanProgressModel {
  id: number;
  name: string;
  description: string;
  photo: string;
  user_pf_plan_progress_percentage: number;
}
