export type LoginModel = {
  user: {
    id: number;
    email: string;
    type_id: number;
    account_type_id: number;
    status_id: number;
    last_login_at: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    user_profile: UserProfile;
  };
  token: {
    access: string;
    expires: number;
  };
};

interface UserProfile {
  birthdate: string | null;
  contact_number: string | null;
  description: string | null;
  name: string;
  photo: string | null;
}