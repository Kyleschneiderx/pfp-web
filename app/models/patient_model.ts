export type PatientModel = {
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

export type UserProfile = {
  name: string;
  birthdate: string;
  contact_number: string;
  description: string | null;
  photo: string | null;
};

export type AccountType = {
  id: number;
  value: string;
}

export type UserType = {
  id: number;
  value: string;
}

export type Status = {
  id: number;
  value: string;
}