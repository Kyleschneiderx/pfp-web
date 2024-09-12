import { apiClient } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getPatients = async () => {
  const url = `${API_BASE_URL}/users`;
  const data = await apiClient(url, "GET");
  return data;
};
