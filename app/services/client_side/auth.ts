import { LoginModel } from "@/app/models/login_model";
import { apiClient } from "@/app/services/apiClient";

export const login = async (email: string, password: string, code?: string, secret?: string): Promise<LoginModel> => {
	const url = `/auths/login`;
	return apiClient<LoginModel>({
		url: url,
		method: "POST",
		body: { email, password, twofa_code: code, twofa_secret: secret },
	});
};

export const forgotPassword = async (email: string): Promise<{ msg: string }> => {
	const url = `/forgot-password/admin`;
	return apiClient<{ msg: string }>({
		url: url,
		method: "POST",
		body: { email },
	});
};

export const resetPassword = async (password: string, token: string): Promise<{ msg: string }> => {
	const url = `/forgot-password/reset`;
	return apiClient<{ msg: string }>({
		url: url,
		method: "POST",
		body: { password, token },
	});
};

export const syncAccount = async (): Promise<Omit<LoginModel, "token">> => {
	const url = "/auths/profile";
	const response = apiClient<Omit<LoginModel, "token">>({ url: url, method: "GET" });

	return response;
};
