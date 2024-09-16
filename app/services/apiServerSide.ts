import { cookies } from "next/headers";
import { ErrorModel } from "../models/error_model";

interface Props {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, any>;
  contentType?: string;
}

export const apiServerSide = async <T>({
  url,
  method,
  body,
  contentType,
}: Props): Promise<T> => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value; // Server-side cookies

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
      throw apiError.length ? apiError[0] : { msg: "Unknown error occurred" };
    }

    return await response.json();
  } catch (error: any) {
    console.error(error.msg);
    throw error;
  }
};
