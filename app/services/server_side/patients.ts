import { PatientsResponse } from "@/app/models/patient_model";
import { apiServerSide } from "@/app/services/apiServerSide";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getPatients = async (params: string): Promise<PatientsResponse> => {
  const url = `${API_BASE_URL}/users?${params}`;
  console.log(url);
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as PatientsResponse;
};
