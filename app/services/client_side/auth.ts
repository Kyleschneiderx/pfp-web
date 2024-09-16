import { LoginModel } from "@/app/models/login_model";
import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const login = async (
  email: string,
  password: string
): Promise<LoginModel> => {
  const url = `${API_BASE_URL}/auths/login/admin`;
  return apiClient<LoginModel>({
    url: url,
    method: "POST",
    body: { email, password },
  });
};

export const forgotPassword = async (
  email: string
): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/forgot-password/admin`;
  return apiClient<{ msg: string }>({
    url: url,
    method: "POST",
    body: { email },
  });
};

export const resetPassword = async (
  password: string,
  token: string
): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/forgot-password/reset`;
  return apiClient<{ msg: string }>({
    url: url,
    method: "POST",
    body: { password, token },
  });
};
