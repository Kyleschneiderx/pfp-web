import Cookies from "js-cookie";
import { ErrorModel } from "../models/error_model";

interface Props {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, any>;
  contentType?: string;
}

export const apiClient = async <T>({
  url,
  method,
  body,
  contentType,
}: Props): Promise<T> => {
  try {
    const token = Cookies.get("token");

    const options: RequestInit = {
      method,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(body &&
          !(body instanceof FormData) && {
            "Content-Type": contentType ?? "application/json",
          }),
      },
    };

    if (body) {
      options.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      const apiError: ErrorModel[] = errorData.error;
      throw apiError.length ? apiError[0] : { msg: "Unknown error occured" };
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};
