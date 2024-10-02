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
}: Props): Promise<T> => {
  try {
    const token = Cookies.get("token");

    const config: AxiosRequestConfig = {
      url,
      method,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      data: body,
      timeout: 600000, // 10 minutes
    };

    const response = await axios(config);

    return response.data;
  } catch (error: any) {
    let apiError: ErrorModel;
    if (error.code === "ECONNABORTED") {
      apiError = { msg: "Timeout of 10 minutes exceeded" };
    } else {
      apiError = error.response?.data?.error?.[0] || {
        msg: error.message,
      };
    }

    console.error(apiError.msg);
    throw apiError;
  }
};
