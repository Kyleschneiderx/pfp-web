import { ErrorModel } from "../models/error_model";

export const apiClient = async <T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: Record<string, any>
): Promise<T> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      const apiError: ErrorModel[] = errorData.error;
      throw apiError.length ? apiError[0] : { msg: "Unknown error occured" };
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API request failed: ${error[0].msg}`);
    throw error[0];
  }
};
