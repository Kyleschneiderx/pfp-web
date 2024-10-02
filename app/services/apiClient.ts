import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ErrorModel } from "../models/error_model";

interface Props {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, any>;
}

export const apiClient = async <T>({
  url,
  method,
  body,
}:
Props): Promise<T> => {
  try {
    const token = Cookies.get("token");

    const config: AxiosRequestConfig = {
      url,
      method,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      data: body,
    };

    const response = await axios(config);

    return response.data;
  } catch (error: any) {
    const apiError: ErrorModel = error.response?.data?.error?.[0] || {
      msg: "Unknown error occurred",
    };
    console.error(apiError.msg);
    throw apiError;
  }
};
