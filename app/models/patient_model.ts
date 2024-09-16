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
};

interface UserProfile {
  name: string;
  birthdate: string;
  contact_number: string;
  description: string | null;
  photo: string | null;
};

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
