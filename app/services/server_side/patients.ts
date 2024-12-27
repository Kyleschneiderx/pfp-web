import {
  PatientModel,
  PatientsResponse,
  PatientSurveyModel,
  PfPlanProgressModel,
} from "@/app/models/patient_model";
import { apiServerSide } from "@/app/services/apiServerSide";

export const getPatients = async (
  params: string
): Promise<PatientsResponse> => {
  const url = `/users?${params}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as PatientsResponse;
};

export const getPatientDetails = async (id: string): Promise<PatientModel> => {
  const url = `/users/${id}`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as PatientModel;
};

export const getPatientSurvey = async (
  id: string
): Promise<PatientSurveyModel[]> => {
  const url = `/users/${id}/survey`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as PatientSurveyModel[];
};

export const getPfPlanProgress = async (
  id: string
): Promise<PfPlanProgressModel> => {
  const url = `/users/${id}/pf-plan-progress`;
  const data = await apiServerSide({ url: url, method: "GET" });
  return data as PfPlanProgressModel;
};
