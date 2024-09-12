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
  };
  token: {
    access: string;
    expires: number;
  };
};