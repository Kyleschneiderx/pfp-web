import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { ErrorModel } from "../models/error_model";

interface Props {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, any>;
  retryCount?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const MAX_RETRIES = 3;

export const apiClient = async <T>({
  url,
  method,
  body,
  retryCount = MAX_RETRIES,
}: Props): Promise<T> => {
  const token = Cookies.get("token");

  const config: AxiosRequestConfig = {
    url: `${BASE_URL}${url}`,
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!(body instanceof FormData) && {
        "Content-Type": "application/json",
      }),
    },
    data: body,
    timeout: 600000, // 10 minutes
  };

  const executeRequest = async (retries: number): Promise<AxiosResponse<T>> => {
    try {
      return await axios(config);
    } catch (error: any) {
      if (retries > 0 && error.code === "ERR_NETWORK") {
        console.warn(
          `Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`
        );
        return await executeRequest(retries - 1);
      }
      throw error;
    }
  };

  try {
    const response = await executeRequest(retryCount);
    return response.data;
  } catch (error: any) {
    let apiError: ErrorModel;

    if (error.code === "ECONNABORTED") {
      apiError = { msg: "Timeout of 10 minutes exceeded" };
    } else if (error.response) {
      const status = error.response.status;
      apiError = error.response?.data?.error?.[0] || { msg: error.message };

      if (status === 401) {
        console.warn("Unauthorized - possible invalid or expired token");
        // Handle token refresh or redirect to login here if needed
      }
    } else {
      apiError = { msg: "Network error. Please try again later." };
    }

    console.error(error);
    throw apiError;
  }
};
