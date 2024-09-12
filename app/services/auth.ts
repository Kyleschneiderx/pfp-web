import { LoginModel } from "../models/login_model";
import { apiClient } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const login = async (
  email: string,
  password: string
): Promise<LoginModel> => {
  const url = `${API_BASE_URL}/auths/login/admin`;
  return apiClient<LoginModel>(url, "POST", { email, password });
};
