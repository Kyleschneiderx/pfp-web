import { LoginModel } from "@/app/models/login_model";
import { apiClient } from "@/app/services/apiClient";

export const login = async (
  email: string,
  password: string
): Promise<LoginModel> => {
  const url = `/auths/login/admin`;
  console.log(123);
  return apiClient<LoginModel>({
    url: url,
    method: "POST",
    body: { email, password },
  });
};

export const forgotPassword = async (
  email: string
): Promise<{ msg: string }> => {
  const url = `/forgot-password/admin`;
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
  const url = `/forgot-password/reset`;
  return apiClient<{ msg: string }>({
    url: url,
    method: "POST",
    body: { password, token },
  });
};
